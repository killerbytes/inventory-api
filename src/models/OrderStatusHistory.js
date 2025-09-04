const { ORDER_STATUS, ORDER_TYPE } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define(
    "OrderStatusHistory",
    {
      goodReceiptId: DataTypes.INTEGER,
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
    }
  );

  OrderStatusHistory.associate = (models) => {
    OrderStatusHistory.belongsTo(models.GoodReceipt, {
      foreignKey: "goodReceiptId",
      as: "goodReceiptStatusHistory",
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
