"use strict";
module.exports = (sequelize, DataTypes) => {
  const VariantValue = sequelize.define(
    "VariantValue",
    {
      value: DataTypes.STRING,
      variantTypeId: DataTypes.INTEGER,
    },
    {
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  VariantValue.associate = (models) => {
    VariantValue.belongsTo(models.VariantType, { foreignKey: "variantTypeId" });
    VariantValue.belongsToMany(models.ProductCombination, {
      through: models.CombinationValue,
      foreignKey: "variantValueId",
    });
  };

  return VariantValue;
};
