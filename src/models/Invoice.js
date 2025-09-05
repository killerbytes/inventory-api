const { Model } = require("sequelize");
const { INVOICE_STATUS } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.Supplier, {
        foreignKey: "supplierId",
        as: "supplier",
      });
      Invoice.hasMany(models.InvoiceLine, {
        foreignKey: "invoiceId",
        as: "lines",
      });
      Invoice.hasMany(models.PaymentApplication, {
        foreignKey: "invoiceId",
        as: "applications",
      });
    }
  }

  Invoice.init(
    {
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      invoiceDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "DRAFT",
        allowNull: false,
        validate: {
          isIn: [Object.values(INVOICE_STATUS)],
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      notes: DataTypes.STRING,
      changedBy: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "Invoice",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return Invoice;
};
