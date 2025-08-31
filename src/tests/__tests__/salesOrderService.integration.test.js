const { setupDatabase, resetDatabase } = require("../setup");
const salesOrderService = require("../../services/salesOrder.service");

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

describe("Sales Order Service (Integration)", () => {
  it("should create a sale order", async () => {
    await salesOrderService.create({
      customerId: 1,
      orderDate: new Date(),
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
    const salesOrder = await salesOrdersService.get(1);
    expect(salesOrder.customerId).toBe(1);
    expect(salesOrder.modeOfPayment).toBe("CASH");
    expect(salesOrder.deliveryDate).toBeInstanceOf(Date);
    expect(salesOrder.notes).toBe("Test Notes");
    expect(salesOrder.internalNotes).toBe("Test Internal Notes");
    expect(salesOrder.salesOrderItems.length).toBe(2);
    expect(salesOrder.totalAmount).toBe(2990);
    expect(salesOrder.status).toBe("PENDING");
    expect(salesOrder.salesOrderStatusHistory.length).toBe(1);
    expect(salesOrder.salesOrderStatusHistory[0].status).toBe("PENDING");
    expect(salesOrder.salesOrderStatusHistory[0].user.username).toBe("alice");
  });
});
