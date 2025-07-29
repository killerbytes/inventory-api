"use strict";
const { UNIT } = require("../definitions");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.Product, {
        foreignKey: "parentId",
        as: "subProducts",
      });
      Product.belongsTo(models.Product, {
        foreignKey: "parentId",
        as: "parent",
      });
      Product.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
        onDelete: "RESTRICT",
      });
      Product.hasMany(models.PurchaseOrderItem, {
        foreignKey: "productId",
        as: "purchaseOrderItems",
      });
      Product.hasMany(models.Inventory, {
        foreignKey: "productId",
        as: "inventories",
      });
    }
  }

  Product.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT },
      categoryId: { type: DataTypes.INTEGER, allowNull: false },
      unit: {
        type: DataTypes.ENUM(Object.values(UNIT)),
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Products",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Product",
    }
  );

  return Product;
};
