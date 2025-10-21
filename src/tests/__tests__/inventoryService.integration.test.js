const { setupDatabase, resetDatabase, sequelize } = require("../setup");
const productCombinationService = require("../../services/productCombination.service");
const inventoryService = require("../../services/inventory.service");
const goodReceiptService = require("../../services/goodReceipt.service");
const salesOrderService = require("../../services/salesOrder.service");

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
const { getSKU, toMoney } = require("../../utils/string");
const { where } = require("sequelize");

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
  await createCustomer(0);
  await createCombination([
    {
      name: "Shovel - Red",
      price: 100,
      unit: "BOX",
      reorderLevel: 1,
      conversionFactor: 2.5,
      values: [
        {
          value: "Red",
          variantTypeId: 1,
        },
      ],
    },
    {
      price: 100,
      unit: "PCS",
      reorderLevel: 1,
      conversionFactor: 1,
      values: [
        {
          value: "Red",
          variantTypeId: 1,
        },
      ],
    },
  ]);
  await loginUser(0);
});

describe("Inventory Service (Integration)", () => {
  // it("should list inventory movements", async () => {
  //   await productCombinationService.stockAdjustment({
  //     combinationId: 1,
  //     newQuantity: 10,
  //     reason: "EXPIRED",
  //     notes: "test",
  //   });
  //   await productCombinationService.breakPack({
  //     fromCombinationId: 1,
  //     quantity: 1,
  //     toCombinationId: 2,
  //   });

  //   const inventoryMovements = await inventoryService.getMovements({
  //     order: "ASC",
  //   });

  //   expect(inventoryMovements.data.length).toBe(3);
  //   expect(inventoryMovements.data[0].combinationId).toBe(1);
  //   expect(inventoryMovements.data[0].type).toBe("ADJUSTMENT");
  //   expect(inventoryMovements.data[1].combinationId).toBe(1);
  //   expect(inventoryMovements.data[1].type).toBe("BREAK_PACK");
  //   expect(inventoryMovements.data[2].combinationId).toBe(2);
  //   expect(inventoryMovements.data[2].type).toBe("RE_PACK");
  // });

  it("should list break packs", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: 1,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
    });

    const inv = await sequelize.models.Inventory.findAll();
    console.log(1, JSON.stringify(inv, null, 2));

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
    expect(breakPacks.data[0].conversionFactor).toBe(2.5);
    expect(breakPacks.data[0].createdAt).toBeInstanceOf(Date);
    expect(breakPacks.data[0].createdBy).toBe(1);

    const inventory = await sequelize.models.Inventory.findAll();
    expect(inventory.length).toBe(2);
    expect(inventory[0].combinationId).toBe(1);
    expect(inventory[0].quantity).toBe(9);
    expect(inventory[1].combinationId).toBe(2);
    expect(inventory[1].quantity).toBe(2.5);
    console.log(2, JSON.stringify(inventory, null, 2));
  });

  // it("should list stock adjustments", async () => {
  //   await productCombinationService.stockAdjustment({
  //     combinationId: 1,
  //     newQuantity: 10,
  //     reason: "EXPIRED",
  //     notes: "test",
  //   });

  //   const stockAdjustments = await inventoryService.getStockAdjustments();

  //   expect(stockAdjustments.data.length).toBe(1);
  //   expect(stockAdjustments.data[0].combinationId).toBe(1);
  //   expect(stockAdjustments.data[0].systemQuantity).toBe(0);
  //   expect(stockAdjustments.data[0].newQuantity).toBe(10);
  //   expect(stockAdjustments.data[0].difference).toBe(10);
  //   expect(stockAdjustments.data[0].reason).toBe("EXPIRED");
  //   expect(stockAdjustments.data[0].notes).toBe("test");
  //   expect(stockAdjustments.data[0].createdAt).toBeInstanceOf(Date);
  //   expect(stockAdjustments.data[0].createdBy).toBe(1);
  // });
  // it("should PO and SO then Cancel Order", async () => {
  //   await goodReceiptService.create({
  //     supplierId: 1,
  //     receiptDate: new Date(),
  //     referenceNo: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     goodReceiptLines: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         discount: 10,
  //         purchasePrice: 200,
  //       },
  //     ],
  //   });
  //   // const gr = await sequelize.models.GoodReceipt.findAll();
  //   // console.log(JSON.stringify(gr, null, 2));

  //   await goodReceiptService.update(1, {
  //     status: "RECEIVED",
  //     supplierId: 1,
  //     receiptDate: new Date(),
  //     referenceNo: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     goodReceiptLines: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         purchasePrice: 100,
  //         discount: 5,
  //       },
  //     ],
  //   });
  //   const movements = await sequelize.models.InventoryMovement.findAll();
  //   const costPerUnit0 = toMoney((10 * 100 - 5) / 10);
  //   expect(movements.length).toBe(1);
  //   expect(movements[0].combinationId).toBe(1);
  //   expect(movements[0].type).toBe("IN");
  //   expect(movements[0].quantity).toBe(10);
  //   expect(costPerUnit0).toBe(99.5);
  //   expect(movements[0].costPerUnit).toBe(costPerUnit0);
  //   expect(movements[0].totalCost).toBe(costPerUnit0 * 10);
  //   expect(movements[0].referenceId).toBe(1);
  //   expect(movements[0].referenceType).toBe("GOOD_RECEIPT");

  //   await goodReceiptService.create({
  //     supplierId: 1,
  //     receiptDate: new Date(),
  //     referenceNo: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     goodReceiptLines: [
  //       {
  //         combinationId: 1,
  //         quantity: 20,
  //         discount: 10,
  //         purchasePrice: 200,
  //       },
  //     ],
  //   });
  //   await goodReceiptService.update(2, {
  //     status: "RECEIVED",
  //     supplierId: 1,
  //     receiptDate: new Date(),
  //     referenceNo: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     goodReceiptLines: [
  //       {
  //         combinationId: 1,
  //         quantity: 20,
  //         discount: 10,
  //         purchasePrice: 200,
  //       },
  //     ],
  //   });

  //   const costPerUnit = toMoney((20 * 200 - 10 + 995) / 30);

  //   const movements2 = await sequelize.models.InventoryMovement.findAll();
  //   expect(movements2.length).toBe(2);
  //   expect(movements2[1].combinationId).toBe(1);
  //   expect(movements2[1].type).toBe("IN");
  //   expect(movements2[1].quantity).toBe(20);
  //   expect(costPerUnit).toBe(166.17);
  //   expect(movements2[1].costPerUnit).toBe(costPerUnit);
  //   expect(movements2[1].totalCost).toBe(costPerUnit * 20);
  //   expect(movements2[1].referenceId).toBe(2);
  //   expect(movements2[1].referenceType).toBe("GOOD_RECEIPT");

  //   await goodReceiptService.create({
  //     supplierId: 1,
  //     receiptDate: new Date(),
  //     referenceNo: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     goodReceiptLines: [
  //       {
  //         combinationId: 1,
  //         quantity: 30,
  //         purchasePrice: 300,
  //       },
  //     ],
  //   });
  //   await goodReceiptService.update(3, {
  //     status: "RECEIVED",
  //     supplierId: 1,
  //     receiptDate: new Date(),
  //     referenceNo: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     goodReceiptLines: [
  //       {
  //         combinationId: 1,
  //         quantity: 30,
  //         purchasePrice: 300,
  //       },
  //     ],
  //   });
  //   const costPerUnit2 = toMoney((166.17 * 30 + 30 * 300) / 60);

  //   const movements3 = await sequelize.models.InventoryMovement.findAll();
  //   expect(movements3.length).toBe(3);
  //   expect(movements3[2].combinationId).toBe(1);
  //   expect(movements3[2].type).toBe("IN");
  //   expect(movements3[2].quantity).toBe(30);
  //   expect(costPerUnit2).toBe(233.08);
  //   expect(movements3[2].costPerUnit).toBe(costPerUnit2);
  //   expect(movements3[2].totalCost).toBe(costPerUnit2 * 30);
  //   expect(movements3[2].referenceId).toBe(3);
  //   expect(movements3[2].referenceType).toBe("GOOD_RECEIPT");

  //   const inv = await sequelize.models.Inventory.findOne({
  //     where: { combinationId: 1 },
  //   });

  //   expect(inv.quantity).toBe(60);
  //   expect(inv.averagePrice).toBe(costPerUnit2);

  //   await salesOrderService.create({
  //     customerId: 1,
  //     status: "RECEIVED",
  //     orderDate: new Date(),
  //     notes: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   });

  //   const salesOrder = await salesOrderService.get(1);
  //   expect(salesOrder.status).toBe("RECEIVED");

  //   const inventory = await sequelize.models.Inventory.findAll();
  //   expect(inventory.length).toBe(2);
  //   expect(inventory[0].combinationId).toBe(1);
  //   expect(inventory[0].quantity).toBe(50);

  //   const movements4 = await sequelize.models.InventoryMovement.findAll();
  //   expect(movements4.length).toBe(4);
  //   expect(movements4[3].combinationId).toBe(1);
  //   expect(movements4[3].type).toBe("OUT");
  //   expect(movements4[3].quantity).toBe(10);
  //   expect(movements4[3].costPerUnit).toBe(233.08);
  //   expect(movements4[3].totalCost).toBe(233.08 * 10);

  //   await salesOrderService.cancelOrder(1, {
  //     reason: "Test",
  //   });
  //   const salesOrder2 = await salesOrderService.get(1);
  //   expect(salesOrder2.status).toBe("CANCELLED");
  //   const inventory2 = await sequelize.models.Inventory.findOne({
  //     where: {
  //       combinationId: 1,
  //     },
  //   });
  //   expect(inventory2.quantity).toBe(60);
  //   const movements5 = await sequelize.models.InventoryMovement.findAll();
  //   expect(movements5.length).toBe(5);
  //   expect(movements5[4].combinationId).toBe(1);
  //   expect(movements5[4].type).toBe("CANCELLATION");
  //   expect(movements5[4].quantity).toBe(10);

  //   await goodReceiptService.create({
  //     supplierId: 1,
  //     receiptDate: new Date(),
  //     referenceNo: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     goodReceiptLines: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         purchasePrice: 100,
  //       },
  //     ],
  //   });

  //   await goodReceiptService.update(4, {
  //     status: "RECEIVED",
  //     supplierId: 1,
  //     receiptDate: new Date(),
  //     referenceNo: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     goodReceiptLines: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         purchasePrice: 100,
  //       },
  //     ],
  //   });

  //   const movements6 = await sequelize.models.InventoryMovement.findAll();
  //   const costPerUnit3 = toMoney((233.08 * 60 + 10 * 100) / 70);
  //   expect(movements6.length).toBe(6);
  //   expect(movements6[5].combinationId).toBe(1);
  //   expect(movements6[5].type).toBe("IN");
  //   // expect(movements6[2].quantity).toBe(30);
  //   expect(costPerUnit3).toBe(214.07);
  //   expect(movements6[5].costPerUnit).toBe(214.07);
  //   expect(movements6[5].totalCost).toBe(214.07 * 10);
  //   // expect(movements6[2].referenceId).toBe(3);
  //   // expect(movements6[2].referenceType).toBe("GOOD_RECEIPT");
  // });
});
