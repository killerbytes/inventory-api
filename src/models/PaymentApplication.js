const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentApplication extends Model {
    static associate(models) {
      PaymentApplication.belongsTo(models.Payment, { foreignKey: "paymentId" });
      PaymentApplication.belongsTo(models.Invoice, { foreignKey: "invoiceId" });
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
