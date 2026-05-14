"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BreakPack extends Model {
    static associate(models) {
      BreakPack.belongsTo(models.User, {
        as: "user",
        foreignKey: "createdBy",
      });
      BreakPack.belongsTo(models.ProductCombination, {
        as: "fromCombination",
        foreignKey: "fromCombinationId",
      });
      BreakPack.belongsTo(models.ProductCombination, {
        as: "toCombination",
        foreignKey: "toCombinationId",
      });
    }
  }
  BreakPack.init(
    {
      fromCombinationId: DataTypes.INTEGER,
      toCombinationId: DataTypes.INTEGER,
      quantity: DataTypes.DECIMAL,
      conversionFactor: DataTypes.DECIMAL,
      type: DataTypes.STRING,
      createdBy: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "BreakPack",
    }
  );
  return BreakPack;
};
