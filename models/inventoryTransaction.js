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
      // previousValue: { type: DataTypes.DECIMAL, allowNull: false },
      previousValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      newValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      transactionType: { type: DataTypes.STRING, allowNull: false },
      orderId: { type: DataTypes.INTEGER, allowNull: true },
      orderType: {
        type: DataTypes.ENUM(Object.values(ORDER_TYPE)),
        allowNull: true,
      },
      userId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "InventoryTransaction",
    }
  );

  return InventoryTransaction;
};
