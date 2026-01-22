const { setupDatabase, resetDatabase, sequelize } = require("../setup");
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
  createCustomer,
} = require("../utils");
const goodReceiptService = require("../../services/goodReceipt.service");
const { normalize } = require("../../utils/compute");
const salesOrderService = require("../../services/salesOrder.service");

let user0,
  user1,
  category0,
  category1,
  product0,
  product1,
  variantType0,
  supplier0,
  customer0;
let combination1, combination2;

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  user0 = await createUser(0);
  user1 = await createUser(1);
  category0 = await createCategory(0);
  category1 = await createCategory(1);
  product0 = await createProduct(0);
  product1 = await createProduct(1);
  variantType0 = await createVariantType(0);
  supplier0 = await createSupplier(0);
  customer0 = await createCustomer(0);

  await createCombination(
    [
      {
        name: "Shovel - Red",
        price: 100,
        unit: "BOX",
        reorderLevel: 1,
        conversionFactor: 2.5,
        values: [
          {
            value: "Red",
            variantTypeId: 1, // This refers to 'Colors' variant type created by createVariantType(0) which is for product 1?
            // createVariantType(0) uses variantTypes[0] which has productId: 1.
            // Since we created product0 (ID 1 probably), this aligns.
            // Ideally we should use variantType0.id, but createCombination input structure might be rigid?
            // combination values: { value: "Red", variantTypeId: 1 }
            // We can try to use variantType0.id if we can.
          },
        ],
      },
      {
        price: 100,
        unit: "PCS",
        reorderLevel: 1,
        conversionFactor: 1,
        isBreakPackOfId: 1, // Allowing this hardcode for setup as discussed
        values: [
          {
            value: "Red",
            variantTypeId: 1,
          },
        ],
      },
    ],
    product0.id
  );

  const combinations = await productCombinationService.getByProductId(
    product0.id
  );
  // Assuming the first one created is combination1 (BOX) and second is combination2 (PCS)
  // or we can find them by unit
  combination1 = combinations.combinations.find((c) => c.unit === "BOX");
  combination2 = combinations.combinations.find((c) => c.unit === "PCS");

  await loginUser(0);
});

describe("Inventory Service (Integration)", () => {
  it("should list inventory movements", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: combination1.id,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
    });
    await productCombinationService.breakPack({
      fromCombinationId: combination1.id,
      quantity: 1,
      toCombinationId: combination2.id,
    });

    const inventoryMovements = await inventoryService.getMovements({
      order: "ASC",
    });

    expect(inventoryMovements.data.length).toBe(3);
    expect(inventoryMovements.data[0].combinationId).toBe(combination1.id);
    expect(inventoryMovements.data[0].type).toBe("ADJUSTMENT");
    expect(inventoryMovements.data[1].combinationId).toBe(combination1.id);
    expect(inventoryMovements.data[1].type).toBe("BREAK_PACK");
    expect(inventoryMovements.data[2].combinationId).toBe(combination2.id);
    expect(inventoryMovements.data[2].type).toBe("BREAK_PACK");
  });

  it("should list break packs", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: combination1.id,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
    });

    const inv = await sequelize.models.Inventory.findAll();

    await productCombinationService.breakPack({
      fromCombinationId: combination1.id,
      quantity: 1,
      toCombinationId: combination2.id,
    });

    const inventory = await sequelize.models.Inventory.findAll();
    // Verify inventory for combinations
    const inv1 = inventory.find((i) => i.combinationId === combination1.id);
    const inv2 = inventory.find((i) => i.combinationId === combination2.id);

    expect(inventory.length).toBe(2);
    expect(inv1).toBeDefined();
    expect(inv1.quantity).toBe(9);
    expect(inv2).toBeDefined();
    expect(inv2.quantity).toBe(2.5);
  });

  it("should list stock adjustments", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: combination1.id,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
    });

    const stockAdjustments = await inventoryService.getStockAdjustments();

    expect(stockAdjustments.data.length).toBe(1);
    expect(stockAdjustments.data[0].combinationId).toBe(combination1.id);
    expect(stockAdjustments.data[0].systemQuantity).toBe(0);
    expect(stockAdjustments.data[0].newQuantity).toBe(10);
    expect(stockAdjustments.data[0].difference).toBe(10);
    expect(stockAdjustments.data[0].reason).toBe("EXPIRED");
    expect(stockAdjustments.data[0].notes).toBe("test");
    expect(stockAdjustments.data[0].createdAt).toBeInstanceOf(Date);
    expect(stockAdjustments.data[0].createdBy).toBe(user0.id);
  });

  it("should PO and SO then Cancel Order", async () => {
    await goodReceiptService.create({
      supplierId: supplier0.id,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
        {
          combinationId: combination1.id,
          quantity: 10,
          purchasePrice: 100,
        },
        {
          combinationId: combination2.id,
          quantity: 20,
          discount: 10,
          purchasePrice: 200,
        },
      ],
    });
    // const gr = await sequelize.models.GoodReceipt.findAll();
    // console.log(JSON.stringify(gr, null, 2));

    await goodReceiptService.update(1, {
      // Assumes GoodReceipt ID 1. Could fetch if needed, but sequential ID is likely safe for single-test run.
      status: "RECEIVED",
      supplierId: supplier0.id,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
        {
          combinationId: combination1.id,
          quantity: 10,
          purchasePrice: 100,
          discount: 5,
        },
      ],
    });
    const movements = await sequelize.models.InventoryMovement.findAll();
    const costPerUnit0 = normalize((10 * 100 - 5) / 10);

    // Filter movements by combination to be safe, or assume order
    const movComb1 = movements.filter(
      (m) => m.combinationId === combination1.id
    );

    expect(movements.length).toBe(1);
    expect(movements[0].combinationId).toBe(combination1.id);
    expect(movements[0].type).toBe("IN");
    expect(movements[0].quantity).toBe(10);
    expect(costPerUnit0).toBe(99.5);
    expect(movements[0].costPerUnit).toBe(costPerUnit0);
    expect(movements[0].totalCost).toBe(costPerUnit0 * 10);
    expect(movements[0].referenceId).toBe(1);
    expect(movements[0].referenceType).toBe("GOOD_RECEIPT");

    await goodReceiptService.create({
      supplierId: supplier0.id,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
        {
          combinationId: combination1.id,
          quantity: 20,
          discount: 10,
          purchasePrice: 200,
        },
      ],
    });
    await goodReceiptService.update(2, {
      status: "RECEIVED",
      supplierId: supplier0.id,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
        {
          combinationId: combination1.id,
          quantity: 20,
          discount: 10,
          purchasePrice: 200,
        },
      ],
    });

    const costPerUnit = normalize((20 * 200 - 10 + 995) / 30);

    const movements2 = await sequelize.models.InventoryMovement.findAll();
    expect(movements2.length).toBe(2);
    expect(movements2[1].combinationId).toBe(combination1.id);
    expect(movements2[1].type).toBe("IN");
    expect(movements2[1].quantity).toBe(20);
    expect(costPerUnit).toBe(166.1667);
    expect(movements2[1].costPerUnit).toBe(costPerUnit);
    expect(movements2[1].totalCost).toBe(costPerUnit * 20);
    expect(movements2[1].referenceId).toBe(2);
    expect(movements2[1].referenceType).toBe("GOOD_RECEIPT");

    await goodReceiptService.create({
      supplierId: supplier0.id,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
        {
          combinationId: combination1.id,
          quantity: 30,
          purchasePrice: 300,
        },
      ],
    });
    await goodReceiptService.update(3, {
      status: "RECEIVED",
      supplierId: supplier0.id,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
        {
          combinationId: combination1.id,
          quantity: 30,
          purchasePrice: 300,
        },
      ],
    });
    const costPerUnit2 = normalize((costPerUnit * 30 + 30 * 300) / 60);
    const movements3 = await sequelize.models.InventoryMovement.findAll();
    expect(movements3.length).toBe(3);
    expect(movements3[2].combinationId).toBe(combination1.id);
    expect(movements3[2].type).toBe("IN");
    expect(movements3[2].quantity).toBe(30);
    expect(costPerUnit2).toBe(233.0833);
    expect(movements3[2].costPerUnit).toBe(costPerUnit2);
    expect(movements3[2].totalCost).toBe(costPerUnit2 * 30);
    expect(movements3[2].referenceId).toBe(3);
    expect(movements3[2].referenceType).toBe("GOOD_RECEIPT");

    const inv = await sequelize.models.Inventory.findOne({
      where: { combinationId: combination1.id },
    });

    expect(inv.quantity).toBe(60);
    expect(inv.averagePrice).toBe(costPerUnit2);

    await salesOrderService.create({
      customerId: customer0.id,
      status: "RECEIVED",
      orderDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      salesOrderItems: [
        {
          combinationId: combination1.id,
          quantity: 10,
          originalPrice: 100,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });

    const salesOrder = await salesOrderService.get(1); // Still using ID 1 for SO as it's the first one. Safe enough.
    expect(salesOrder.status).toBe("RECEIVED");

    const inventory = await sequelize.models.Inventory.findAll();
    const inv1 = inventory.find((i) => i.combinationId === combination1.id);
    expect(inventory.length).toBe(2); // comb1 and comb2 exist (comb2 created in beforeEach but not used in this test yet, wait, createCombination made 2 combos)

    // In beforeEach we created 2 combinations. In this test we only transacted on combination1 (mostly).
    // But goodReceiptLines in first create used combination 2 (Line 149 in original), but then update ONLY used combination 1 (Line 166).
    // So combination 2 has no movements/inventory *if* the first create was just draft?
    // goodReceiptService.create makes it DRAFT? Status not specified so default?
    // Then update status RECEIVED makes movements. The update removed comb2 from lines.
    // So comb2 should have 0 inventory.

    // Verify inv1
    expect(inv1).toBeDefined();
    expect(inv1.quantity).toBe(50);

    const movements4 = await sequelize.models.InventoryMovement.findAll();
    // 3 GR INs + 1 SO OUT
    expect(movements4.length).toBe(4);
    expect(movements4[3].combinationId).toBe(combination1.id);
    expect(movements4[3].type).toBe("OUT");
    expect(movements4[3].quantity).toBe(10);
    expect(movements4[3].costPerUnit).toBe(233.0833);
    expect(movements4[3].totalCost).toBe(233.0833 * 10);

    await salesOrderService.cancelOrder(1, {
      reason: "Test",
    });
    const salesOrder2 = await salesOrderService.get(1);
    expect(salesOrder2.status).toBe("CANCELLED");
    const inventory2 = await sequelize.models.Inventory.findOne({
      where: {
        combinationId: combination1.id,
      },
    });
    expect(inventory2.quantity).toBe(60);
    const movements5 = await sequelize.models.InventoryMovement.findAll();
    expect(movements5.length).toBe(5);
    expect(movements5[4].combinationId).toBe(combination1.id);
    expect(movements5[4].type).toBe("CANCELLATION");
    expect(movements5[4].quantity).toBe(10);

    await goodReceiptService.create({
      supplierId: supplier0.id,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
        {
          combinationId: combination1.id,
          quantity: 10,
          purchasePrice: 100,
        },
      ],
    });

    await goodReceiptService.update(4, {
      status: "RECEIVED",
      supplierId: supplier0.id,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
        {
          combinationId: combination1.id,
          quantity: 10,
          purchasePrice: 100,
        },
      ],
    });

    const movements6 = await sequelize.models.InventoryMovement.findAll();
    const costPerUnit3 = normalize((233.0833 * 60 + 10 * 100) / 70);
    expect(movements6.length).toBe(6);
    expect(movements6[5].combinationId).toBe(combination1.id);
    expect(movements6[5].type).toBe("IN");
    // expect(movements6[2].quantity).toBe(30);
    expect(costPerUnit3).toBe(214.0714);
    expect(movements6[5].costPerUnit).toBe(214.0714);
    expect(movements6[5].totalCost).toBe(214.0714 * 10);
    // expect(movements6[2].referenceId).toBe(3);
    // expect(movements6[2].referenceType).toBe("GOOD_RECEIPT");
  });

  it("should list reorder levels", async () => {
    // Both combinations created have reorderLevel = 1.
    // Initial quantity is 0, so they should be in reorder list if we have sold them?
    // getReordersLevels implementation checks lastSoldAt via SalesOrderItems.
    // So we need to sell them first.

    // 1. Add Stock (so we can sell)
    await productCombinationService.stockAdjustment({
      combinationId: combination1.id,
      newQuantity: 10,
      reason: "SUPPLIER_BONUS",
      notes: "Stock up",
    });

    // 2. Sell to Customer
    await salesOrderService.create({
      customerId: customer0.id,
      status: "RECEIVED",
      orderDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      salesOrderItems: [
        {
          combinationId: combination1.id,
          quantity: 10, // Stock is 10, remove 10 -> Qty 0. Reorder level 1. Should appear.
          originalPrice: 100,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });

    const reorders = await inventoryService.getReordersLevels({
      limit: 10,
      page: 1,
    });

    // Expect combination1 to be in the list
    const found1 = reorders.data.find(
      (r) => r.combinationId === combination1.id
    );
    expect(found1).toBeDefined();
    expect(Number(found1.quantity)).toBe(0);
  });

  it("should list price history", async () => {
    // Update price of combination1
    await productCombinationService.updateByProductId(product0.id, {
      combinations: [
        {
          id: combination1.id, // Update existing
          price: 150, // New Price
          unit: "BOX",
          conversionFactor: 2.5,
          reorderLevel: 1,
          values: [
            {
              value: "Red",
              variantTypeId: 1,
            },
          ],
        },
        // We must include other combinations or they might be deleted if logic is "replace all"?
        // looking at updateByProductId implementation:
        // "const deleteCandidates = existingCombinations.filter((comb) => !incomingIds.includes(comb.id));"
        // So yes, we should provide all combinations or else others will be deleted.
        {
          id: combination2.id,
          price: 100,
          unit: "PCS",
          conversionFactor: 1,
          reorderLevel: 1,
          isBreakPackOfId: 1, // need to keep this relationship valid if validation checks it?
          // validation checks "isBreakPackOfId" existence?
          // actually updateByProductId Joi schema might not force it, but best to keep it safe.
          values: [
            {
              value: "Red",
              variantTypeId: 1,
            },
          ],
        },
      ],
    });

    const history = await inventoryService.getPriceHistory({
      productId: product0.id,
    });

    expect(history.data.length).toBeGreaterThan(0);
    const change = history.data.find(
      (h) => h.combinationId === combination1.id && h.toPrice == 150
    );
    expect(change).toBeDefined();
    expect(change.fromPrice).toBe(100);
  });
});
