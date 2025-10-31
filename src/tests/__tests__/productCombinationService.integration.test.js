const {
  sequelize,
  Product,
  ProductCombination,
  Inventory,
  Category,
} = require("../../models");

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
const variantTypeService = require("../../services/variantType.service");
const goodReceiptService = require("../../services/goodReceipt.service");

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
  await createCombination();
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
  it("should update price and create price history", async () => {
    const { combinations } = await productCombinationService.getByProductId(1);
    await productCombinationService.updateByProductId(1, {
      combinations: combinations.map((c) => ({ ...c.dataValues, price: 123 })),
    });
    const combo = await productCombinationService.getByProductId(1);
    expect(combo.combinations[0].price).toBe(123);
    expect(combo.combinations[1].price).toBe(123);
    const priceHistories = await sequelize.models.PriceHistory.findAll();
    expect(priceHistories.length).toBe(2);
    expect(priceHistories[0].fromPrice).toBe(100);
    expect(priceHistories[0].toPrice).toBe(123);
    expect(priceHistories[1].fromPrice).toBe(100);
    expect(priceHistories[1].toPrice).toBe(123);
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
    await productCombinationService.stockAdjustment({
      combinationId: 3,
      newQuantity: 11,
      reason: "EXPIRED",
      notes: "test",
    });
    const combo2 = await productCombinationService.getByProductId(1);
    expect(combo2.combinations[0].inventory.quantity).toBe(11);
  });

  it("should break/repack a product combination to another unit", async () => {
    await goodReceiptService.create({
      supplierId: 1,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
        {
          combinationId: 1,
          quantity: 1,
          purchasePrice: 100,
        },
      ],
    });

    await goodReceiptService.update(1, {
      status: "RECEIVED",
      goodReceiptLines: [
        {
          combinationId: 1,
          quantity: 2,
          purchasePrice: 100,
        },
      ],
    });

    await productCombinationService.updateByProductId(1, {
      combinations: [
        {
          id: 1,
          conversionFactor: 100,
          unit: "BOX",
          price: 100,
          reorderLevel: 10,
          values: [
            {
              value: "Red",
              variantTypeId: 1,
            },
          ],
        },
        {
          id: 2,
          conversionFactor: 1,
          unit: "PCS",
          price: 5,
          reorderLevel: 10,
          isBreakPackOfId: 1,
          values: [
            {
              value: "Red",
              variantTypeId: 1,
            },
          ],
        },
      ],
    });

    await productCombinationService.breakPack({
      fromCombinationId: 1,
      quantity: 1,
      toCombinationId: 2,
    });
    const combo = await productCombinationService.getByProductId(1);
    expect(combo.combinations[0].unit).toBe("BOX");
    expect(combo.combinations[0].inventory.quantity).toBe(1);
    expect(combo.combinations[0].inventory.averagePrice).toBe(100);
    expect(combo.combinations[1].unit).toBe("PCS");
    expect(combo.combinations[1].inventory.quantity).toBe(100);
    expect(combo.combinations[1].inventory.averagePrice).toBe(1);

    await productCombinationService.breakPack({
      fromCombinationId: 1,
      quantity: 1,
      toCombinationId: 2,
    });
    const combo2 = await productCombinationService.getByProductId(1);
    expect(combo2.combinations[0].unit).toBe("BOX");
    expect(combo2.combinations[0].inventory.quantity).toBe(0);
    expect(combo2.combinations[0].inventory.averagePrice).toBe(100);
    expect(combo2.combinations[1].unit).toBe("PCS");
    expect(combo2.combinations[1].inventory.quantity).toBe(200);
    expect(combo2.combinations[1].inventory.averagePrice).toBe(1);

    await productCombinationService.breakPack({
      fromCombinationId: 2,
      quantity: 100,
      toCombinationId: 1,
    });

    await productCombinationService.breakPack({
      fromCombinationId: 2,
      quantity: 100,
      toCombinationId: 1,
    });

    const combo3 = await productCombinationService.getByProductId(1);

    expect(combo3.combinations[0].unit).toBe("BOX");
    expect(combo3.combinations[0].inventory.quantity).toBe(2);
    expect(combo3.combinations[0].inventory.averagePrice).toBe(100);
    expect(combo3.combinations[1].unit).toBe("PCS");
    expect(combo3.combinations[1].inventory.quantity).toBe(0);
    expect(combo3.combinations[1].inventory.averagePrice).toBe(1);
  });

  it("should re pack a product combination to another unit", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: 1,
      newQuantity: 0,
      reason: "EXPIRED",
      notes: "test",
    });

    await productCombinationService.stockAdjustment({
      combinationId: 2,
      newQuantity: 24,
      reason: "EXPIRED",
      notes: "test",
    });
    await productCombinationService.breakPack({
      fromCombinationId: 2,
      quantity: 24,
      toCombinationId: 1,
    });
    const combo = await productCombinationService.getByProductId(1);
    expect(combo.combinations[0].unit).toBe("BOX");
    expect(combo.combinations[0].inventory.quantity).toBe(1);
    expect(combo.combinations[1].unit).toBe("PCS");
    expect(combo.combinations[1].inventory.quantity).toBe(0);
    await productCombinationService.breakPack({
      fromCombinationId: 1,
      quantity: 1,
      toCombinationId: 2,
    });
    const combo2 = await productCombinationService.getByProductId(1);
    expect(combo2.combinations[0].unit).toBe("BOX");
    expect(combo2.combinations[0].inventory.quantity).toBe(0);
    expect(combo2.combinations[1].unit).toBe("PCS");
    expect(combo2.combinations[1].inventory.quantity).toBe(24);
  });
  it("should throw error if inventory is not enough", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: 1,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
    });
    try {
      await productCombinationService.breakPack({
        fromCombinationId: 1,
        quantity: 11,
        toCombinationId: 2,
      });
      throw new Error("Expected VALIDATION_ERROR but no error was thrown");
    } catch (err) {
      console.log("Prevent inventory not enough:", {
        name: err.name,
        message: err.message,
        errors: err.errors?.map((e) => e.message),
      });
      expect(err.name).toBe("Error");
      expect(err.message).toBe("Not enough inventory");
    }
  });
  it("should throw error if different product", async () => {
    await variantTypeService.create({
      name: "Size",
      values: [
        {
          value: "Blue",
        },
      ],
      productId: 2,
    });
    await productCombinationService.updateByProductId(2, {
      combinations: [
        {
          unit: "BOX",
          price: 100,
          reorderLevel: 1,
          conversionFactor: 24,
          values: [{ variantTypeId: 2, value: "Blue" }],
        },
      ],
    });
    const list = await productCombinationService.list();
    await productCombinationService.stockAdjustment({
      combinationId: 1,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
    });
    try {
      await productCombinationService.breakPack({
        fromCombinationId: 1,
        quantity: 11,
        toCombinationId: 3,
      });
      throw new Error("Expected VALIDATION_ERROR but no error was thrown");
    } catch (err) {
      console.log("Prevent different product:", {
        name: err.name,
        message: err.message,
        errors: err.errors?.map((e) => e.message),
      });
      expect(err.name).toBe("Error");
      expect(err.message).toBe("Cannot convert between different products");
    }
  });
});
