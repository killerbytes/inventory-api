"use strict";

const { Model } = require("sequelize");
const { ORDER_TYPE } = require("../definitions");

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
      previousValue: { type: DataTypes.INTEGER, allowNull: false },
      newValue: { type: DataTypes.INTEGER, allowNull: false },
      value: { type: DataTypes.INTEGER, allowNull: false },
      transactionType: { type: DataTypes.STRING, allowNull: false },
      orderId: { type: DataTypes.INTEGER, allowNull: true },
      orderType: {
        type: DataTypes.ENUM(Object.values(ORDER_TYPE)),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "InventoryTransaction",
    }
  );

  return InventoryTransaction;
};
