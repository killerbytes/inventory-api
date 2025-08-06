"use strict";
module.exports = (sequelize, DataTypes) => {
  const VariantType = sequelize.define(
    "VariantType",
    {
      name: DataTypes.STRING,
      productId: DataTypes.INTEGER,
    },
    {
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  VariantType.associate = (models) => {
    VariantType.belongsTo(models.Product, { foreignKey: "productId" });
    VariantType.hasMany(models.VariantValue, {
      foreignKey: "variantTypeId",
      as: "values",
    });
  };

  return VariantType;
};
