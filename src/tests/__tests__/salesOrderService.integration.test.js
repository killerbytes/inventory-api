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
  createUpdateGoodReceipt,
} = require("../utils");
const productCombinationService = require("../../services/productCombination.service");
const inventoryService = require("../../services/inventory.service");
const goodReceiptService = require("../../services/goodReceipt.service");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createUser();
  await createCustomer();
  await createCategory();
  await createCategory(1);
  await createProduct();
  await createProduct(1);
  await createProduct(2);
  await createVariantType();
  await createSupplier();
  await createCombination();

  await createUpdateGoodReceipt([
    {
      combinationId: 1,
      quantity: 11,
      purchasePrice: 100,
    },
    {
      combinationId: 2,
      quantity: 20,
      discount: 10,
      purchasePrice: 100,
    },
  ]);

  await loginUser();
});

describe("Sales Order Service (Integration)", () => {
  it("should create a sale order", async () => {
    await salesOrderService.create({
      customerId: 1,
      orderDate: new Date(),
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
    const salesOrder = await salesOrderService.get(1);
    expect(salesOrder.customerId).toBe(1);
    expect(salesOrder.orderDate).toBeInstanceOf(Date);
    expect(salesOrder.modeOfPayment).toBe("CASH");
    expect(salesOrder.notes).toBe("Test Notes");
    expect(salesOrder.internalNotes).toBe("Test Internal Notes");
    expect(salesOrder.salesOrderItems.length).toBe(2);
    expect(salesOrder.totalAmount).toBe(3000);
    expect(salesOrder.status).toBe("DRAFT");
    expect(salesOrder.salesOrderStatusHistory.length).toBe(1);
    expect(salesOrder.salesOrderStatusHistory[0].status).toBe("DRAFT");
    expect(salesOrder.salesOrderStatusHistory[0].user.username).toBe("alice");
  });
  it("should create a sales order in RECEIVED status", async () => {
    await salesOrderService.create({
      customerId: 1,
      status: "RECEIVED",
      orderDate: new Date(),
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
    const salesOrder = await salesOrderService.get(1);
    const inventory = await sequelize.models.Inventory.findAll();
    expect(salesOrder.status).toBe("RECEIVED");
    expect(inventory.length).toBe(2);
    expect(inventory[0].quantity).toBe(1);
    expect(inventory[1].quantity).toBe(0);
  });
  it("should update a sales order", async () => {
    await salesOrderService.create({
      customerId: 1,
      orderDate: new Date(),
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
          discount: 100,
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
    const salesOrder2 = await salesOrderService.get(1);
    expect(salesOrder2.status).toBe("RECEIVED");
    expect(salesOrder2.salesOrderItems.length).toBe(2);
    expect(salesOrder2.salesOrderItems[0].discount).toBe(100);
    expect(salesOrder2.totalAmount).toBe(3000);
    expect(salesOrder2.salesOrderStatusHistory.length).toBe(2);
    expect(salesOrder2.salesOrderStatusHistory[0].status).toBe("RECEIVED");
    expect(salesOrder2.salesOrderStatusHistory[0].user.username).toBe("alice");
    const combination = await productCombinationService.get(1);
    expect(combination.inventory.quantity).toBe(0);
    const combination2 = await productCombinationService.get(2);
    expect(combination2.inventory.quantity).toBe(0);
  });
  it("should complete a sales order", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: 1,
      newQuantity: 11,
      reason: "EXPIRED",
      notes: "test",
    });
    await productCombinationService.stockAdjustment({
      combinationId: 2,
      newQuantity: 20,
      reason: "EXPIRED",
      notes: "test",
    });
    await salesOrderService.create({
      customerId: 1,
      orderDate: new Date(),
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
    }); // ✅ Create Sales Order
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
    }); // ✅ Update Sales Order
    await salesOrderService.update(1, {
      status: "COMPLETED",
    }); // ✅ Complete Sales Order
    const salesOrder = await salesOrderService.get(1);
    expect(salesOrder.status).toBe("COMPLETED");
    expect(salesOrder.salesOrderStatusHistory.length).toBe(3);
    expect(salesOrder.salesOrderStatusHistory[0].status).toBe("COMPLETED");
    expect(salesOrder.salesOrderStatusHistory[0].user.username).toBe("alice");
  });
  it("should cancel a sales order", async () => {
    const inventory = await sequelize.models.Inventory.findAll();
    await salesOrderService.create({
      customerId: 1,
      orderDate: new Date(),
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
    await salesOrderService.cancelOrder(1, {
      status: "CANCELLED",
      reason: "Test Cancellation Reason",
    });
    const inventory2 = await sequelize.models.Inventory.findAll();
    const salesOrder = await salesOrderService.get(1);
    expect(salesOrder.status).toBe("CANCELLED");
    expect(salesOrder.cancellationReason).toBe("Test Cancellation Reason");
    expect(salesOrder.salesOrderStatusHistory.length).toBe(3);
    expect(salesOrder.salesOrderStatusHistory[0].status).toBe("CANCELLED");
    expect(salesOrder.salesOrderStatusHistory[0].user.username).toBe("alice");
    expect(inventory2.length).toBe(2);
    expect(inventory2[0].quantity).toBe(inventory[0].quantity);
    expect(inventory2[1].quantity).toBe(inventory[1].quantity);
  });
  it("should void a sales order", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: 1,
      newQuantity: 11,
      reason: "EXPIRED",
      notes: "test",
    });
    await salesOrderService.create({
      customerId: 1,
      orderDate: new Date(),
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
    await salesOrderService.delete(1);
    const salesOrder = await salesOrderService.get(1);
    expect(salesOrder.status).toBe("VOID");
    expect(salesOrder.salesOrderStatusHistory.length).toBe(2);
    expect(salesOrder.salesOrderStatusHistory[0].status).toBe("VOID");
    expect(salesOrder.salesOrderStatusHistory[0].user.username).toBe("alice");
  });
  it("should get a paginated list of sales orders", async () => {
    await salesOrderService.create({
      customerId: 1,
      orderDate: new Date(),
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
    await salesOrderService.create({
      customerId: 1,
      orderDate: new Date(),
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
    const salesOrders = await salesOrderService.getPaginated({
      page: 1,
      limit: 2,
    });
    expect(salesOrders.data.length).toBe(2);
    expect(salesOrders.total).toBe(2);
    expect(salesOrders.totalPages).toBe(1);
    expect(salesOrders.currentPage).toBe(1);
  });
  it("should not allow quantity to be negative", async () => {
    await productCombinationService.stockAdjustment({
      combinationId: 2,
      newQuantity: 2,
      reason: "EXPIRED",
      notes: "test",
    });
    try {
      await salesOrderService.create({
        customerId: 1,
        orderDate: new Date(),
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
      throw new Error("Expected Error but no error was thrown");
    } catch (err) {
      console.log("Negative quantity error:", {
        name: err.name,
        message: err.message,
        fields: err.fields,
        errors: err.errors?.map((e) => e.message),
      });
      expect(err.name).toBe("Error");
      expect(err.message).toBe("Quantity is greater than inventory");
    }
  });
  it("should update inventory movements", async () => {
    await salesOrderService.create({
      customerId: 1,
      orderDate: new Date(),
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
    expect(inventoryMovements.data[1].quantity).toBe(11);
    expect(inventoryMovements.data[0].combinationId).toBe(2);
    expect(inventoryMovements.data[0].type).toBe("OUT");
    expect(inventoryMovements.data[0].quantity).toBe(20);
  });
  it("should throw error when creating for delivery", async () => {
    try {
      await salesOrderService.create({
        customerId: 1,
        isDelivery: true,
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
        ],
        modeOfPayment: "CASH",
      });
      throw new Error("Expected Error but no error was thrown");
    } catch (error) {
      console.log("Validation error:", {
        name: error.name,
        message: error.message,
        fields: error.fields,
        errors: error.errors?.map((e) => e.message),
      });
      expect(error.name).toBe("ValidationError");
    }
    // const saleOrder = await salesOrderService.get(1);
    // expect(saleOrder.isDelivery).toBe(true);
  });
  it("should create a sales order for delivery", async () => {
    await salesOrderService.create({
      customerId: 1,
      isDelivery: true,
      orderDate: new Date(),
      deliveryAddress: "Test Address",
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
      ],
      modeOfPayment: "CASH",
    });
    const salesOrder = await salesOrderService.get(1);
    expect(salesOrder.isDelivery).toBe(true);
    expect(salesOrder.deliveryDate).toBeInstanceOf(Date);
    expect(salesOrder.deliveryAddress).toBe("Test Address");
  });
  it("should create a sales order with bank as payment", async () => {
    await salesOrderService.create({
      customerId: 1,
      orderDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      salesOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          originalPrice: 100,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "BANK",
    });
    const saleOrder = await salesOrderService.get(1);
    expect(saleOrder.modeOfPayment).toBe("BANK");
  });
  it("should create a sales order twice", async () => {
    await salesOrderService.create({
      customerId: 1,
      status: "RECEIVED",
      orderDate: new Date(),
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
      orderDate: new Date(),
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

  it("should return item", async () => {
    await salesOrderService.create({
      customerId: 1,
      status: "RECEIVED",
      orderDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      salesOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          originalPrice: 100,
          purchasePrice: 100,
          discount: 100,
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
    const returns = [
      {
        combinationId: 1,
        quantity: 10,
      },
      {
        combinationId: 2,
        quantity: 20,
      },
    ];
    const inventory = await sequelize.models.Inventory.findAll();
    await salesOrderService.returnExchange(1, returns, undefined, "reason");
    const inventory2 = await sequelize.models.Inventory.findAll();
    const inventoryMovement =
      await sequelize.models.InventoryMovement.findAll();
    const returnTransaction =
      await sequelize.models.ReturnTransaction.findAll();
    const returnItems = await sequelize.models.ReturnItem.findAll();
    expect(inventory[0].quantity).toBe(1);
    expect(inventory[1].quantity).toBe(0);
    expect(inventory2[0].quantity).toBe(11);
    expect(inventory2[1].quantity).toBe(20);
    expect(inventoryMovement.length).toBe(6);
    expect(inventoryMovement[4].id).toBe(5);
    expect(inventoryMovement[4].type).toBe("RETURN");
    expect(inventoryMovement[4].referenceType).toBe("SALES_ORDER");
    expect(inventoryMovement[4].quantity).toBe(10);
    expect(inventoryMovement[4].costPerUnit).toBe(90);
    expect(inventoryMovement[4].totalCost).toBe(900);
    expect(inventoryMovement[5].id).toBe(6);
    expect(inventoryMovement[5].type).toBe("RETURN");
    expect(inventoryMovement[5].referenceType).toBe("SALES_ORDER");
    expect(inventoryMovement[5].quantity).toBe(20);
    expect(inventoryMovement[5].costPerUnit).toBe(100);
    expect(inventoryMovement[5].totalCost).toBe(2000);
    expect(returnTransaction.length).toBe(1);
    expect(returnTransaction[0].id).toBe(1);
    expect(returnTransaction[0].sourceType).toBe("SALE");
    expect(returnTransaction[0].type).toBe("RETURN");
    expect(returnTransaction[0].totalReturnAmount).toBe(2900);
    expect(returnTransaction[0].paymentDifference).toBe(-2900);
    expect(returnItems.length).toBe(2);
    expect(returnItems[0].id).toBe(1);
    expect(returnItems[0].returnTransactionId).toBe(1);
    expect(returnItems[0].quantity).toBe(10);
    expect(returnItems[0].unitPrice).toBe(90);
    expect(returnItems[0].reason).toBe("reason");
    expect(returnItems[0].combinationId).toBe(1);
    expect(returnItems[0].totalAmount).toBe(900);
    expect(returnItems[1].id).toBe(2);
    expect(returnItems[1].returnTransactionId).toBe(1);
    expect(returnItems[1].quantity).toBe(20);
    expect(returnItems[1].unitPrice).toBe(100);
    expect(returnItems[1].reason).toBe("reason");
    expect(returnItems[1].combinationId).toBe(2);
    expect(returnItems[1].totalAmount).toBe(2000);
  });

  it("should return and exchange item", async () => {
    await createVariantType(3);
    await productCombinationService.updateByProductId(2, {
      combinations: [
        {
          price: 100,
          unit: "BOX",
          reorderLevel: 1,
          conversionFactor: 24,
          values: [
            {
              value: "20A",
              variantTypeId: 2,
            },
          ],
        },
        {
          price: 100,
          unit: "PCS",
          reorderLevel: 1,
          conversionFactor: 1,
          isBreakPackOfId: 1,
          values: [
            {
              value: "20A",
              variantTypeId: 2,
            },
          ],
        },
      ],
    });

    await goodReceiptService.create({
      supplierId: 1,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
        {
          combinationId: 3,
          quantity: 123,
          purchasePrice: 100,
        },
      ],
    });
    await goodReceiptService.update(2, {
      status: "RECEIVED",
      goodReceiptLines: [
        {
          combinationId: 3,
          quantity: 123,
          purchasePrice: 100,
        },
      ],
    });

    await salesOrderService.create({
      customerId: 1,
      status: "RECEIVED",
      orderDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      salesOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          originalPrice: 100,
          purchasePrice: 100,
          discount: 100,
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
    const returns = [
      {
        combinationId: 1,
        quantity: 10,
      },
      {
        combinationId: 2,
        quantity: 20,
      },
    ];
    const exchanges = [
      {
        combinationId: 3,
        quantity: 10,
      },
    ];
    const inventory = await sequelize.models.Inventory.findAll();
    await salesOrderService.returnExchange(1, returns, exchanges, "reason");
    const inventory2 = await sequelize.models.Inventory.findAll();
    const inventoryMovement =
      await sequelize.models.InventoryMovement.findAll();
    const returnTransaction =
      await sequelize.models.ReturnTransaction.findAll();
    const returnItems = await sequelize.models.ReturnItem.findAll();
    expect(inventory[0].quantity).toBe(1);
    expect(inventory[1].quantity).toBe(0);
    expect(inventory[2].quantity).toBe(123);
    expect(inventory2[0].quantity).toBe(11);
    expect(inventory2[1].quantity).toBe(20);
    expect(inventory2[2].quantity).toBe(113);
    expect(inventoryMovement.length).toBe(8);
    expect(inventoryMovement[5].id).toBe(6);
    expect(inventoryMovement[5].combinationId).toBe(1);
    expect(inventoryMovement[5].type).toBe("RETURN_EXCHANGE");
    expect(inventoryMovement[5].referenceType).toBe("SALES_ORDER");
    expect(inventoryMovement[5].quantity).toBe(10);
    expect(inventoryMovement[5].costPerUnit).toBe(90);
    expect(inventoryMovement[5].totalCost).toBe(900);
    expect(inventoryMovement[6].id).toBe(7);
    expect(inventoryMovement[6].combinationId).toBe(2);
    expect(inventoryMovement[6].type).toBe("RETURN_EXCHANGE");
    expect(inventoryMovement[6].referenceType).toBe("SALES_ORDER");
    expect(inventoryMovement[6].quantity).toBe(20);
    expect(inventoryMovement[6].costPerUnit).toBe(100);
    expect(inventoryMovement[6].totalCost).toBe(2000);
    expect(inventoryMovement[7].id).toBe(8);
    expect(inventoryMovement[7].combinationId).toBe(3);
    expect(inventoryMovement[7].type).toBe("SALE_EXCHANGE");
    expect(inventoryMovement[7].referenceType).toBe("SALES_ORDER");
    expect(inventoryMovement[7].quantity).toBe(10);
    expect(inventoryMovement[7].costPerUnit).toBe(100);
    expect(inventoryMovement[7].totalCost).toBe(1000);
    expect(returnTransaction.length).toBe(1);
    expect(returnTransaction[0].id).toBe(1);
    expect(returnTransaction[0].sourceType).toBe("SALE");
    expect(returnTransaction[0].type).toBe("RETURN_EXCHANGE");
    expect(returnTransaction[0].totalReturnAmount).toBe(2900);
    expect(returnTransaction[0].paymentDifference).toBe(-1900);
    expect(returnItems.length).toBe(3);
    expect(returnItems[0].id).toBe(1);
    expect(returnItems[0].returnTransactionId).toBe(1);
    expect(returnItems[0].quantity).toBe(10);
    expect(returnItems[0].unitPrice).toBe(90);
    expect(returnItems[0].reason).toBe("reason");
    expect(returnItems[0].combinationId).toBe(1);
    expect(returnItems[0].totalAmount).toBe(900);
    expect(returnItems[1].id).toBe(2);
    expect(returnItems[1].returnTransactionId).toBe(1);
    expect(returnItems[1].quantity).toBe(20);
    expect(returnItems[1].unitPrice).toBe(100);
    expect(returnItems[1].reason).toBe("reason");
    expect(returnItems[1].combinationId).toBe(2);
    expect(returnItems[1].totalAmount).toBe(2000);
    expect(returnItems[2].returnTransactionId).toBe(1);
    expect(returnItems[2].quantity).toBe(10);
    expect(returnItems[2].unitPrice).toBe(100);
    expect(returnItems[2].reason).toBe("Replacement");
    expect(returnItems[2].combinationId).toBe(3);
    expect(returnItems[2].totalAmount).toBe(1000);
  });

  it("should allow return item more than once", async () => {
    await salesOrderService.create({
      customerId: 1,
      status: "RECEIVED",
      orderDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      salesOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          originalPrice: 100,
          purchasePrice: 100,
          discount: 100,
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
    const returns = [
      {
        combinationId: 1,
        quantity: 1,
      },
    ];
    await salesOrderService.returnExchange(1, returns, undefined, "reason");
    await salesOrderService.returnExchange(1, returns, undefined, "reason");
    await salesOrderService.returnExchange(1, returns, undefined, "reason");

    const returnTransaction =
      await sequelize.models.ReturnTransaction.findAll();
    const returnItems = await sequelize.models.ReturnItem.findAll();

    expect(returnTransaction.length).toBe(3);
    expect(returnItems.length).toBe(3);
  });

  it("should not allow return if more than the actual order quantity", async () => {
    await salesOrderService.create({
      customerId: 1,
      status: "RECEIVED",
      orderDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      salesOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          originalPrice: 100,
          purchasePrice: 100,
          discount: 100,
        },
      ],
      modeOfPayment: "CASH",
    });
    const returns = [
      {
        combinationId: 1,
        quantity: "1",
      },
    ];

    try {
      await salesOrderService.returnExchange(1, returns, null, "reason");
      await salesOrderService.returnExchange(1, returns, null, "reason");
      await salesOrderService.returnExchange(
        1,
        [
          {
            combinationId: 1,
            quantity: "123",
          },
        ],
        null,
        "reason"
      );
      throw new Error(
        "Expected SequelizeUniqueConstraintError but no error was thrown"
      );
    } catch (error) {
      console.log("Unique error:", {
        name: error.name,
        message: error.message,
        fields: error.fields,
        errors: error.errors?.map((e) => e.message),
      });

      expect(error.name).toBe("Error");
      expect(error.message).toBe("Return quantity exceeds order quantity");
    }

    const returnTransaction =
      await sequelize.models.ReturnTransaction.findAll();
    const returnItems = await sequelize.models.ReturnItem.findAll();

    expect;
  });
});
