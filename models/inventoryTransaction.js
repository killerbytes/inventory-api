"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InventoryTransaction extends Model {
    static associate(models) {
      // Make sure to reference models through the db object
      InventoryTransaction.belongsTo(models.Inventory, {
        foreignKey: "inventoryId",
        as: "inventory",
      });
    }
  }

  InventoryTransaction.init(
    {
      inventoryId: { type: DataTypes.INTEGER, allowNull: false },
      previousQuantity: { type: DataTypes.INTEGER, allowNull: false },
      newQuantity: { type: DataTypes.INTEGER, allowNull: false },
      transactionType: { type: DataTypes.STRING, allowNull: false },
      orderId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      sequelize,
      modelName: "InventoryTransaction",
    }
  );

  return InventoryTransaction;
};
