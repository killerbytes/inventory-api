"use strict";

const { Model } = require("sequelize");
const { ORDER_TYPE } = require("../definitions");

class InventoryTransaction extends Model {
  static associate(models) {
    InventoryTransaction.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    InventoryTransaction.belongsTo(models.Inventory, {
      foreignKey: "inventoryId",
      as: "inventory",
    });
  }
}
module.exports = (sequelize, DataTypes) => {
  InventoryTransaction.init(
    {
      inventoryId: { type: DataTypes.INTEGER, allowNull: false },
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
      reference: { type: DataTypes.INTEGER, allowNull: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "InventoryTransaction",
    }
  );

  return InventoryTransaction;
};
