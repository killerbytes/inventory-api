const { resetDatabase } = require("../../setup");

const {
  sequelize,
  Product,
  ProductCombination,
  Inventory,
  Category,
} = require("../../../models");

describe("ProductCombination hooks", () => {
  let product, combo, inv;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await resetDatabase();

    Category.create({
      name: "Tools",
      description: "Hardware tools",
    });
    product = await Product.create({
      name: "Test Product",
      baseUnit: "PCS",
      categoryId: 1,
    });
    combo = await ProductCombination.create({
      productId: product.id,
      sku: "SKU-1",
      unit: "PCS",
      name: "Shovel - Red",
    });

    inv = await Inventory.create({ combinationId: combo.id, quantity: 5 });
  });

  test("should block deleting a product combination if inventory > 0", async () => {
    await expect(combo.destroy()).rejects.toThrow(
      /Cannot delete product combination/
    );

    const stillCombo = await ProductCombination.findByPk(combo.id);
    expect(stillCombo).not.toBeNull();
  });

  test("should allow deleting a product combination if inventory = 0", async () => {
    await inv.update({ quantity: 0 });

    await expect(combo.destroy()).resolves.not.toThrow();

    const deletedCombo = await ProductCombination.findByPk(combo.id);
    expect(deletedCombo).toBeNull();

    const deletedInv = await Inventory.findByPk(inv.id);
    expect(deletedInv).toBeNull();
  });

  test("should block deleting a product combination if inventory > 0", async () => {
    await Inventory.create({
      combinationId: combo.id,
      quantity: 5,
    });

    await expect(combo.destroy()).rejects.toThrow(
      "Cannot delete product combination SKU-1 — inventory has 5."
    );

    // combo should still exist
    const stillExists = await ProductCombination.findByPk(combo.id);
    expect(stillExists).not.toBeNull();
  });
});
