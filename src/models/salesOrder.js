const { Model, DataTypes } = require("sequelize");
const { ORDER_STATUS, MODE_OF_PAYMENT } = require("../definitions");

class SalesOrder extends Model {
  static associate(models) {
    SalesOrder.belongsTo(models.Customer, {
      foreignKey: "customerId",
      as: "customer",
    });

    SalesOrder.hasMany(models.SalesOrderItem, {
      foreignKey: "salesOrderId",
      as: "salesOrderItems",
    });

    SalesOrder.hasMany(models.OrderStatusHistory, {
      foreignKey: "salesOrderId",
      as: "salesOrderStatusHistory",
    });
  }
}

module.exports = (sequelize) => {
  SalesOrder.init(
    {
      salesOrderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      customerId: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM(Object.values(ORDER_STATUS)),
        defaultValue: ORDER_STATUS.PENDING,
        allowNull: false,
      },
      orderDate: { type: DataTypes.DATE, allowNull: false },
      isDelivery: { type: DataTypes.BOOLEAN, defaultValue: false },
      isDeliveryCompleted: DataTypes.BOOLEAN,
      deliveryAddress: DataTypes.TEXT,
      deliveryInstructions: DataTypes.TEXT,
      deliveryDate: DataTypes.DATE,
      cancellationReason: DataTypes.TEXT,
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      notes: DataTypes.TEXT,
      internalNotes: DataTypes.TEXT,
      modeOfPayment: {
        type: DataTypes.ENUM(Object.values(MODE_OF_PAYMENT)),
        allowNull: false,
        defaultValue: MODE_OF_PAYMENT.CASH,
      },
      checkNumber: {
        type: DataTypes.STRING,
        unique: true,
      },
      dueDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "SalesOrder",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return SalesOrder;
};
