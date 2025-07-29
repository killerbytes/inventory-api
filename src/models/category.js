// models/category.js
"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Make sure to reference models through the db object
      Category.hasMany(models.Product, {
        foreignKey: "categoryId",
        as: "products",
        onDelete: "RESTRICT",
      });
    }
  }

  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: DataTypes.TEXT,
      order: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Category",
      timestamps: false,
      tableName: "Categories",
    }
  );

  return Category;
};
