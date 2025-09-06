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
} = require("../utils");
const paymentService = require("../../services/payment.service");
const invoiceService = require("../../services/invoice.service");
const { application } = require("express");
const app = require("../../app");

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
  await createInvoice();
});

describe("Payment Service (Integration)", () => {
  it("should create and fetch an payment", async () => {
    await paymentService.create({
      supplierId: 1,
      paymentDate: new Date(),
      referenceNo: "CHECK#001",
      amount: 300,
      changedBy: 1,
      applications: [
        {
          invoiceId: 1,
          amountApplied: 70,
        },
        {
          invoiceId: 1,
          amountApplied: 10,
        },
      ],
    });
    const payment = await paymentService.get(1);

    expect(payment).not.toBeNull();
    expect(payment.referenceNo).toBe("CHECK#001");
    expect(payment.amount).toBe(300);
    expect(payment.changedBy).toBe(1);
    const invoice = await invoiceService.get(1);
    expect(invoice.status).toBe("PARTIALLY_PAID");
    console.log(invoice.applications);
  });
  it("should create and fully paid a payment", async () => {
    await paymentService.create({
      supplierId: 1,
      paymentDate: new Date(),
      referenceNo: "CHECK#001",
      amount: 300,
      changedBy: 1,
      applications: [
        {
          invoiceId: 1,
          amountApplied: 300,
        },
      ],
    });
    const payment = await paymentService.get(1);

    expect(payment).not.toBeNull();
    expect(payment.referenceNo).toBe("CHECK#001");
    expect(payment.amount).toBe(300);
    expect(payment.changedBy).toBe(1);
    const invoice = await invoiceService.get(1);
    expect(invoice.status).toBe("PAID");
  });
  // it("should reject over payment", async () => {
  //   await paymentService.create({
  //     supplierId: 1,
  //     paymentDate: new Date(),
  //     referenceNo: "CHECK#001",
  //     amount: 500,
  //     changedBy: 1,
  //     applications: [
  //       {
  //         id: 1,
  //         invoiceId: 1,
  //         amountApplied: 300,
  //       },
  //     ],
  //   });
  //   const payment = await paymentService.get(1);

  //   expect(payment).not.toBeNull();
  //   expect(payment.referenceNo).toBe("CHECK#001");
  //   expect(payment.amount).toBe(500);
  //   expect(payment.changedBy).toBe(1);
  //   const invoice = await invoiceService.get(1);
  //   expect(invoice.status).toBe("PAID");
  // });
});
