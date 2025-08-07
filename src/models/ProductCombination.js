const { getSKU } = require("../utils.ts");

module.exports = (sequelize, DataTypes) => {
  const ProductCombination = sequelize.define(
    "ProductCombination",
    {
      productId: DataTypes.INTEGER,
      sku: { type: DataTypes.STRING, unique: true },
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

  ProductCombination.beforeCreate(async (productCombination, options) => {
    // const { Product, ProductCombination, VariantValue } = require("./index"); // Lazy load to avoid circular import
    // Fetch associated Product (if needed)
    // const product = await Product.findByPk(productCombination.productId, {});
    // const combo = await ProductCombination.findByPk(productCombination.id);
    // console.log(12, productCombination);
    // productCombination.price = 999;
    // await productCombination.save();
    // if (!product) throw new Error("Product not found");
    // console.log(21, values);
    // You must provide `values` for SKU. Make sure it’s passed to the model
    // const values = product.combinations.values || []; // usually manually injected before .create()
    // productCombination.sku = getSKU(
    //   product.name,
    //   product.categoryId,
    //   product.unit,
    //   values
    // );
  });

  return ProductCombination;
};
