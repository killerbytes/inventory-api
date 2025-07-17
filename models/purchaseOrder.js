const { Model, DataTypes } = require("sequelize");
const {
  INVENTORY_TRANSACTION_TYPE,
  PURCHASE_ORDER_STATUS,
  ORDER_TYPE,
  MODE_OF_PAYMENT,
} = require("../definitions");

class PurchaseOrder extends Model {
  static associate(models) {
    PurchaseOrder.belongsTo(models.Supplier, {
      foreignKey: "supplierId",
      as: "supplier",
    });

    PurchaseOrder.hasMany(models.PurchaseOrderItem, {
      foreignKey: "orderId",
      as: "purchaseOrderItems",
    });

    PurchaseOrder.belongsTo(models.User, {
      foreignKey: "orderBy",
      as: "orderByUser",
    });

    PurchaseOrder.belongsTo(models.User, {
      foreignKey: "receivedBy",
      as: "receivedByUser",
    });

    PurchaseOrder.belongsTo(models.User, {
      foreignKey: "completedBy",
      as: "completedByUser",
    });

    PurchaseOrder.belongsTo(models.User, {
      foreignKey: "cancelledBy",
      as: "cancelledByUser",
    });
  }

  // static async processInventoryUpdates(purchaseOrder, transaction) {
  //   const { status, purchaseOrderItems, id } = purchaseOrder;

  //   if (status === PURCHASE_ORDER_STATUS.COMPLETED) {
  //     await this.handleCompletedOrder(
  //       purchaseOrder.sequelize,
  //       purchaseOrderItems,
  //       id,
  //       transaction
  //     );
  //   } else if (status === PURCHASE_ORDER_STATUS.CANCELLED) {
  //     await this.handleCancelledOrder(
  //       purchaseOrder.sequelize,
  //       purchaseOrderItems,
  //       id,
  //       transaction
  //     );
  //   }
  // }

  // static async handleCompletedOrder(sequelize, items, orderId, transaction) {
  //   await Promise.all(
  //     items.map(async (item) => {
  //       const [inventory] = await sequelize.models.Inventory.findOrCreate({
  //         where: { productId: item.productId },
  //         defaults: { productId: item.productId, quantity: 0 },
  //         transaction,
  //       });

  //       await sequelize.models.InventoryTransaction.create(
  //         {
  //           inventoryId: inventory.id,
  //           previousValue: inventory.quantity,
  //           newValue: inventory.quantity + item.quantity,
  //           value: item.quantity,
  //           transactionType: INVENTORY_TRANSACTION_TYPE.PURCHASE,
  //           orderId,
  //           orderType: ORDER_TYPE.PURCHASE,
  //         },
  //         { transaction }
  //       );

  //       await inventory.update(
  //         { quantity: inventory.quantity + item.quantity },
  //         { transaction }
  //       );
  //     })
  //   );
  // }

  // static async handleCancelledOrder(sequelize, items, orderId, transaction) {
  //   await Promise.all(
  //     items.map(async (item) => {
  //       const [inventory] = await sequelize.models.Inventory.findOrCreate({
  //         where: { productId: item.productId },
  //         defaults: { productId: item.productId, quantity: 0 },
  //         transaction,
  //       });

  //       await sequelize.models.InventoryTransaction.create(
  //         {
  //           inventoryId: inventory.id,
  //           previousValue: inventory.quantity,
  //           newValue: inventory.quantity - item.quantity,
  //           value: item.quantity,
  //           transactionType: INVENTORY_TRANSACTION_TYPE.CANCELLATION,
  //           orderId,
  //           orderType: ORDER_TYPE.PURCHASE,
  //         },
  //         { transaction }
  //       );

  //       await inventory.update(
  //         { quantity: inventory.quantity - item.quantity },
  //         { transaction }
  //       );
  //     })
  //   );
  // }
}

module.exports = (sequelize) => {
  PurchaseOrder.init(
    {
      purchaseOrderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
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
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PurchaseOrder",
    }
  );

  return PurchaseOrder;
};
