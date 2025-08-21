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
      combinationId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Inventory",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      unique: ["productVariantId"],
      paranoid: true,
    }
  );

  return Inventory;
};
