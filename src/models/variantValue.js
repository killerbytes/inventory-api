module.exports = (sequelize, DataTypes) => {
  const VariantValue = sequelize.define("VariantValue", {
    value: DataTypes.STRING,
  });

  VariantValue.associate = (models) => {
    VariantValue.belongsTo(models.VariantType, { foreignKey: "variantTypeId" });
    VariantValue.hasMany(models.ProductVariantCombinationValue, {
      foreignKey: "variantValueId",
    });
  };

  return VariantValue;
};
