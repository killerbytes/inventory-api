const { resetDatabase } = require("../../setup");

const {
  sequelize,
  VariantType,
  VariantValue,
  Product,
  ProductCombination,
  CombinationValue,
  Inventory,
  Category,
} = require("../../../models");

describe("VariantValue hooks", () => {
  let product, variantType, value1, combo;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await resetDatabase();
    await Category.create({
      name: "Tools",
      description: "Hardware tools",
    });

    product = await Product.create({
      name: "Test Product",
      baseUnit: "PCS",
      categoryId: 1,
    });
    variantType = await VariantType.create({
      name: "Color",
      productId: product.id,
    });
    value1 = await VariantValue.create({
      value: "Red",
      variantTypeId: variantType.id,
    });

    // Create a product combination with inventory
    combo = await ProductCombination.create({
      name: "Shovel - Red",
      productId: product.id,
      sku: "SKU-RED",
      unit: "PCS",
    });

    await CombinationValue.create({
      combinationId: combo.id,
      variantValueId: value1.id,
    });

    await Inventory.create({
      combinationId: combo.id,
      quantity: 5,
    });
  });

  test("should block deleting a variant value if inventory > 0", async () => {
    await expect(value1.destroy()).rejects.toThrow(
      /Cannot delete variant value/
    );

    // Ensure combo + inventory still exist
    const stillCombo = await ProductCombination.findByPk(combo.id);
    expect(stillCombo).not.toBeNull();
    const inv = await Inventory.findOne({ where: { combinationId: combo.id } });
    expect(inv.quantity).toBe(5);
  });

  test("should allow deleting a variant value if inventory = 0", async () => {
    // set quantity to 0
    await Inventory.update(
      { quantity: 0 },
      { where: { combinationId: combo.id } }
    );

    await expect(value1.destroy()).resolves.not.toThrow();

    // After deletion, combo and inventory should be gone
    const deletedCombo = await ProductCombination.findByPk(combo.id);
    expect(deletedCombo).toBeNull();

    const inv = await Inventory.findOne({ where: { combinationId: combo.id } });
    expect(inv).toBeNull();
  });
});
