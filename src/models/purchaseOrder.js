const { Model, DataTypes } = require("sequelize");
const {
  INVENTORY_TRANSACTION_TYPE,
  ORDER_STATUS,
} = require("../utils/definitions");

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
}

module.exports = (sequelize) => {
  PurchaseOrder.init(
    {
      supplierId: { type: DataTypes.INTEGER, allowNull: false },
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
      orderBy: { type: DataTypes.INTEGER, allowNull: false },
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
      modelName: "PurchaseOrder",
      hooks: {
        afterUpdate: async (purchaseOrder) => {
          try {
            if (purchaseOrder.status === ORDER_STATUS.COMPLETED) {
              purchaseOrder.purchaseOrderItems.map(async (item) => {
                const [inventory] =
                  await sequelize.models.Inventory.findOrCreate({
                    where: {
                      productId: item.productId,
                    },
                    defaults: {
                      productId: item.productId,
                      quantity: 0,
                    },
                  });
                sequelize.models.InventoryTransaction.create({
                  inventoryId: inventory.id,
                  previousQuantity: inventory.quantity,
                  newQuantity: inventory.quantity + item.quantity,
                  transactionType: INVENTORY_TRANSACTION_TYPE.PURCHASE, //: INVENTORY_TRANSACTION_TYPE.PURCHASE,
                  orderId: purchaseOrder.id,
                });
                inventory.quantity += item.quantity;
                inventory.save();
              });
            }
          } catch (error) {
            throw error;
          }
        },
      },
    }
  );

  return PurchaseOrder;
};
