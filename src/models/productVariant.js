module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define("ProductVariant", {});

  ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, { foreignKey: "productId" });
    ProductVariant.belongsTo(models.VariantType, {
      foreignKey: "variantTypeId",
    });
  };

  return ProductVariant;
};
