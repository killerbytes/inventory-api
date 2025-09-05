const { Model } = require("sequelize");
const { INVOICE_STATUS } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  class InvoiceLine extends Model {
    static associate(models) {
      InvoiceLine.belongsTo(models.Invoice, { foreignKey: "invoiceId" });
      InvoiceLine.belongsTo(models.GoodReceipt, {
        foreignKey: "goodReceiptId",
      });
    }
  }

  InvoiceLine.init(
    {
      amount: DataTypes.DECIMAL(10, 2),
    },
    {
      sequelize,
      modelName: "InvoiceLine",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );
  InvoiceLine.beforeBulkCreate(async (invoiceLines, options) => {});
  InvoiceLine.afterBulkCreate(async (invoiceLines, options) => {
    console.log(33, invoiceLines);
  });

  return InvoiceLine;
};
