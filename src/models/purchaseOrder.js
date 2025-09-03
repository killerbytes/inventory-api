const { Model } = require("sequelize");
const { ORDER_STATUS, MODE_OF_PAYMENT } = require("../definitions");
const { format } = require("date-fns");
const getNextSequence = require("../utils/services/getNextSequence");

module.exports = (sequelize, DataTypes) => {
  class PurchaseOrder extends Model {
    static associate(models) {
      PurchaseOrder.belongsTo(models.Supplier, {
        foreignKey: "supplierId",
        as: "supplier",
      });

      PurchaseOrder.hasMany(models.PurchaseOrderItem, {
        foreignKey: "purchaseOrderId",
        as: "purchaseOrderItems",
      });

      PurchaseOrder.hasMany(models.OrderStatusHistory, {
        foreignKey: "purchaseOrderId",
        as: "purchaseOrderStatusHistory",
      });
    }
  }

  PurchaseOrder.init(
    {
      purchaseOrderNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: ORDER_STATUS.PENDING,
        validate: {
          isIn: [Object.values(ORDER_STATUS)],
        },
      },
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
        defaultValue: MODE_OF_PAYMENT.CHECK,
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
      modelName: "PurchaseOrder",
      defaultScope: {
        attributes: { exclude: ["createdAt"] },
      },
    }
  );

  PurchaseOrder.beforeCreate(async (order, options) => {
    const sequelize = order.sequelize || options.sequelize; // ensure sequelize ref

    const now = new Date();
    const yearMonth = format(now, "yyyy-MM"); // e.g. 2025-08

    const nextval = await getNextSequence("purchase_order_seq", sequelize);

    order.purchaseOrderNumber = `PO-${yearMonth}-${String(nextval).padStart(
      4,
      "0"
    )}`;
  });

  return PurchaseOrder;
};
