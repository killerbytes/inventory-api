"use strict";
const { UNIT } = require("../definitions");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.ProductCombination, {
        foreignKey: "combinationId",
      });
      Inventory.hasMany(models.SalesOrderItem, {
        foreignKey: "inventoryId",
        as: "salesOrderItems",
      });
    }
  }

  Inventory.init(
    {
      combinationId: DataTypes.INTEGER,
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Inventory",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      unique: ["productVariantId"],
    }
  );

  return Inventory;
};
