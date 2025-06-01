const { Model, DataTypes } = require("sequelize");
const {
  INVENTORY_TRANSACTION_TYPE,
  PURCHASE_ORDER_STATUS,
  ORDER_TYPE,
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
  }

  static async processInventoryUpdates(purchaseOrder, transaction) {
    const { status, purchaseOrderItems, id } = purchaseOrder;

    if (status === PURCHASE_ORDER_STATUS.COMPLETED) {
      await this.handleCompletedOrder(
        purchaseOrder.sequelize,
        purchaseOrderItems,
        id,
        transaction
      );
    } else if (status === PURCHASE_ORDER_STATUS.CANCELLED) {
      await this.handleCancelledOrder(
        purchaseOrder.sequelize,
        purchaseOrderItems,
        id,
        transaction
      );
    }
  }

  static async handleCompletedOrder(sequelize, items, orderId, transaction) {
    await Promise.all(
      items.map(async (item) => {
        const [inventory] = await sequelize.models.Inventory.findOrCreate({
          where: { productId: item.productId },
          defaults: { productId: item.productId, quantity: 0 },
          transaction,
        });

        await sequelize.models.InventoryTransaction.create(
          {
            inventoryId: inventory.id,
            previousValue: inventory.quantity,
            newValue: inventory.quantity + item.quantity,
            value: item.quantity,
            transactionType: INVENTORY_TRANSACTION_TYPE.PURCHASE,
            orderId,
            orderType: ORDER_TYPE.PURCHASE,
          },
          { transaction }
        );

        await inventory.update(
          { quantity: inventory.quantity + item.quantity },
          { transaction }
        );
      })
    );
  }

  static async handleCancelledOrder(sequelize, items, orderId, transaction) {
    await Promise.all(
      items.map(async (item) => {
        const [inventory] = await sequelize.models.Inventory.findOrCreate({
          where: { productId: item.productId },
          defaults: { productId: item.productId, quantity: 0 },
          transaction,
        });

        await sequelize.models.InventoryTransaction.create(
          {
            inventoryId: inventory.id,
            previousValue: inventory.quantity,
            newValue: inventory.quantity - item.quantity,
            value: item.quantity,
            transactionType: INVENTORY_TRANSACTION_TYPE.CANCELLATION,
            orderId,
            orderType: ORDER_TYPE.PURCHASE,
          },
          { transaction }
        );

        await inventory.update(
          { quantity: inventory.quantity - item.quantity },
          { transaction }
        );
      })
    );
  }
}

module.exports = (sequelize) => {
  PurchaseOrder.init(
    {
      supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(Object.values(PURCHASE_ORDER_STATUS)),
        defaultValue: PURCHASE_ORDER_STATUS.PENDING,
      },
      deliveryDate: {
        type: DataTypes.DATE,
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
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      orderBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receivedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
          conditionalRequired(value) {
            if (this.status === PURCHASE_ORDER_STATUS.COMPLETED && !value) {
              throw new Error(
                "receivedBy is required when status is completed"
              );
            }
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "PurchaseOrder",
      hooks: {
        afterUpdate: async (purchaseOrder, options) => {
          if (!options.transaction) {
            throw new Error("This operation requires a transaction");
          }

          try {
            await PurchaseOrder.processInventoryUpdates(
              purchaseOrder,
              options.transaction
            );
          } catch (error) {
            throw error;
          }
        },
      },
    }
  );

  return PurchaseOrder;
};
