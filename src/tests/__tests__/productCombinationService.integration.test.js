const { setupDatabase, resetDatabase } = require("../setup");
const productService = require("../../services/product.service");
const productCombinationService = require("../../services/productCombination.service");
const {
  loginUser,
  createUser,
  createCategory,
  createProduct,
  createVariantType,
  createSupplier,
  createCombination,
  combinations,
} = require("../utils");
const { getSKU } = require("../../utils/string");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createUser(0);
  await createUser(1);
  await createCategory(0);
  await createCategory(1);
  await createProduct(0);
  await createProduct(1);
  await createVariantType(0);
  await createSupplier(0);
  await createCombination(0);
  await loginUser(0);
});

describe("Product Combination Service (Integration)", () => {
  it("should create and fetch a product combination", async () => {
    await productCombinationService.updateByProductId(1, {
      combinations,
    });

    const combo = await productCombinationService.getByProductId(1);
    const product = await productService.get(1);
    const sku = getSKU(
      product.name,
      product.categoryId,
      combo.combinations[0].unit,
      combo.combinations[0].values
    );
    expect(combo.combinations[0]).not.toBeNull();
    expect(combo.combinations[0].name).toBe("Shovel - Red");
    expect(combo.combinations[0].sku).toBe(sku);
    expect(combo.combinations[0].unit).toBe("BOX");
    expect(combo.combinations[0].price).toBe(100);
    expect(combo.combinations[0].reorderLevel).toBe(1);
    expect(combo.combinations[0].inventory.quantity).toBe(0);
    expect(combo.variants).not.toBeNull();
    expect(combo.variants[0].name).toBe("Colors");
    expect(combo.variants[0].values[0].value).toBe("Blue");
    expect(combo.variants[0].values[1].value).toBe("Red");
    expect(combo.variants[0].values.length).toBe(2);
    expect(combo.variants[0].values[0].variantTypeId).toBe(1);
    expect(combo.variants[0].values[1].variantTypeId).toBe(1);
    expect(combo.variants[0].productId).toBe(1);
    expect(combo.variants[0].productId).toBe(1);
    expect(combo.variants[0].values[0].id).toBe(2);
    expect(combo.variants[0].values[1].id).toBe(1);

    await productCombinationService.updateByProductId(1, {
      combinations,
    });
  });

  it("should make a stock adjustment", async () => {
    await productCombinationService.updateByProductId(1, {
      combinations,
    });

    await productCombinationService.stockAdjustment({
      combinationId: 3,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
    });
    const combo = await productCombinationService.getByProductId(1);
    expect(combo.combinations[0].inventory.quantity).toBe(10);
  });

  it("should break a product combination to another unit", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: 1,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
    });
    await productCombinationService.breakPack({
      fromCombinationId: 1,
      quantity: 1,
      toCombinationId: 2,
    });

    const combo = await productCombinationService.getByProductId(1);
    expect(combo.combinations[0].unit).toBe("BOX");
    expect(combo.combinations[0].inventory.quantity).toBe(9);
    expect(combo.combinations[1].unit).toBe("PCS");
    expect(combo.combinations[1].inventory.quantity).toBe(24);
  });
});
