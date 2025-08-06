"use strict";
const { UNIT } = require("../definitions");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
        onDelete: "RESTRICT",
      });
      Product.hasMany(models.VariantType, {
        foreignKey: "productId",
        as: "variants",
      });
      Product.hasMany(models.ProductCombination, {
        foreignKey: "productId",
        as: "combinations",
      });
    }
  }

  Product.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT },
      unit: { type: DataTypes.STRING, allowNull: false },
      categoryId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "Product",
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return Product;
};
