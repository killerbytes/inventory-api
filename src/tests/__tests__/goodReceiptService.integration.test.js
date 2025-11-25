const { sequelize, setupDatabase, resetDatabase } = require("../setup");
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
  createGoodReceipt,
} = require("../utils");
const { getTotalAmount } = require("../../utils/compute");
const {
  stockAdjustment,
} = require("../../services/productCombination.service");

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
  await createCombination();
  await loginUser();
});

describe("Good Receipt Service (Integration)", () => {
  it("should create a good receipt", async () => {
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

  it("should update a good receipt", async () => {
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
          purchasePrice: 200,
        },
      ],
    });

    const goodReceipt2 = await goodReceiptService.get(1);
    const inventory = await sequelize.models.Inventory.findAll();

    expect(goodReceipt2.status).toBe("RECEIVED");
    expect(goodReceipt2.totalAmount).toBe(5090);
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
    expect(inventory.length).toBe(2);
    expect(inventory[0].quantity).toBe(11);
    expect(inventory[1].quantity).toBe(20);
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

    await goodReceiptService.update(2, {
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
    const inventory2 = await sequelize.models.Inventory.findAll();

    expect(inventory2.length).toBe(2);
    expect(inventory2[0].quantity).toBe(22);
    expect(inventory2[1].quantity).toBe(40);
  });

  it("should complete a good receipt", async () => {
    //complete status is updated by invoice creation
  });
  it("should void a good receipt", async () => {
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
  it("should get a paginated list of good receipts", async () => {
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
  it("should get a list of good receipts by supplier", async () => {
    await createSupplier(1);
    await createGoodReceipt(0);
    await createGoodReceipt(1);
    await createGoodReceipt(2);
    await createGoodReceipt(3);

    const goodReceipts = await goodReceiptService.getBySupplierId(1, {
      status: "DRAFT",
    });

    expect(goodReceipts.length).toBe(3);
    const goodReceipts2 = await goodReceiptService.getBySupplierId(2, {
      status: "DRAFT",
    });
    expect(goodReceipts2.length).toBe(1);
    const goodReceipts3 = await goodReceiptService.getBySupplierId(2, {
      status: "POSTED",
    });
    expect(goodReceipts3.length).toBe(0);
  });

  it("should not allow return if status is DRAFT", async () => {
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

    const returns = [
      {
        combinationId: 1,
        quantity: 11,
      },
      {
        combinationId: 2,
        quantity: 20,
      },
    ];
    try {
      const result = await goodReceiptService.supplierReturns(
        1,
        returns,
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
      expect(error.message).toBe("Good Receipt is not in a valid state: DRAFT");
    }
  });

  it("should not allow return if status is VOID", async () => {
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

    const returns = [
      {
        combinationId: 1,
        quantity: 11,
      },
      {
        combinationId: 2,
        quantity: 20,
      },
    ];
    try {
      await goodReceiptService.supplierReturns(1, returns, "reason");
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
      expect(error.message).toBe("Good Receipt is not in a valid state: VOID");
    }
  });

  it("should return to supplier", async () => {
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

    const returns = [
      {
        combinationId: 1,
        quantity: 11,
      },
      {
        combinationId: 2,
        quantity: 20,
      },
    ];

    const result = await goodReceiptService.supplierReturns(
      1,
      returns,
      "reason"
    );
    const inventory = await sequelize.models.Inventory.findAll();
    const inventoryMovement =
      await sequelize.models.InventoryMovement.findAll();
    const returnTransaction =
      await sequelize.models.ReturnTransaction.findAll();
    const returnItems = await sequelize.models.ReturnItem.findAll();

    expect(result.success).toBe(true);
    expect(inventory[0].quantity).toBe(0);
    expect(inventory[0].averagePrice).toBe(100);
    expect(inventory[1].quantity).toBe(0);
    expect(inventory[1].averagePrice).toBe(99.5);
    expect(inventoryMovement.length).toBe(4);
    expect(inventoryMovement[2].id).toBe(3);
    expect(inventoryMovement[2].type).toBe("SUPPLIER_RETURN");
    expect(inventoryMovement[2].referenceType).toBe("GOOD_RECEIPT");
    expect(inventoryMovement[2].quantity).toBe(11);
    expect(inventoryMovement[3].type).toBe("SUPPLIER_RETURN");
    expect(inventoryMovement[3].referenceType).toBe("GOOD_RECEIPT");
    expect(inventoryMovement[3].quantity).toBe(20);
    expect(returnTransaction.length).toBe(1);
    expect(returnTransaction[0].id).toBe(1);
    expect(returnTransaction[0].sourceType).toBe("PURCHASE");
    expect(returnTransaction[0].type).toBe("SUPPLIER_RETURN");
    expect(returnTransaction[0].totalReturnAmount).toBe(3090);
    expect(returnTransaction[0].paymentDifference).toBe(-3090);
    expect(returnItems.length).toBe(2);
    expect(returnItems[0].id).toBe(1);
    expect(returnItems[0].returnTransactionId).toBe(1);
    expect(returnItems[0].quantity).toBe(11);
    expect(returnItems[0].unitPrice).toBe(100);
    expect(returnItems[0].reason).toBe("reason");
    expect(returnItems[0].combinationId).toBe(1);
    expect(returnItems[0].totalAmount).toBe(1100);
    expect(returnItems[1].id).toBe(2);
    expect(returnItems[1].returnTransactionId).toBe(1);
    expect(returnItems[1].quantity).toBe(20);
    expect(returnItems[1].unitPrice).toBe(99.5);
    expect(returnItems[1].reason).toBe("reason");
    expect(returnItems[1].combinationId).toBe(2);
    expect(returnItems[1].totalAmount).toBe(1990);
  });

  it("should return to supplier twice", async () => {
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
      ],
    });
    await goodReceiptService.update(1, {
      status: "RECEIVED",
      goodReceiptLines: [
        {
          combinationId: 1,
          quantity: 10,
          purchasePrice: 100,
        },
      ],
    });

    const returns = [
      {
        combinationId: 1,
        quantity: 1,
      },
      {
        combinationId: 2,
        quantity: 0,
      },
    ];

    await goodReceiptService.supplierReturns(1, returns, "reason");
    await goodReceiptService.supplierReturns(1, returns, "reason");

    const returnTransaction =
      await sequelize.models.ReturnTransaction.findAll();
    const returnItems = await sequelize.models.ReturnItem.findAll();

    expect(returnTransaction.length).toBe(2);
    expect(returnTransaction[0].id).toBe(1);
    expect(returnTransaction[0].referenceId).toBe(1);
    expect(returnTransaction[0].sourceType).toBe("PURCHASE");
    expect(returnTransaction[0].type).toBe("SUPPLIER_RETURN");
    expect(returnTransaction[0].totalReturnAmount).toBe(100);
    expect(returnTransaction[0].paymentDifference).toBe(-100);
    expect(returnTransaction[1].id).toBe(2);
    expect(returnTransaction[1].referenceId).toBe(1);
    expect(returnTransaction[1].sourceType).toBe("PURCHASE");
    expect(returnTransaction[1].type).toBe("SUPPLIER_RETURN");
    expect(returnTransaction[1].totalReturnAmount).toBe(100);
    expect(returnTransaction[1].paymentDifference).toBe(-100);
    expect(returnItems.length).toBe(2);
    expect(returnItems[0].id).toBe(1);
    expect(returnItems[0].returnTransactionId).toBe(1);
    expect(returnItems[0].quantity).toBe(1);
    expect(returnItems[0].unitPrice).toBe(100);
    expect(returnItems[0].reason).toBe("reason");
    expect(returnItems[0].combinationId).toBe(1);
    expect(returnItems[0].totalAmount).toBe(100);
    expect(returnItems[1].id).toBe(2);
    expect(returnItems[1].returnTransactionId).toBe(2);
    expect(returnItems[1].quantity).toBe(1);
    expect(returnItems[1].unitPrice).toBe(100);
    expect(returnItems[1].reason).toBe("reason");
    expect(returnItems[1].combinationId).toBe(1);
    expect(returnItems[1].totalAmount).toBe(100);
  });

  it("should not allow return to supplier if more than the actual order quantity", async () => {
    await stockAdjustment({
      combinationId: 1,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
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
      ],
    });
    await goodReceiptService.update(1, {
      status: "RECEIVED",
      goodReceiptLines: [
        {
          combinationId: 1,
          quantity: 10,
          purchasePrice: 100,
        },
      ],
    });

    const returns = [
      {
        combinationId: 1,
        quantity: 2,
      },
    ];

    try {
      await goodReceiptService.supplierReturns(1, returns, "reason");
      await goodReceiptService.supplierReturns(1, returns, "reason");
      await goodReceiptService.supplierReturns(
        1,
        [
          {
            combinationId: 1,
            quantity: 10,
          },
        ],
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
  });
});
