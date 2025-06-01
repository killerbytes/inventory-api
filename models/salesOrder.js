const { Model, DataTypes } = require("sequelize");
const {
  INVENTORY_TRANSACTION_TYPE,
  SALES_ORDER_STATUS,
  ORDER_TYPE,
} = require("../definitions");

class SalesOrder extends Model {
  static associate(models) {
    SalesOrder.hasMany(models.SalesOrderItem, {
      foreignKey: "orderId",
      as: "salesOrderItems",
    });
    SalesOrder.belongsTo(models.User, {
      foreignKey: "orderBy",
      as: "orderByUser",
    });
    SalesOrder.belongsTo(models.User, {
      foreignKey: "receivedBy",
      as: "receivedByUser",
    });
  }

  static async processCompletedOrder(salesOrder, transaction) {
    const orderWithItems =
      await salesOrder.sequelize.models.SalesOrder.findByPk(salesOrder.id, {
        include: [
          {
            association: "salesOrderItems",
            include: ["inventory"],
          },
        ],
        transaction,
      });

    await Promise.all(
      orderWithItems.salesOrderItems.map(async (item) => {
        const [inventory] =
          await salesOrder.sequelize.models.Inventory.findOrCreate({
            where: { productId: item.inventory.productId },
            defaults: {
              productId: item.inventory.productId,
              quantity: 0,
            },
            transaction,
          });

        await salesOrder.sequelize.models.InventoryTransaction.create(
          {
            inventoryId: inventory.id,
            previousValue: inventory.quantity,
            newValue: inventory.quantity - item.quantity,
            value: item.quantity,
            transactionType: INVENTORY_TRANSACTION_TYPE.SALE,
            orderId: orderWithItems.id,
            orderType: ORDER_TYPE.SALES,
          },
          { transaction }
        );

        await inventory.update(
          {
            quantity: inventory.quantity - item.quantity,
          },
          { transaction }
        );
      })
    );
  }

  static async processCancelledOrder(salesOrder, transaction) {
    const orderWithItems =
      await salesOrder.sequelize.models.SalesOrder.findByPk(salesOrder.id, {
        include: [
          {
            association: "salesOrderItems",
            include: ["inventory"],
          },
        ],
        transaction,
      });

    await Promise.all(
      orderWithItems.salesOrderItems.map(async (item) => {
        const [inventory] =
          await salesOrder.sequelize.models.Inventory.findOrCreate({
            where: { productId: item.inventory.productId },
            defaults: { productId: item.inventoryId, quantity: 0 },
            transaction,
          });

        await salesOrder.sequelize.models.InventoryTransaction.create(
          {
            inventoryId: inventory.id,
            previousValue: inventory.quantity,
            newValue: inventory.quantity + item.quantity,
            value: item.quantity,
            transactionType: INVENTORY_TRANSACTION_TYPE.CANCELLATION,
            orderId: orderWithItems.id,
            orderType: ORDER_TYPE.SALES,
          },
          { transaction }
        );

        await inventory.update(
          {
            quantity: inventory.quantity + item.quantity,
          },
          { transaction }
        );
      })
    );
  }
}

module.exports = (sequelize) => {
  SalesOrder.init(
    {
      customer: { type: DataTypes.STRING, allowNull: false },
      orderDate: { type: DataTypes.DATE, allowNull: false },
      status: {
        type: DataTypes.ENUM(Object.values(SALES_ORDER_STATUS)),
        defaultValue: SALES_ORDER_STATUS.PENDING,
      },
      deliveryDate: { type: DataTypes.DATE },
      receivedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          conditionalRequired(value) {
            if (this.status === SALES_ORDER_STATUS.COMPLETED && !value) {
              throw new Error(
                "receivedDate is required when status is completed"
              );
            }
          },
        },
      },
      totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      receivedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
          conditionalRequired(value) {
            if (this.status === SALES_ORDER_STATUS.COMPLETED && !value) {
              throw new Error(
                "receivedBy is required when status is completed"
              );
            }
          },
        },
      },
      notes: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      modelName: "SalesOrder",
      hooks: {
        afterCreate: async (salesOrder, options) => {
          if (!options.transaction) {
            throw new Error("This operation requires a transaction");
          }

          try {
            if (salesOrder.status === SALES_ORDER_STATUS.COMPLETED) {
              await SalesOrder.processCompletedOrder(
                salesOrder,
                options.transaction
              );
            }
          } catch (error) {
            console.error("Error in afterCreate hook:", error);
            throw error;
          }
        },
        afterUpdate: async (salesOrder, options) => {
          if (!options.transaction) {
            throw new Error("This operation requires a transaction");
          }

          try {
            // Assuming update to cancelled status triggers inventory return
            if (salesOrder.status === SALES_ORDER_STATUS.CANCELLED) {
              await SalesOrder.processCancelledOrder(
                salesOrder,
                options.transaction
              );
            }
          } catch (error) {
            console.error("Error in afterUpdate hook:", error);
            throw error;
          }
        },
      },
    }
  );
  return SalesOrder;
};
