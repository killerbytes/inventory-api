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
      },
      description: DataTypes.TEXT,
      order: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Category",
      timestamps: false,
      tableName: "Categories",
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      indexes: [
        {
          unique: true,
          fields: ["name"],
          where: {
            deletedAt: null, // enforce uniqueness only for active rows
          },
        },
      ],
    }
  );

  return Category;
};
