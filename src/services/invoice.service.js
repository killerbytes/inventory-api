const db = require("../models");
const { invoiceSchema } = require("../schemas");
const {
  INVOICE_STATUS,
  ORDER_STATUS,
  PAGINATION,
} = require("../definitions.js");
const authService = require("./auth.service.js");
const { getMappedVariantValues } = require("../utils/mapped.js");
const ApiError = require("./ApiError.js");
const { getTotalAmount, getAmount } = require("../utils/compute.js");
const {
  sequelize,
  VariantValue,
  Invoice,
  InvoiceLine,
  ProductCombination,
  Product,
  OrderStatusHistory,
  GoodReceipt,
  VariantType,
  Category,
} = db;

module.exports = {
  async get(id) {
    try {
      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: InvoiceLine,
            as: "lines",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: db.PaymentApplication,
            as: "applications",
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
    const { error } = invoiceSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    const user = await authService.getCurrent();
    const transaction = await sequelize.transaction();
    try {
      const result = await Invoice.create(
        { ...payload, changedBy: user.id },
        {
          include: [
            {
              model: InvoiceLine,
              as: "lines",
            },
          ],
          transaction,
        }
      );
      const lines = payload.lines.map((line) => ({
        ...line,
        invoiceId: result.id,
      }));
      console.log(33, lines);

      await InvoiceLine.bulkCreate(lines, { transaction });
      // const l = await InvoiceLine.findAll();
      // console.log(l);

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
    // try {
    //   const invoice = await Invoice.findByPk(id, { transaction });
    //   if (!invoice) {
    //     throw new Error("Invoice not found");
    //   }
    //   await Invoice.update(payload, { where: { id }, transaction });
    //   await InvoiceLine.destroy({ where: { invoiceId: id }, transaction });
    //   const lines = payload.invoiceLines.map((line) => ({
    //     ...line,
    //     invoiceId: id,
    //   }));

    //   await InvoiceLine.bulkCreate(lines, { transaction });
    //   transaction.commit();
    //   return invoice;
    // } catch (error) {
    //   console.log(error);
    //   transaction.rollback();
    //   throw error;
    // }
  },

  async delete(id) {
    const transaction = await db.sequelize.transaction();
    try {
      const invoice = await Invoice.findByPk(id, { transaction });
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (invoice.status === ORDER_STATUS.PENDING) {
        await updateOrder(
          {
            status: ORDER_STATUS.VOID,
          },
          invoice,
          transaction,
          false
        );
      } else {
        throw new Error("Invoice is not in a valid state");
      }
      const user = await authService.getCurrent();
      await OrderStatusHistory.create(
        {
          invoiceId: invoice.id,
          status: ORDER_STATUS.VOID,
          changedBy: user.id,
          changedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          transaction,
        }
      );

      transaction.commit();
      return invoice;
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
      sort,
    } = params;
    const where = {};

    // Build the where clause

    // Search by name if query exists
    if (q) {
      where.name = { [Op.like]: `%${q}%` };
    }
    if (status) {
      where.status = status;
    }

    // Add date filtering if dates are provided
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

      // if (sort) {
      //   order.push([sort , order || "ASC"]);
      // }
      const { count, rows } = await Invoice.findAndCountAll({
        // limit,
        // offset,
        // order,
        // where: Object.keys(where).length ? where : undefined, // Only include where if it has conditions
        nest: true,
        distinct: true,
        include: [
          {
            model: db.InvoiceLine,
            as: "lines",
          },
          {
            model: db.Supplier,
            as: "supplier",
          },
        ],
      });

      return {
        data: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
