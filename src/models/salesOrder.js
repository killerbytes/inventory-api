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
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(Object.values(ORDER_STATUS)),
        defaultValue: ORDER_STATUS.PENDING,
      },
      deliveryDate: {
        type: DataTypes.DATE,
      },
      cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      internalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      modeOfPayment: {
        type: DataTypes.ENUM(Object.values(MODE_OF_PAYMENT)),
        defaultValue: MODE_OF_PAYMENT.CASH,
      },
      checkNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
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
