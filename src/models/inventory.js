"use strict";
const { UNIT } = require("../definitions");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.ProductCombination, {
        foreignKey: "combinationId",
        as: "combinations",
      });
      Inventory.hasMany(models.SalesOrderItem, {
        foreignKey: "inventoryId",
        as: "salesOrderItems",
      });
    }
  }

  Inventory.init(
    {
      combinationId: { type: DataTypes.INTEGER, allowNull: false },
      averagePrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      quantity: {
        type: DataTypes.DECIMAL(18, 6),
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Inventory",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      },
      unique: ["productVariantId"],
      paranoid: true,
      deletedAt: "deletedAt",
    }
  );

  return Inventory;
};
