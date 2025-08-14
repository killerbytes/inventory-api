const { ORDER_STATUS, ORDER_TYPE } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define(
    "OrderStatusHistory",
    {
      purchaseOrderId: DataTypes.INTEGER,
      salesOrderId: DataTypes.INTEGER,
      status: DataTypes.ENUM(Object.values(ORDER_STATUS)),
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

  OrderStatusHistory.associate = (models) => {
    OrderStatusHistory.belongsTo(models.PurchaseOrder, {
      foreignKey: "purchaseOrderId",
      as: "purchaseOrderStatusHistory",
    });
    OrderStatusHistory.belongsTo(models.SalesOrder, {
      foreignKey: "salesOrderId",
      as: "salesOrderStatusHistory",
    });

    OrderStatusHistory.belongsTo(models.User, {
      foreignKey: "changedBy",
      as: "user",
    });
  };

  return OrderStatusHistory;
};
