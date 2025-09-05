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
} = require("../utils");
const invoiceService = require("../../services/invoice.service");
const goodReceiptService = require("../../services/goodReceipt.service");
const e = require("express");
const { create } = require("../../services/product.service");

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
  // await createGoodReceipt(1);
  const res = await goodReceiptService.getPaginated({});

  const lines = res.data.map((item) => {
    return {
      amount: item.totalAmount,
      goodReceiptId: item.id,
    };
  });

  await invoiceService.create({
    invoiceNumber: "TEST",
    invoiceDate: new Date(),
    dueDate: new Date(),
    status: "DRAFT",
    totalAmount: lines.reduce((acc, item) => acc + item.amount, 0),
    notes: "Test Notes",
    lines,
  });
});

describe("Invoice Service (Integration)", () => {
  it("should create and fetch an invoice", async () => {
    const invoice = await invoiceService.get(1);
    // console.log(invoice.lines);
    // expect(invoice.invoiceNumber).toBe("TEST");
    // expect(invoice.totalAmount).toBe(5980);
    // expect(invoice.notes).toBe("Test Notes");
    // expect(invoice.status).toBe("DRAFT");
    // expect(invoice.lines.length).toBe(2);
    // expect(invoice.lines[0].amount).toBe(2990);
  });
  // it("should update an invoice", async () => {
  //   const gr3 = await createGoodReceipt(2);

  //   const res = await invoiceService.get(1);
  //   invoice = res.dataValues;

  //   const updated = await invoiceService.update(1, {
  //     ...invoice,
  //     // lines: [...invoice.lines, gr3],
  //   });

  //   //   // const invoice2 = await invoiceService.get(1);

  //   //   // expect(invoice2.lines.length).toBe(3);
  // });

  // it("should fetch all invoices", async () => {
  //   const paginated = await invoiceService.getPaginated({});
  //   console.log(paginated);
  // });
});
