const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentApplication extends Model {
    static associate(models) {
      PaymentApplication.belongsTo(models.Payment, {
        foreignKey: "paymentId",
        as: "payment",
      });
      PaymentApplication.belongsTo(models.Invoice, {
        foreignKey: "invoiceId",
        as: "invoice",
      });
    }
  }

  PaymentApplication.init(
    {
      amountApplied: DataTypes.DECIMAL(10, 2),
      amountRemaining: DataTypes.DECIMAL(10, 2),
    },
    {
      sequelize,
      modelName: "PaymentApplication",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return PaymentApplication;
};
