"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
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
      reorderLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Product",
    }
  );

  return Product;
};
