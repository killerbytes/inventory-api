"use strict";

const { getSKU } = require("../utils/string");
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
      name: { type: DataTypes.STRING, allowNull: false },
      description: DataTypes.TEXT,
      baseUnit: { type: DataTypes.STRING, allowNull: false },
      categoryId: { type: DataTypes.INTEGER, allowNull: false },
      sku: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Product",
      paranoid: true,
      deletedAt: "deletedAt",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      },
      indexes: [
        {
          unique: true,
          fields: ["name", "baseUnit"],
          where: {
            deletedAt: null, // enforce uniqueness only for active rows
          },
        },
      ],
    }
  );

  Product.beforeCreate(async (product, options) => {
    product.sku = getSKU(product.name, product.categoryId);
  });

  Product.beforeBulkCreate(async (product, options) => {
    product.sku = getSKU(product.name, product.categoryId);
  });

  Product.beforeUpdate(async (product, options) => {
    product.sku = getSKU(product.name, product.categoryId);
  });

  return Product;
};
