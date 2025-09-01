const { setupDatabase, resetDatabase } = require("../setup");
const productService = require("../../services/product.service");
const productCombinationService = require("../../services/productCombination.service");
const inventoryService = require("../../services/inventory.service");

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

describe("Inventory Service (Integration)", () => {
  it("should list inventory movements", async () => {
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

    const inventoryMovements = await inventoryService.getMovements({});

    expect(inventoryMovements.data.length).toBe(3);
    expect(inventoryMovements.data[0].combinationId).toBe(1);
    expect(inventoryMovements.data[0].type).toBe("STOCK_ADJUSTMENT");
    expect(inventoryMovements.data[1].combinationId).toBe(1);
    expect(inventoryMovements.data[1].type).toBe("BREAK_PACK");
    expect(inventoryMovements.data[2].combinationId).toBe(2);
    expect(inventoryMovements.data[2].type).toBe("RE_PACK");
  });

  it("should list break packs", async () => {
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

    const breakPacks = await inventoryService.getBreakPacks();

    expect(breakPacks.data.length).toBe(1);
    expect(breakPacks.data[0].fromCombinationId).toBe(1);
    expect(breakPacks.data[0].toCombinationId).toBe(2);
    expect(breakPacks.data[0].quantity).toBe(1);
    expect(breakPacks.data[0].conversionFactor).toBe(24);
    expect(breakPacks.data[0].createdAt).toBeInstanceOf(Date);
    expect(breakPacks.data[0].createdBy).toBe(1);
  });

  it("should list stock adjustments", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: 1,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
    });

    const stockAdjustments = await inventoryService.getStockAdjustments();

    expect(stockAdjustments.data.length).toBe(1);
    expect(stockAdjustments.data[0].combinationId).toBe(1);
    expect(stockAdjustments.data[0].systemQuantity).toBe(0);
    expect(stockAdjustments.data[0].newQuantity).toBe(10);
    expect(stockAdjustments.data[0].difference).toBe(10);
    expect(stockAdjustments.data[0].reason).toBe("EXPIRED");
    expect(stockAdjustments.data[0].notes).toBe("test");
    expect(stockAdjustments.data[0].createdAt).toBeInstanceOf(Date);
    expect(stockAdjustments.data[0].createdBy).toBe(1);
  });
});
