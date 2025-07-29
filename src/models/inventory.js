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
      reorderLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
    },
    {
      sequelize,
      modelName: "Inventory",
    }
  );

  return Inventory;
};
