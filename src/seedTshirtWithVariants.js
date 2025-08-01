const {
  sequelize,
  Category,
  Product,
  VariantType,
  VariantValue,
  ProductVariant,
  ProductVariantCombination,
  ProductVariantCombinationValue,
  Inventory,
} = require("./models");

async function seedTshirtProduct() {
  await sequelize.sync({ force: false }); // Wipe and recreate tables

  // const category = await Category.create({
  //   id: 1,
  //   name: "Building Materials",
  //   description:
  //     "Foundation materials including lumber, plywood, concrete, roofing, siding, insulation, drywall, and fencing",
  //   order: 1,
  // });

  // 1. Create Product
  const product = await Product.create({
    name: "T-Shirt",
    description: "A high quality cotton t-shirt",
    categoryId: 1,
  });

  // 2. Create Variant Types
  const [colorType, sizeType] = await Promise.all([
    VariantType.create({ name: "Color" }),
    VariantType.create({ name: "Size" }),
  ]);

  // 3. Define Variant Values
  const [red, blue] = await VariantValue.bulkCreate([
    { value: "Red", variantTypeId: colorType.id },
    { value: "Blue", variantTypeId: colorType.id },
  ]);

  const [small, medium] = await VariantValue.bulkCreate([
    { value: "Small", variantTypeId: sizeType.id },
    { value: "Medium", variantTypeId: sizeType.id },
  ]);

  // 4. Link Product to Variant Types
  await ProductVariant.bulkCreate([
    { productId: product.id, variantTypeId: colorType.id },
    { productId: product.id, variantTypeId: sizeType.id },
  ]);

  // 5. Create Product Variant Combinations (2 Colors × 2 Sizes = 4 SKUs)
  const combinations = [
    [red, small],
    [red, medium],
    [blue, small],
    [blue, medium],
  ];

  for (const [color, size] of combinations) {
    const sku = `TSHIRT-${color.value.toUpperCase()}-${size.value.toUpperCase()}`;
    const combination = await ProductVariantCombination.create({
      productId: product.id,
      sku,
      price: 499.0,
    });

    await ProductVariantCombinationValue.bulkCreate([
      {
        productVariantCombinationId: combination.id,
        variantValueId: color.id,
      },
      {
        productVariantCombinationId: combination.id,
        variantValueId: size.id,
      },
    ]);

    await Inventory.create({
      productVariantCombinationId: combination.id,
      quantity: Math.floor(Math.random() * 100),
    });

    console.log(`Created SKU: ${sku}`);
  }

  console.log("✅ Seeding complete.");
  await sequelize.close();
}

seedTshirtProduct().catch(console.error);
