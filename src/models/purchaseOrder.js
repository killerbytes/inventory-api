const { Model, DataTypes } = require("sequelize");
const { ORDER_STATUS, MODE_OF_PAYMENT } = require("../definitions");

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

module.exports = (sequelize) => {
  PurchaseOrder.init(
    {
      purchaseOrderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      supplierId: {
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
        defaultValue: MODE_OF_PAYMENT.CHECK,
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
      modelName: "PurchaseOrder",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return PurchaseOrder;
};
