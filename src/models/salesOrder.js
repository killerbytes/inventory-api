const { Model, DataTypes } = require("sequelize");
const Inventory = require("./inventory");
const {
  INVENTORY_TRANSACTION_TYPE,
  ORDER_STATUS,
} = require("../utils/definitions");

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
}

module.exports = (sequelize) => {
  SalesOrder.init(
    {
      customer: { type: DataTypes.STRING, allowNull: false },
      orderDate: { type: DataTypes.DATE, allowNull: false },
      status: {
        type: DataTypes.ENUM("DRAFT", "PENDING", "COMPLETED", "CANCELLED"),
        defaultValue: "Pending",
      },
      deliveryDate: { type: DataTypes.DATE },
      receivedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          conditionalRequired(value) {
            if (this.status === "COMPLETED" && !value) {
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
            if (this.status === "COMPLETED" && !value) {
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
          const { transaction } = options;

          try {
            const orderWithItems = await sequelize.models.SalesOrder.findByPk(
              salesOrder.id,
              {
                include: [
                  {
                    association: "salesOrderItems",
                    include: ["inventory"],
                  },
                ],
                transaction,
              }
            );

            console.log(22333, orderWithItems);

            if (orderWithItems.status === ORDER_STATUS.COMPLETED) {
              await Promise.all(
                orderWithItems.salesOrderItems.map(async (item) => {
                  console.log(11, item);

                  const [inventory] =
                    await sequelize.models.Inventory.findOrCreate({
                      where: { productId: item.inventory.productId },
                      defaults: {
                        productId: item.inventory.productId,
                        quantity: 0,
                      },
                      transaction,
                    });

                  await sequelize.models.InventoryTransaction.create(
                    {
                      inventoryId: inventory.id,
                      previousQuantity: inventory.quantity,
                      newQuantity: inventory.quantity - item.quantity,
                      quantity: item.quantity,
                      transactionType: INVENTORY_TRANSACTION_TYPE.SALE,
                      orderId: orderWithItems.id,
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
          } catch (error) {
            console.error("Error in afterCreate hook:", error);
            throw error; // This will trigger transaction rollback
          }
        },
        afterUpdate: async (salesOrder, options) => {
          if (!options.transaction) {
            throw new Error("This operation requires a transaction");
          }
          const { transaction } = options;

          try {
            const orderWithItems = await sequelize.models.SalesOrder.findByPk(
              salesOrder.id,
              {
                include: [
                  {
                    association: "salesOrderItems",
                    include: ["inventory"],
                  },
                ],
                transaction,
              }
            );
            await Promise.all(
              orderWithItems.salesOrderItems.map(async (item) => {
                console.log(43455, item.inventory);

                const [inventory] =
                  await sequelize.models.Inventory.findOrCreate({
                    where: { productId: item.inventory.productId },
                    defaults: { productId: item.inventoryId, quantity: 0 },
                    transaction,
                  });

                await sequelize.models.InventoryTransaction.create(
                  {
                    inventoryId: inventory.id,
                    previousQuantity: inventory.quantity,
                    newQuantity: inventory.quantity + item.quantity,
                    quantity: item.quantity,
                    transactionType: INVENTORY_TRANSACTION_TYPE.CANCELLATION,
                    orderId: orderWithItems.id,
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
          } catch (error) {
            throw error;
          }
        },
      },
    }
  );
  return SalesOrder;
};
