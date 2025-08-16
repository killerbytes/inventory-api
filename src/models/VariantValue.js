"use strict";
module.exports = (sequelize, DataTypes) => {
  const VariantValue = sequelize.define(
    "VariantValue",
    {
      value: { type: DataTypes.STRING, allowNull: false },
      variantTypeId: { type: DataTypes.INTEGER, allowNull: false },
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
