module.exports = (sequelize, DataTypes) => {
  const ProductVariantCombination = sequelize.define(
    "ProductVariantCombination",
    {
      sku: DataTypes.STRING,
      price: DataTypes.DECIMAL,
      imageUrl: DataTypes.STRING,
    }
  );

  ProductVariantCombination.associate = (models) => {
    ProductVariantCombination.belongsTo(models.Product, {
      foreignKey: "productId",
    });
    ProductVariantCombination.hasMany(models.ProductVariantCombinationValue, {
      foreignKey: "productVariantCombinationId",
    });
    ProductVariantCombination.hasOne(models.Inventory, {
      foreignKey: "productVariantCombinationId",
    });
  };

  return ProductVariantCombination;
};
