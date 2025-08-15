"use strict";
module.exports = (sequelize, DataTypes) => {
  const VariantType = sequelize.define(
    "VariantType",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      productId: DataTypes.INTEGER,
      isTemplate: DataTypes.BOOLEAN,
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
