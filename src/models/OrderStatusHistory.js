const { ORDER_STATUS, ORDER_TYPE } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define(
    "OrderStatusHistory",
    {
      purchaseOrderId: DataTypes.INTEGER,
      salesOrderId: DataTypes.INTEGER,
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [Object.values(ORDER_STATUS)],
        },
      },
      changedBy: { type: DataTypes.INTEGER, allowNull: false },
      changedAt: { type: DataTypes.DATE, allowNull: false },
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
