const { PURCHASE_ORDER_STATUS } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  const PurchaseOrderStatusHistory = sequelize.define(
    "PurchaseOrderStatusHistory",
    {
      purchaseOrderId: DataTypes.INTEGER,
      status: DataTypes.ENUM(Object.values(PURCHASE_ORDER_STATUS)),
      changedBy: DataTypes.INTEGER,
      changedAt: DataTypes.DATE,
    },
    {
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      paranoid: true,
    }
  );

  PurchaseOrderStatusHistory.associate = (models) => {
    PurchaseOrderStatusHistory.belongsTo(models.PurchaseOrder, {
      foreignKey: "purchaseOrderId",
      as: "purchaseOrder",
    });

    PurchaseOrderStatusHistory.belongsTo(models.User, {
      foreignKey: "changedBy",
      as: "user",
    });
  };

  return PurchaseOrderStatusHistory;
};
