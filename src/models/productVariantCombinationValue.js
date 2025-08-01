module.exports = (sequelize, DataTypes) => {
  const ProductVariantCombinationValue = sequelize.define(
    "ProductVariantCombinationValue",
    {}
  );

  ProductVariantCombinationValue.associate = (models) => {
    ProductVariantCombinationValue.belongsTo(models.ProductVariantCombination, {
      foreignKey: "productVariantCombinationId",
    });
    ProductVariantCombinationValue.belongsTo(models.VariantValue, {
      foreignKey: "variantValueId",
    });
  };

  return ProductVariantCombinationValue;
};
