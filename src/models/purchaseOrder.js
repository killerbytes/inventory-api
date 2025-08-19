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
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return PurchaseOrder;
};
