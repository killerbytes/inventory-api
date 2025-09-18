const { sequelize, setupDatabase, resetDatabase } = require("../setup");
const salesOrderService = require("../../services/salesOrder.service");
const {
  createCategory,
  createVariantType,
  createUser,
  createProduct,
  createSupplier,
  createCombination,
  loginUser,
  createCustomer,
  createStockAdjustment,
} = require("../utils");
const productCombinationService = require("../../services/productCombination.service");
const inventoryService = require("../../services/inventory.service");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createUser(0);
  await createCustomer(0);
  await createCategory(0);
  await createCategory(1);
  await createProduct(0);
  await createProduct(1);
  await createVariantType(0);
  await createSupplier(0);
  await createCombination(0);
  await createStockAdjustment(0);
  await createStockAdjustment(1);
  await loginUser();
});

describe("Sales Order Service (Integration)", () => {
  // it("should create a sale order", async () => {
  //   await salesOrderService.create({
  //     customerId: 1,

  //     deliveryDate: new Date(),
  //     notes: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   });
  //   const salesOrder = await salesOrderService.get(1);
  //   expect(salesOrder.customerId).toBe(1);
  //   expect(salesOrder.modeOfPayment).toBe("CASH");
  //   expect(salesOrder.deliveryDate).toBeInstanceOf(Date);
  //   expect(salesOrder.notes).toBe("Test Notes");
  //   expect(salesOrder.internalNotes).toBe("Test Internal Notes");
  //   expect(salesOrder.salesOrderItems.length).toBe(2);
  //   expect(salesOrder.totalAmount).toBe(3000);
  //   expect(salesOrder.status).toBe("DRAFT");
  //   expect(salesOrder.salesOrderStatusHistory.length).toBe(1);
  //   expect(salesOrder.salesOrderStatusHistory[0].status).toBe("DRAFT");
  //   expect(salesOrder.salesOrderStatusHistory[0].user.username).toBe("alice");
  // });
  // it("should create a sales order in RECEIVED status", async () => {
  //   await salesOrderService.create({
  //     customerId: 1,
  //     status: "RECEIVED",
  //     deliveryDate: new Date(),
  //     notes: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   });
  //   const salesOrder = await salesOrderService.get(1);
  //   const inventory = await sequelize.models.Inventory.findAll();
  //   expect(salesOrder.status).toBe("RECEIVED");
  //   expect(inventory.length).toBe(2);
  //   expect(inventory[0].quantity).toBe(1);
  //   expect(inventory[1].quantity).toBe(0);
  // });
  // it("should update a sales order", async () => {
  //   await salesOrderService.create({
  //     customerId: 1,

  //     deliveryDate: new Date(),
  //     notes: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   });

  //   await salesOrderService.update(1, {
  //     status: "RECEIVED",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 11,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   });

  //   const salesOrder2 = await salesOrderService.get(1);
  //   expect(salesOrder2.status).toBe("RECEIVED");
  //   expect(salesOrder2.salesOrderItems.length).toBe(2);
  //   expect(salesOrder2.totalAmount).toBe(3100);
  //   expect(salesOrder2.salesOrderStatusHistory.length).toBe(2);
  //   expect(salesOrder2.salesOrderStatusHistory[0].status).toBe("RECEIVED");
  //   expect(salesOrder2.salesOrderStatusHistory[0].user.username).toBe("alice");

  //   const combination = await productCombinationService.get(1);
  //   expect(combination.inventory.quantity).toBe(0);
  //   const combination2 = await productCombinationService.get(2);
  //   expect(combination2.inventory.quantity).toBe(0);

  // });
  // it("should complete a sales order", async () => {
  //   await productCombinationService.stockAdjustment({
  //     combinationId: 1,
  //     newQuantity: 11,
  //     reason: "EXPIRED",
  //     notes: "test",
  //   });
  //   await productCombinationService.stockAdjustment({
  //     combinationId: 2,
  //     newQuantity: 20,
  //     reason: "EXPIRED",
  //     notes: "test",
  //   });

  //   await salesOrderService.create({
  //     customerId: 1,

  //     deliveryDate: new Date(),
  //     notes: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   }); // ✅ Create Sales Order

  //   await salesOrderService.update(1, {
  //     status: "RECEIVED",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 11,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   }); // ✅ Update Sales Order

  //   await salesOrderService.update(1, {
  //     status: "COMPLETED",
  //   }); // ✅ Complete Sales Order
  //   const salesOrder = await salesOrderService.get(1);

  //   expect(salesOrder.status).toBe("COMPLETED");
  //   expect(salesOrder.salesOrderStatusHistory.length).toBe(3);

  //   expect(salesOrder.salesOrderStatusHistory[0].status).toBe("COMPLETED");
  //   expect(salesOrder.salesOrderStatusHistory[0].user.username).toBe("alice");
  // });
  // it("should cancel a sales order", async () => {
  //   const inventory = await sequelize.models.Inventory.findAll();

  //   await salesOrderService.create({
  //     customerId: 1,

  //     deliveryDate: new Date(),
  //     notes: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   });

  //   await salesOrderService.update(1, {
  //     status: "RECEIVED",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 11,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   });

  //   await salesOrderService.cancelOrder(1, {
  //     status: "CANCELLED",
  //     reason: "Test Cancellation Reason",
  //   });
  //   const inventory2 = await sequelize.models.Inventory.findAll();

  //   const salesOrder = await salesOrderService.get(1);
  //   expect(salesOrder.status).toBe("CANCELLED");
  //   expect(salesOrder.cancellationReason).toBe("Test Cancellation Reason");
  //   expect(salesOrder.salesOrderStatusHistory.length).toBe(3);
  //   expect(salesOrder.salesOrderStatusHistory[0].status).toBe("CANCELLED");
  //   expect(salesOrder.salesOrderStatusHistory[0].user.username).toBe("alice");
  //   expect(inventory2.length).toBe(2);
  //   expect(inventory2[0].quantity).toBe(inventory[0].quantity);
  //   expect(inventory2[1].quantity).toBe(inventory[1].quantity);
  // });
  // it("should void a sales order", async () => {
  //   await productCombinationService.stockAdjustment({
  //     combinationId: 1,
  //     newQuantity: 11,
  //     reason: "EXPIRED",
  //     notes: "test",
  //   });

  //   await salesOrderService.create({
  //     customerId: 1,

  //     deliveryDate: new Date(),
  //     notes: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   });

  //   await salesOrderService.delete(1);
  //   const salesOrder = await salesOrderService.get(1);

  //   expect(salesOrder.status).toBe("VOID");
  //   expect(salesOrder.salesOrderStatusHistory.length).toBe(2);
  //   expect(salesOrder.salesOrderStatusHistory[0].status).toBe("VOID");
  //   expect(salesOrder.salesOrderStatusHistory[0].user.username).toBe("alice");
  // });
  // it("should get a paginated list of sales orders", async () => {
  //   await salesOrderService.create({
  //     customerId: 1,

  //     deliveryDate: new Date(),
  //     notes: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   });
  //   await salesOrderService.create({
  //     customerId: 1,

  //     deliveryDate: new Date(),
  //     notes: "Test Notes",
  //     internalNotes: "Test Internal Notes",
  //     salesOrderItems: [
  //       {
  //         combinationId: 1,
  //         quantity: 10,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //       {
  //         combinationId: 2,
  //         quantity: 20,
  //         originalPrice: 100,
  //         purchasePrice: 100,
  //       },
  //     ],
  //     modeOfPayment: "CASH",
  //   });

  //   const salesOrders = await salesOrderService.getPaginated({
  //     page: 1,
  //     limit: 2,
  //   });

  //   expect(salesOrders.data.length).toBe(2);
  //   expect(salesOrders.total).toBe(2);
  //   expect(salesOrders.totalPages).toBe(1);
  //   expect(salesOrders.currentPage).toBe(1);
  // });
  // it("should not allow quantity to be negative", async () => {
  //   await productCombinationService.stockAdjustment({
  //     combinationId: 2,
  //     newQuantity: 2,
  //     reason: "EXPIRED",
  //     notes: "test",
  //   });

  //   try {
  //     await salesOrderService.create({
  //       customerId: 1,

  //       deliveryDate: new Date(),
  //       notes: "Test Notes",
  //       internalNotes: "Test Internal Notes",
  //       salesOrderItems: [
  //         {
  //           combinationId: 1,
  //           quantity: 10,
  //           originalPrice: 100,
  //           purchasePrice: 100,
  //         },
  //         {
  //           combinationId: 2,
  //           quantity: 20,
  //           originalPrice: 100,
  //           purchasePrice: 100,
  //         },
  //       ],
  //       modeOfPayment: "CASH",
  //     });
  //     await salesOrderService.update(1, {
  //       status: "RECEIVED",
  //       salesOrderItems: [
  //         {
  //           combinationId: 1,
  //           quantity: 11,
  //           originalPrice: 100,
  //           purchasePrice: 100,
  //         },
  //         {
  //           combinationId: 2,
  //           quantity: 20,
  //           originalPrice: 100,
  //           purchasePrice: 100,
  //         },
  //       ],
  //       modeOfPayment: "CASH",
  //     });
  //     throw new Error("Expected Error but no error was thrown");
  //   } catch (err) {
  //     console.log("Negative quantity error:", {
  //       name: err.name,
  //       message: err.message,
  //       fields: err.fields,
  //       errors: err.errors?.map((e) => e.message),
  //     });
  //     expect(err.name).toBe("Error");
  //     expect(err.message).toBe("Quantity is greater than inventory");
  //   }
  // });
  it("should update inventory movements", async () => {
    await salesOrderService.create({
      customerId: 1,
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      salesOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          originalPrice: 100,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 20,
          originalPrice: 100,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });

    await salesOrderService.update(1, {
      status: "RECEIVED",
      salesOrderItems: [
        {
          combinationId: 1,
          quantity: 11,
          originalPrice: 100,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 20,
          originalPrice: 100,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });
    const inventoryMovements = await inventoryService.getMovements({});

    expect(inventoryMovements.data.length).toBe(4);
    expect(inventoryMovements.data[1].combinationId).toBe(1);
    expect(inventoryMovements.data[1].type).toBe("OUT");
    expect(inventoryMovements.data[1].dataValues.previous).toBe(11);
    expect(inventoryMovements.data[1].new).toBe(0);
    expect(inventoryMovements.data[1].quantity).toBe(11);

    expect(inventoryMovements.data[0].combinationId).toBe(2);
    expect(inventoryMovements.data[0].type).toBe("OUT");
    expect(inventoryMovements.data[0].dataValues.previous).toBe(20);
    expect(inventoryMovements.data[0].new).toBe(0);
    expect(inventoryMovements.data[0].quantity).toBe(20);
  });

  // it("should throw error when creating for delivery", async () => {
  //   try {
  //     await salesOrderService.create({
  //       customerId: 1,
  //       isDelivery: true,
  //       deliveryDate: new Date(),
  //       notes: "Test Notes",
  //       internalNotes: "Test Internal Notes",
  //       salesOrderItems: [
  //         {
  //           combinationId: 1,
  //           quantity: 10,
  //           originalPrice: 100,
  //           purchasePrice: 100,
  //         },
  //       ],
  //       modeOfPayment: "CASH",
  //     });
  //     throw new Error("Expected Error but no error was thrown");
  //   } catch (error) {
  //     console.log("Validation error:", {
  //       name: error.name,
  //       message: error.message,
  //       fields: error.fields,
  //       errors: error.errors?.map((e) => e.message),
  //     });
  //     expect(error.name).toBe("ValidationError");
  //   }
  //   // const saleOrder = await salesOrderService.get(1);
  //   // expect(saleOrder.isDelivery).toBe(true);
  // });
  // it("should create a sales order for delivery", async () => {
  //   await salesOrderService.create({
  //     customerId: 1,
  //     isDelivery: true,
  //     deliveryAddress: "Test Address",
  //     deliveryDate: new Date(),
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
  //   const saleOrder = await salesOrderService.get(1);
  //   expect(saleOrder.isDelivery).toBe(true);
  //   expect(saleOrder.deliveryAddress).toBe("Test Address");
  // });
  // it("should create a sales order with bank as payment", async () => {
  //   await salesOrderService.create({
  //     customerId: 1,
  //     deliveryDate: new Date(),
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
  //     modeOfPayment: "BANK",
  //   });
  //   const saleOrder = await salesOrderService.get(1);
  //   expect(saleOrder.modeOfPayment).toBe("BANK");
  // });

  it("should create a sales order twice", async () => {
    await salesOrderService.create({
      customerId: 1,
      status: "RECEIVED",
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      salesOrderItems: [
        {
          combinationId: 1,
          quantity: 3,
          originalPrice: 100,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 4,
          originalPrice: 100,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });

    const salesOrder2 = await salesOrderService.get(1);
    expect(salesOrder2.status).toBe("RECEIVED");
    expect(salesOrder2.salesOrderItems.length).toBe(2);
    expect(salesOrder2.totalAmount).toBe(700);
    expect(salesOrder2.salesOrderStatusHistory.length).toBe(2);
    expect(salesOrder2.salesOrderStatusHistory[0].status).toBe("RECEIVED");
    expect(salesOrder2.salesOrderStatusHistory[0].user.username).toBe("alice");

    const combination = await productCombinationService.get(1);
    expect(combination.inventory.quantity).toBe(8);
    const combination2 = await productCombinationService.get(2);
    expect(combination2.inventory.quantity).toBe(16);
    await salesOrderService.create({
      customerId: 1,
      status: "RECEIVED",
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      salesOrderItems: [
        {
          combinationId: 1,
          quantity: 3,
          originalPrice: 100,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 4,
          originalPrice: 100,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });
    const inv = await sequelize.models.Inventory.findAll();
    expect(inv.length).toBe(2);
    expect(inv[0].quantity).toBe(5);
    expect(inv[1].quantity).toBe(12);
  });
});
