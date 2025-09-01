const { setupDatabase, resetDatabase } = require("../setup");
const purchaseOrdersService = require("../../services/purchaseOrders.service");
const productService = require("../../services/product.service");
const {
  createCategory,
  createVariantType,
  createUser,
  createProduct,
  createSupplier,
  createCombination,
  loginUser,
} = require("../utils");
const { getTotalAmount } = require("../../utils/compute");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createUser(0);
  await createCategory(0);
  await createCategory(1);
  await createProduct(0);
  await createProduct(1);
  await createVariantType(0);
  await createSupplier(0);
  await createCombination(0);
  await loginUser();
});

describe("Product Combination Service (Integration)", () => {
  it("should create a purchase order", async () => {
    const prod = await productService.get(1);

    await purchaseOrdersService.create({
      supplierId: 1,
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      purchaseOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 20,
          discount: 10,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });
    const purchaseOrder = await purchaseOrdersService.get(1);
    expect(purchaseOrder.supplierId).toBe(1);
    expect(purchaseOrder.modeOfPayment).toBe("CASH");
    expect(purchaseOrder.deliveryDate).toBeInstanceOf(Date);
    expect(purchaseOrder.notes).toBe("Test Notes");
    expect(purchaseOrder.internalNotes).toBe("Test Internal Notes");
    expect(purchaseOrder.purchaseOrderItems.length).toBe(2);
    expect(purchaseOrder.totalAmount).toBe(2990);
    expect(purchaseOrder.status).toBe("PENDING");
    expect(purchaseOrder.purchaseOrderStatusHistory.length).toBe(1);
    expect(purchaseOrder.purchaseOrderStatusHistory[0].status).toBe("PENDING");
    expect(purchaseOrder.purchaseOrderStatusHistory[0].user.username).toBe(
      "alice"
    );
  });
  it("should update a purchase order", async () => {
    await purchaseOrdersService.create({
      supplierId: 1,
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      purchaseOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 20,
          discount: 10,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });

    await purchaseOrdersService.update(1, {
      status: "RECEIVED",
      purchaseOrderItems: [
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
      ],
      modeOfPayment: "CASH",
    });

    const purchaseOrder2 = await purchaseOrdersService.get(1);
    expect(purchaseOrder2.status).toBe("RECEIVED");
    expect(purchaseOrder2.totalAmount).toBe(3090);
    expect(purchaseOrder2.purchaseOrderItems.length).toBe(2);
    expect(purchaseOrder2.purchaseOrderItems[0].quantity).toBe(11);
    expect(purchaseOrder2.purchaseOrderStatusHistory.length).toBe(2);
    expect(purchaseOrder2.purchaseOrderStatusHistory[0].status).toBe(
      "RECEIVED"
    );
    expect(purchaseOrder2.purchaseOrderStatusHistory[0].user.username).toBe(
      "alice"
    );
  });

  it("should complete a purchase order", async () => {
    await purchaseOrdersService.create({
      supplierId: 1,
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      purchaseOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 20,
          discount: 10,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });

    await purchaseOrdersService.update(1, {
      status: "RECEIVED",
      purchaseOrderItems: [
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
      ],
      modeOfPayment: "CASH",
    });

    await purchaseOrdersService.update(1, {
      status: "COMPLETED",
    });
    const purchaseOrder = await purchaseOrdersService.get(1);

    expect(purchaseOrder.status).toBe("COMPLETED");
    expect(purchaseOrder.purchaseOrderStatusHistory.length).toBe(3);

    expect(purchaseOrder.purchaseOrderStatusHistory[0].status).toBe(
      "COMPLETED"
    );
    expect(purchaseOrder.purchaseOrderStatusHistory[0].user.username).toBe(
      "alice"
    );
  });

  it("should cancel a purchase order", async () => {
    await purchaseOrdersService.create({
      supplierId: 1,
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      purchaseOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 20,
          discount: 10,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });

    await purchaseOrdersService.update(1, {
      status: "RECEIVED",
      purchaseOrderItems: [
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
      ],
      modeOfPayment: "CASH",
    });

    await purchaseOrdersService.cancelOrder(1, {
      status: "CANCELLED",
      reason: "Test Cancellation Reason",
    });

    const purchaseOrder = await purchaseOrdersService.get(1);
    expect(purchaseOrder.status).toBe("CANCELLED");
    expect(purchaseOrder.cancellationReason).toBe("Test Cancellation Reason");
    expect(purchaseOrder.purchaseOrderStatusHistory.length).toBe(3);
    expect(purchaseOrder.purchaseOrderStatusHistory[0].status).toBe(
      "CANCELLED"
    );
    expect(purchaseOrder.purchaseOrderStatusHistory[0].user.username).toBe(
      "alice"
    );
  });
  it("should void a purchase order", async () => {
    await purchaseOrdersService.create({
      supplierId: 1,
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      purchaseOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 20,
          discount: 10,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });

    await purchaseOrdersService.delete(1);
    const purchaseOrder = await purchaseOrdersService.get(1);

    expect(purchaseOrder.status).toBe("VOID");
    expect(purchaseOrder.purchaseOrderStatusHistory.length).toBe(2);
    expect(purchaseOrder.purchaseOrderStatusHistory[0].status).toBe("VOID");
    expect(purchaseOrder.purchaseOrderStatusHistory[0].user.username).toBe(
      "alice"
    );
  });
  it("should get a paginated list of purchase orders", async () => {
    await purchaseOrdersService.create({
      supplierId: 1,
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      purchaseOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 20,
          discount: 10,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });
    await purchaseOrdersService.create({
      supplierId: 1,
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      purchaseOrderItems: [
        {
          combinationId: 1,
          quantity: 10,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 20,
          discount: 10,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });

    const purchaseOrders = await purchaseOrdersService.getPaginated({
      page: 1,
      limit: 2,
    });

    expect(purchaseOrders.data.length).toBe(2);
    expect(purchaseOrders.total).toBe(2);
    expect(purchaseOrders.totalPages).toBe(1);
    expect(purchaseOrders.currentPage).toBe(1);
  });
});
