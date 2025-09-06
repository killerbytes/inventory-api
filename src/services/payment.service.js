const { INVOICE_STATUS } = require("../definitions.js");
const db = require("../models/index.js");
const { paymentSchema } = require("../schemas.js");
const ApiError = require("./ApiError.js");
const authService = require("./auth.service.js");
const { sequelize, Payment, PaymentApplication, Invoice } = db;

module.exports = {
  async get(id) {
    try {
      const payment = await Payment.findByPk(id, {
        include: [
          {
            model: db.Supplier,
            as: "supplier",
          },
          {
            model: db.PaymentApplication,
            as: "applications",
          },
        ],
        nest: true,
      });
      if (!payment) {
        throw ApiError.notFound("Payment not found");
      }
      return payment;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { error } = paymentSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    const user = await authService.getCurrent();
    const transaction = await sequelize.transaction();
    try {
      const payment = await Payment.create(
        { ...payload, changedBy: user.id },
        {
          transaction,
        }
      );

      let totalApplied = 0;
      for (const app of payload.applications) {
        const invoice = await Invoice.findByPk(app.invoiceId, {
          transaction,
        });
        if (!invoice) {
          throw new Error("Invoice not found");
        }

        const invoicePaid = await PaymentApplication.sum("amountApplied", {
          where: { invoiceId: invoice.id },
          transaction,
        });
        const alreadyPaid = invoicePaid || 0;
        const remaining = Number(invoice.totalAmount) - alreadyPaid;

        if (app.amountApplied > remaining) {
          throw new Error(
            `Cannot apply ₱${app.amountApplied} — only ₱${remaining} remaining on invoice ${invoice.id}`
          );
        }

        await PaymentApplication.create(
          {
            paymentId: payment.id,
            invoiceId: invoice.id,
            amountApplied: app.amountApplied,
            amountRemaining: remaining - app.amountApplied,
          },
          { transaction }
        );
        totalApplied += app.amountApplied;

        if (app.amountApplied === remaining) {
          await invoice.update(
            { status: INVOICE_STATUS.PAID },
            { transaction }
          );
        } else {
          await invoice.update(
            { status: INVOICE_STATUS.PARTIALLY_PAID },
            { transaction }
          );
        }
      }

      if (totalApplied > payload.amount) {
        throw new Error(
          `Total applied ₱${totalApplied} exceeds payment amount ₱${payload.amount}`
        );
      }

      transaction.commit();
      return payment;
    } catch (error) {
      console.log(1, error);
      transaction.rollback();

      throw error;
    }
  },

  async update(id, payload) {
    const { error } = paymentSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }

    const transaction = await sequelize.transaction();
    try {
      const invoice = await Payment.findByPk(id, { transaction });
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
          payload.status === INVOICE_STATUS.PARTIAL:
          break;
        case invoice.status === INVOICE_STATUS.PARTIAL &&
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
      const invoice = await Payment.findByPk(id, { transaction });
      if (!invoice) {
        throw new Error("Payment not found");
      }

      if (invoice.status !== ORDER_STATUS.DRAFT) {
        throw new Error("Payment is not in a valid state");
      }

      transaction.commit();
      const deleted = await Payment.destroy({ where: { id } });
      return deleted > 0;
    } catch (error) {
      console.log(error);
      transaction.rollback();
      throw error;
    }
  },
};
