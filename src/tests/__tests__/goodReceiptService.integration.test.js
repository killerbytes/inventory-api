const { setupDatabase, resetDatabase } = require("../setup");
const goodReceiptService = require("../../services/goodReceipt.service");
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
    await goodReceiptService.create({
      supplierId: 1,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
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
    });
    const goodReceipt = await goodReceiptService.get(1);
    console.log(55, goodReceipt);

    expect(goodReceipt.supplierId).toBe(1);
    expect(goodReceipt.receiptDate).toBeInstanceOf(Date);
    expect(goodReceipt.referenceNo).toBe("Test Notes");
    expect(goodReceipt.internalNotes).toBe("Test Internal Notes");
    expect(goodReceipt.goodReceiptLines.length).toBe(2);
    expect(goodReceipt.totalAmount).toBe(2990);
    expect(goodReceipt.status).toBe("DRAFT");
    expect(goodReceipt.goodReceiptStatusHistory.length).toBe(1);
    expect(goodReceipt.goodReceiptStatusHistory[0].status).toBe("DRAFT");
    expect(goodReceipt.goodReceiptStatusHistory[0].user.username).toBe("alice");
  });
  it("should update a purchase order", async () => {
    await goodReceiptService.create({
      supplierId: 1,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
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
    });

    await goodReceiptService.update(1, {
      status: "RECEIVED",
      goodReceiptLines: [
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
    });

    const goodReceipt2 = await goodReceiptService.get(1);
    expect(goodReceipt2.status).toBe("RECEIVED");
    expect(goodReceipt2.totalAmount).toBe(3090);
    expect(goodReceipt2.goodReceiptLines.length).toBe(2);
    expect(goodReceipt2.goodReceiptLines[0].quantity).toBe(11);
    expect(goodReceipt2.goodReceiptLines[0].nameSnapshot).toBe("Shovel - Red");

    expect(goodReceipt2.goodReceiptLines[0].categorySnapshot.name).toBe(
      "Tools"
    );
    expect(goodReceipt2.goodReceiptLines[0].categorySnapshot.id).toBe(1);
    expect(goodReceipt2.goodReceiptLines[0].variantSnapshot).toMatchObject({
      Colors: "Red",
    });
    expect(goodReceipt2.goodReceiptLines[0].skuSnapshot).toBe("01|SHO|BOX|RED");

    expect(goodReceipt2.goodReceiptStatusHistory.length).toBe(2);
    expect(goodReceipt2.goodReceiptStatusHistory[0].status).toBe("RECEIVED");
    expect(goodReceipt2.goodReceiptStatusHistory[0].user.username).toBe(
      "alice"
    );
  });

  it("should complete a purchase order", async () => {
    await goodReceiptService.create({
      supplierId: 1,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
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
    });

    await goodReceiptService.update(1, {
      status: "RECEIVED",
      goodReceiptLines: [
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
    });

    await goodReceiptService.update(1, {
      status: "COMPLETED",
    });
    const goodReceipt = await goodReceiptService.get(1);

    expect(goodReceipt.status).toBe("COMPLETED");
    expect(goodReceipt.goodReceiptStatusHistory.length).toBe(3);

    expect(goodReceipt.goodReceiptStatusHistory[0].status).toBe("COMPLETED");
    expect(goodReceipt.goodReceiptStatusHistory[0].user.username).toBe("alice");
  });

  it("should cancel a purchase order", async () => {
    await goodReceiptService.create({
      supplierId: 1,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
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
    });

    await goodReceiptService.update(1, {
      status: "RECEIVED",
      goodReceiptLines: [
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
    });

    await goodReceiptService.cancelOrder(1, {
      status: "CANCELLED",
      reason: "Test Cancellation Reason",
    });

    const goodReceipt = await goodReceiptService.get(1);
    expect(goodReceipt.status).toBe("CANCELLED");
    expect(goodReceipt.cancellationReason).toBe("Test Cancellation Reason");
    expect(goodReceipt.goodReceiptStatusHistory.length).toBe(3);
    expect(goodReceipt.goodReceiptStatusHistory[0].status).toBe("CANCELLED");
    expect(goodReceipt.goodReceiptStatusHistory[0].user.username).toBe("alice");
  });
  it("should void a purchase order", async () => {
    await goodReceiptService.create({
      supplierId: 1,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
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
    });

    await goodReceiptService.delete(1);
    const goodReceipt = await goodReceiptService.get(1);

    expect(goodReceipt.status).toBe("VOID");
    expect(goodReceipt.goodReceiptStatusHistory.length).toBe(2);
    expect(goodReceipt.goodReceiptStatusHistory[0].status).toBe("VOID");
    expect(goodReceipt.goodReceiptStatusHistory[0].user.username).toBe("alice");
  });
  it("should get a paginated list of purchase orders", async () => {
    await goodReceiptService.create({
      supplierId: 1,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
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
    });
    await goodReceiptService.create({
      supplierId: 1,
      receiptDate: new Date(),
      referenceNo: "Test Notes",
      internalNotes: "Test Internal Notes",
      goodReceiptLines: [
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
    });

    const goodReceipts = await goodReceiptService.getPaginated({
      page: 1,
      limit: 2,
    });

    expect(goodReceipts.data.length).toBe(2);
    expect(goodReceipts.total).toBe(2);
    expect(goodReceipts.totalPages).toBe(1);
    expect(goodReceipts.currentPage).toBe(1);
  });
});
