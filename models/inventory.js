"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });
      Inventory.hasMany(models.InventoryTransaction, {
        foreignKey: "inventoryId",
        as: "inventoryTransactions",
      });
      Inventory.hasMany(models.SalesOrderItem, {
        foreignKey: "inventoryId",
        as: "salesOrderItems",
      });
    }
    // static async processInventoryUpdates(inventory, transaction) {
    //   const { id, price } = inventory;
    //   const previousValues = inventory._previousDataValues;

    //   await inventory.sequelize.models.InventoryTransaction.create(
    //     {
    //       inventoryId: id,
    //       previousValue: previousValues.price,
    //       newValue: price,
    //       value: price,
    //       transactionType: INVENTORY_TRANSACTION_TYPE.ADJUSTMENT,
    //       orderId: null,
    //       orderType: null,
    //     },
    //     { transaction }
    //   );
    // }
  }

  Inventory.init(
    {
      productId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Inventory",
      // hooks: {
      //   afterUpdate: async (inventory, options) => {
      //     if (!options.transaction) {
      //       throw new Error("This operation requires a transaction");
      //     }

      //     try {
      //       await Inventory.processInventoryUpdates(
      //         inventory,
      //         options.transaction
      //       );
      //     } catch (error) {
      //       console.error("Error in afterCreate hook:", error);
      //       throw error;
      //     }
      //   },
      // },
    }
  );

  return Inventory;
};
