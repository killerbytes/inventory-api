module.exports = (sequelize, DataTypes) => {
  const ProductCombination = sequelize.define(
    "ProductCombination",
    {
      productId: DataTypes.INTEGER,
      sku: DataTypes.STRING,
      price: DataTypes.DECIMAL(10, 2),
      reorderLevel: DataTypes.INTEGER,
    },
    {
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      paranoid: true,
    }
  );

  ProductCombination.associate = (models) => {
    ProductCombination.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
    ProductCombination.belongsToMany(models.VariantValue, {
      through: models.CombinationValue,
      foreignKey: "combinationId",
      as: "values",
    });
    ProductCombination.hasOne(models.Inventory, {
      foreignKey: "combinationId",
    });
  };

  return ProductCombination;
};
