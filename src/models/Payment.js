const { Model } = require("sequelize");
const { INVOICE_STATUS } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Supplier, {
        foreignKey: "supplierId",
        as: "supplier",
      });
      Payment.hasMany(models.PaymentApplication, {
        foreignKey: "paymentId",
        as: "applications",
      });
      Payment.belongsTo(models.User, {
        foreignKey: "changedBy",
        as: "user",
      });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      paymentDate: DataTypes.DATE,
      referenceNo: DataTypes.STRING,
      amount: DataTypes.DECIMAL(10, 2),
      notes: DataTypes.STRING,
      changedBy: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "Payment",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return Payment;
};
