const { Model, DataTypes } = require("sequelize");
const { PURCHASE_ORDER_STATUS, MODE_OF_PAYMENT } = require("../definitions");

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

    PurchaseOrder.hasMany(models.PurchaseOrderStatusHistory, {
      foreignKey: "purchaseOrderId",
      as: "statusHistory",
    });

    // PurchaseOrder.belongsTo(models.User, {
    //   foreignKey: "orderBy",
    //   as: "orderByUser",
    // });

    // PurchaseOrder.belongsTo(models.User, {
    //   foreignKey: "receivedBy",
    //   as: "receivedByUser",
    // });

    // PurchaseOrder.belongsTo(models.User, {
    //   foreignKey: "completedBy",
    //   as: "completedByUser",
    // });

    // PurchaseOrder.belongsTo(models.User, {
    //   foreignKey: "cancelledBy",
    //   as: "cancelledByUser",
    // });
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
        type: DataTypes.ENUM(Object.values(PURCHASE_ORDER_STATUS)),
        defaultValue: PURCHASE_ORDER_STATUS.PENDING,
      },
      deliveryDate: {
        type: DataTypes.DATE,
      },
      /*
      orderBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      receivedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      receivedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          conditionalRequired(value) {
            if (this.status === PURCHASE_ORDER_STATUS.COMPLETED && !value) {
              throw new Error(
                "receivedDate is required when status is completed"
              );
            }
          },
        },
      },
      completedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      completedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelledBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      cancelledDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      */
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
