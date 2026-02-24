const { setupDatabase, resetDatabase, sequelize } = require("../setup");
const productCombinationService = require("../../services/productCombination.service");
const inventoryService = require("../../services/inventory.service");
const salesOrderService = require("../../services/salesOrder.service");
const {
  createUser,
  createCategory,
  createProduct,
  createCombination,
  createCustomer,
  createVariantType,
  loginUser,
} = require("../utils");

let user0, customer0, product0;
let combination1;

beforeAll(async () => {
  await setupDatabase();
});

beforeEach(async () => {
  await resetDatabase();
  user0 = await createUser(0);
  customer0 = await createCustomer(0);
  await createCategory(0);
  product0 = await createProduct(0);

  // Create variant type for the product
  const variantType = await createVariantType(0);

  // Create a combination
  await createCombination(
    [
      {
        name: "Test Combo",
        price: 100,
        unit: "PCS",
        values: [{ value: "Red", variantTypeId: variantType.id }],
        reorderLevel: 1,
        conversionFactor: 1,
      },
    ],
    product0.id
  );

  const combinations = await productCombinationService.getByProductId(
    product0.id
  );
  combination1 = combinations.combinations[0];

  // Stock up with 1 item
  await productCombinationService.stockAdjustment({
    combinationId: combination1.id,
    newQuantity: 1,
    reason: "OTHER",
    notes: "Setup",
  });
});

describe("Inventory Concurrency (Integration)", () => {
  it("should prevent selling more than available stock during concurrent requests", async () => {
    // We have 1 item in stock.
    // Try to create 2 sales orders simultaneously, each requesting 1 item.
    // One should succeed, one should fail (if validation works correctly),
    // OR if negative stock is allowed, both succeed but stock becomes -1?
    // Let's assume strict inventory (no negative stock).

    // NOTE: Node.js is single threaded, so true parallelism isn't possible in the same process loop,
    // but async operations yielding to event loop can cause race conditions if the check and update aren't atomic/locked.

    const createOrderParams = {
      customerId: customer0.id,
      status: "RECEIVED", // Inventory is deducted on RECEIVED
      orderDate: new Date(),
      salesOrderItems: [
        {
          combinationId: combination1.id,
          quantity: 1,
          originalPrice: 100,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    };

    const user = await sequelize.models.User.findByPk(1);

    // We'll fire two promises at once.
    const p1 = salesOrderService.create(createOrderParams);
    const p2 = salesOrderService.create(createOrderParams);

    const results = await Promise.allSettled([p1, p2]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // Check inventory
    const inventory = await sequelize.models.Inventory.findOne({
      where: { combinationId: combination1.id },
    });

    console.log("Concurrency Test Results:", {
      fulfilled: fulfilled.length,
      rejected: rejected.length,
      errors: rejected.map((r) => r.reason.message),
      finalStock: inventory.quantity,
    });

    // We expect at least the system to be consistent.
    // In SQLite, one might fail with transaction error, which is "safe" enough for now.
    // The key is that stock should NOT be negative.
    expect(Number(inventory.quantity)).toBeGreaterThanOrEqual(0);

    // If one fulfilled, stock should be 0 (since we started with 1)
    if (fulfilled.length === 1) {
      expect(Number(inventory.quantity)).toBe(0);
    }

    // Both should NOT be fulfilled if we only had 1 item and no negative stock allowed.
    expect(fulfilled.length).toBeLessThan(2);
  });
});
