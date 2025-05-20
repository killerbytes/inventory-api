const { Model, DataTypes } = require("sequelize");
const Inventory = require("./inventory");
const { INVENTORY_TRANSACTION_TYPE } = require("../utils/definitions");

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

          try {
            // Use Promise.all to properly handle async operations in map
            await Promise.all(
              salesOrder.salesOrderItems.map(async (item) => {
                // 1. Find inventory with transaction option
                const inventory = await sequelize.models.Inventory.findOne({
                  where: { id: item.inventoryId },
                  transaction: options.transaction, // Moved inside findOne options
                });

                if (!inventory) {
                  throw new Error(`${item.inventoryId} not found in inventory`);
                }

                if (inventory.quantity < item.quantity) {
                  throw new Error(
                    `Insufficient quantity for inventory ${inventory.id}. ` +
                      `Available: ${inventory.quantity}, Requested: ${item.quantity}`
                  );
                }

                // 2. Create transaction record with await and transaction option
                await sequelize.models.InventoryTransaction.create(
                  {
                    inventoryId: inventory.id,
                    previousQuantity: inventory.quantity,
                    newQuantity: inventory.quantity - item.quantity,
                    transactionType: INVENTORY_TRANSACTION_TYPE.SALE,
                    orderId: salesOrder.id,
                  },
                  { transaction: options.transaction }
                );

                // 3. Update inventory with transaction option
                await inventory.update(
                  {
                    quantity: sequelize.literal(`quantity - ${item.quantity}`),
                  },
                  { transaction: options.transaction }
                );
              })
            );
          } catch (error) {
            console.error("Error in afterCreate hook:", error);
            throw error; // This will trigger transaction rollback
          }
        },
      },
    }
  );

  return SalesOrder;
};
