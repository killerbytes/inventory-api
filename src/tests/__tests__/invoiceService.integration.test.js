const { setupDatabase, resetDatabase } = require("../setup");
const {
  createCategory,
  createVariantType,
  createUser,
  createProduct,
  createSupplier,
  createCombination,
  loginUser,
  createGoodReceipt,
  createInvoice,
  updateGoodReceiptStatus,
} = require("../utils");
const invoiceService = require("../../services/invoice.service");
const goodReceiptService = require("../../services/goodReceipt.service");
const e = require("express");

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
  await createGoodReceipt(0);
  await createGoodReceipt(1);
  await createGoodReceipt(2);

  const gr = await goodReceiptService.get(1);
  await goodReceiptService.update(1, {
    status: "RECEIVED",
    goodReceiptLines: gr.goodReceiptLines.map((line) => ({
      combinationId: line.combinationId,
      quantity: line.quantity,
      purchasePrice: line.purchasePrice,
    })),
  });

  const gr2 = await goodReceiptService.get(1);
  await goodReceiptService.update(2, {
    status: "RECEIVED",
    goodReceiptLines: gr2.goodReceiptLines.map((line) => ({
      combinationId: line.combinationId,
      quantity: line.quantity,
      purchasePrice: line.purchasePrice,
    })),
  });
  // const lines = [
  //   {
  //     amount: 100,
  //     goodReceiptId: 1,
  //   },
  //   {
  //     amount: 200,
  //     goodReceiptId: 2,
  //   },
  // ];

  // await invoiceService.create({
  //   invoiceNumber: "TEST",
  //   invoiceDate: new Date(),
  //   dueDate: new Date(),
  //   supplierId: 1,
  //   totalAmount: lines.reduce((acc, item) => acc + item.amount, 0),
  //   // status: "DRAFT",
  //   // notes: "Test Notes",
  //   invoiceLines: lines,
  // });
});

describe("Invoice Service (Integration)", () => {
  it("should create and fetch an invoice", async () => {
    await createInvoice(0);
    const invoice = await invoiceService.get(1);

    expect(invoice.invoiceNumber).toBe("TEST");
    expect(invoice.totalAmount).toBe(300);
    expect(invoice.status).toBe("DRAFT");
    expect(invoice.supplierId).toBe(1);
    expect(invoice.dueDate).toBeInstanceOf(Date);
    expect(invoice.invoiceLines.length).toBe(2);
    expect(invoice.invoiceLines[0].amount).toBe(100);
    expect(invoice.invoiceLines[0].goodReceiptId).toBe(1);
  });
  it("should update an invoice", async () => {
    await createInvoice(0);
    const gr3 = { totalAmount: 123, id: 3 };

    const invoice = await invoiceService.get(1);

    await invoiceService.update(1, {
      ...invoice.dataValues,
      notes: "Test Updated",
      invoiceLines: [
        ...invoice.invoiceLines.map((item) => ({
          amount: item.amount,
          goodReceiptId: item.goodReceiptId,
        })),
        { amount: gr3.totalAmount, goodReceiptId: gr3.id },
      ],
    });

    const invoice2 = await invoiceService.get(1);

    expect(invoice2.invoiceNumber).toBe("TEST");
    expect(invoice2.totalAmount).toBe(423);
    expect(invoice2.notes).toBe("Test Updated");
    expect(invoice2.status).toBe("DRAFT");
    expect(invoice2.invoiceLines.length).toBe(3);
    expect(invoice2.invoiceLines[2].amount).toBe(gr3.totalAmount);
    expect(invoice2.invoiceLines[2].goodReceiptId).toBe(gr3.id);
  });

  it("should create an invoices as POSTED", async () => {
    const lines = [
      {
        amount: 100,
        goodReceiptId: 1,
      },
      {
        amount: 200,
        goodReceiptId: 2,
      },
    ];

    await invoiceService.create({
      invoiceNumber: "TEST",
      invoiceDate: new Date(),
      dueDate: new Date(),
      status: "POSTED",
      supplierId: 1,
      totalAmount: lines.reduce((acc, item) => acc + item.amount, 0),
      invoiceLines: lines,
    });
    const invoice = await invoiceService.get(1);
    expect(invoice.status).toBe("POSTED");
  });
  it("should update an invoice to POSTED", async () => {
    await createInvoice(0);
    const invoice = await invoiceService.get(1);

    await invoiceService.update(1, {
      ...invoice.dataValues,
      invoiceLines: invoice.invoiceLines.map((item) => ({
        amount: item.amount,
        goodReceiptId: item.goodReceiptId,
      })),
      status: "POSTED",
    });

    const invoice2 = await invoiceService.get(1);

    const gr = await goodReceiptService.get(1);
    expect(gr.status).toBe("COMPLETED");
    expect(invoice2.invoiceNumber).toBe("TEST");
    expect(invoice2.totalAmount).toBe(300);
    expect(invoice2.status).toBe("POSTED");
    expect(invoice2.invoiceLines.length).toBe(2);
  });

  it("should not allow deletion of invoice after it has been posted", async () => {
    await createInvoice(0);
    const invoice = await invoiceService.get(1);
    await invoiceService.update(1, {
      ...invoice.dataValues,
      status: "POSTED",
    });

    try {
      await invoiceService.delete(1);
      throw new Error(
        "Expected SequelizeUniqueConstraintError but no error was thrown"
      );
    } catch (err) {
      console.log("Prevent delete error:", {
        name: err.name,
        message: err.message,
        fields: err.fields,
        errors: err.errors?.map((e) => e.message),
      });
      expect(err.name).toBe("Error");
      expect(err.message).toBe("Invoice is not in a valid state");
    }
  });

  it("should delete an invoice", async () => {
    await createInvoice(0);
    const deleted = await invoiceService.delete(1);
    expect(deleted).toBe(true);
  });

  it("should fetch all invoices", async () => {
    await createInvoice(0);
    const paginated = await invoiceService.getPaginated({});
    expect(paginated.data.length).toBe(1);
  });
});
