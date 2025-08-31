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
        type: DataTypes.STRING,
        defaultValue: ORDER_STATUS.PENDING,
        allowNull: false,
        validate: {
          isIn: [Object.values(ORDER_STATUS)],
        },
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
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: MODE_OF_PAYMENT.CASH,
        validate: {
          isIn: [Object.values(MODE_OF_PAYMENT)],
        },
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

  SalesOrder.beforeCreate(async (order, options) => {
    const sequelize = order.sequelize || options.sequelize; // ensure sequelize ref

    const now = new Date();
    const yearMonth = format(now, "yyyy-MM"); // e.g. 2025-08

    const nextval = await getNextSequence("sales_order_seq", sequelize);

    order.salesOrderNumber = `SO-${yearMonth}-${String(nextval).padStart(
      4,
      "0"
    )}`;
  });

  return SalesOrder;
};
