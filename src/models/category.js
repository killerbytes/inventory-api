// models/category.js
"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Category, {
        as: "subCategories",
        foreignKey: "parentId",
      });

      Category.belongsTo(models.Category, {
        as: "parent",
        foreignKey: "parentId",
      });

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
      deletedAt: { type: DataTypes.DATE, allowNull: true }, // required for paranoid index in SQLite
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
