const db = require("../models");
const { invoiceSchema, invoiceSchemaCreate } = require("../schemas");
const {
  INVOICE_STATUS,
  ORDER_STATUS,
  PAGINATION,
} = require("../definitions.js");
const authService = require("./auth.service.js");
const ApiError = require("./ApiError.js");
const { sequelize, Invoice, InvoiceLine, GoodReceipt } = db;

module.exports = {
  async get(id) {
    try {
      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: InvoiceLine,
            as: "invoiceLines",
            attributes: { exclude: ["createdAt", "updatedAt"] },
            include: [
              {
                model: db.GoodReceipt,
                as: "goodReceipt",
              },
            ],
          },
          {
            model: db.PaymentApplication,
            as: "applications",
            include: [
              {
                model: db.Payment,
                as: "payment",
                include: [
                  {
                    model: db.User,
                    as: "user",
                  },
                ],
              },
            ],
          },
        ],
        nest: true,
      });
      if (!invoice) {
        throw ApiError.notFound("Invoice not found");
      }
      return invoice;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { error } = invoiceSchemaCreate.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    const user = await authService.getCurrent();
    const transaction = await sequelize.transaction();
    try {
      const totalAmount = payload.invoiceLines.reduce(
        (acc, item) => acc + item.amount,
        0
      );
      const result = await Invoice.create(
        { ...payload, totalAmount, changedBy: user.id },
        {
          include: [
            {
              model: InvoiceLine,
              as: "invoiceLines",
            },
          ],
          transaction,
        }
      );

      transaction.commit();
      return result;
    } catch (error) {
      console.log(1, error);
      transaction.rollback();

      throw error;
    }
  },

  async update(id, payload) {
    const { error } = invoiceSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }

    const transaction = await sequelize.transaction();
    try {
      const invoice = await Invoice.findByPk(id, { transaction });
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      switch (true) {
        case invoice.status === INVOICE_STATUS.DRAFT &&
          payload.status === INVOICE_STATUS.DRAFT:
        case invoice.status === INVOICE_STATUS.DRAFT &&
          payload.status === INVOICE_STATUS.POSTED:
          await updateInvoice(invoice, payload, true, transaction);
          break;
        case invoice.status === INVOICE_STATUS.POSTED &&
          payload.status === INVOICE_STATUS.PARTIALLY_PAID:
          break;
        case invoice.status === INVOICE_STATUS.PARTIALLY_PAID &&
          payload.status === INVOICE_STATUS.PAID:
          break;
        default:
          throw new Error(
            `Invalid status change from ${invoice.status} to ${payload.status}`
          );
      }

      transaction.commit();

      return;
    } catch (error) {
      console.log(error);
      transaction.rollback();
      throw error;
    }
  },

  async delete(id) {
    const transaction = await db.sequelize.transaction();
    try {
      const invoice = await Invoice.findByPk(id, { transaction });
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (invoice.status !== ORDER_STATUS.DRAFT) {
        throw new Error("Invoice is not in a valid state");
      }

      transaction.commit();
      const deleted = await Invoice.destroy({ where: { id } });
      return deleted > 0;
    } catch (error) {
      console.log(error);
      transaction.rollback();
      throw error;
    }
  },
  async getPaginated(params) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION,
      q,
      startDate,
      endDate,
      status,
      sort = "id",
    } = params;
    const where = {};

    if (q) {
      where.name = { [Op.like]: `%${q}%` };
    }
    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.updatedAt = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.updatedAt[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.updatedAt[Op.lte] = end;
      }
    }

    const offset = (page - 1) * limit;

    try {
      const order = [];

      if (sort) {
        order.push([sort, params.order || "ASC"]);
      }
      const { count, rows } = await Invoice.findAndCountAll({
        // limit,
        // offset,
        order,
        // where: Object.keys(where).length ? where : undefined, // Only include where if it has conditions
        // nest: true,
        distinct: true,
        include: [
          {
            model: db.InvoiceLine,
            as: "invoiceLines",
          },
          {
            model: db.Supplier,
            as: "supplier",
          },
        ],
      });

      return {
        data: rows,
        // total: count,
        // totalPages: Math.ceil(count / limit),
        // currentPage: page,np
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

const updateInvoice = async (
  invoice,
  payload,
  updateLines = false,
  transaction
) => {
  const res = await invoice.update(
    {
      ...payload,
      totalAmount: payload.invoiceLines.reduce(
        (acc, item) => acc + item.amount,
        0
      ),
    },
    { transaction }
  );
  if (payload.status === INVOICE_STATUS.POSTED) {
    const lines = await InvoiceLine.findAll({
      where: { invoiceId: invoice.id },
      transaction,
    });
    for (const line of lines) {
      await GoodReceipt.update(
        { status: ORDER_STATUS.COMPLETED },
        { where: { id: line.goodReceiptId }, transaction }
      );
    }
  }
  if (updateLines) {
    const lines = payload.invoiceLines.map((line) => ({
      ...line,
      invoiceId: invoice.id,
    }));

    await InvoiceLine.destroy({
      where: { invoiceId: invoice.id },
      transaction,
    });
    await InvoiceLine.bulkCreate(lines, { transaction });
  }
};
