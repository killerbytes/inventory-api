const { setupDatabase, resetDatabase, sequelize } = require("../setup");
const reportsService = require("../../services/reports.service");
const productCombinationService = require("../../services/productCombination.service");
const goodReceiptService = require("../../services/goodReceipt.service");
const salesOrderService = require("../../services/salesOrder.service");
const {
  createUser,
  createCategory,
  createProduct,
  createSupplier,
  createCombination,
  createCustomer,
  loginUser,
} = require("../utils");
const { VariantValue } = sequelize.models;

let user0, product0, supplier0, customer0;
let variantType0;
let classicShovel, basicShovel, unsoldShovel, emptyShovel;

beforeAll(async () => {
  await setupDatabase();
});

beforeEach(async () => {
  await resetDatabase();
  user0 = await createUser(0);
  await createCategory(0);
  product0 = await createProduct(0);
  variantType0 = await require("../../services/variantType.service").create({
    name: "Colors",
    productId: product0.id,
    values: [
      { value: "Red" },
      { value: "Blue" },
      { value: "Green" },
      { value: "Black" },
    ],
  });

  supplier0 = await createSupplier(0);
  customer0 = await createCustomer(0);

  await loginUser(0);

  await createCombination(
    [
      {
        price: 200,
        unit: "PCS",
        conversionFactor: 1,
        reorderLevel: 10,
        values: [{ value: "Red", variantTypeId: variantType0.id }],
      },
      {
        price: 100,
        unit: "PCS",
        conversionFactor: 1,
        reorderLevel: 5,
        values: [{ value: "Blue", variantTypeId: variantType0.id }],
      },
      {
        price: 300,
        unit: "PCS",
        conversionFactor: 1,
        reorderLevel: 1,
        values: [{ value: "Green", variantTypeId: variantType0.id }],
      },
      {
        price: 50,
        unit: "PCS",
        conversionFactor: 1,
        reorderLevel: 1,
        values: [{ value: "Black", variantTypeId: variantType0.id }],
      },
    ],
    product0.id
  );

  const combinations = await productCombinationService.getByProductId(
    product0.id
  );

  classicShovel = combinations.combinations.find(
    (c) => c.name === "Shovel - Red"
  );
  basicShovel = combinations.combinations.find(
    (c) => c.name === "Shovel - Blue"
  );
  unsoldShovel = combinations.combinations.find(
    (c) => c.name === "Shovel - Green"
  );
  emptyShovel = combinations.combinations.find(
    (c) => c.name === "Shovel - Black"
  );

  await goodReceiptService.create({
    supplierId: supplier0.id,
    receiptDate: new Date(),
    referenceNo: "GR-001",
    goodReceiptLines: [
      { combinationId: classicShovel.id, quantity: 100, purchasePrice: 100 },
      { combinationId: basicShovel.id, quantity: 100, purchasePrice: 50 },
      { combinationId: unsoldShovel.id, quantity: 100, purchasePrice: 150 },
    ],
  });

  await goodReceiptService.update(1, {
    status: "RECEIVED",
    supplierId: supplier0.id,
    receiptDate: new Date(),
    goodReceiptLines: [
      { combinationId: classicShovel.id, quantity: 100, purchasePrice: 100 },
      { combinationId: basicShovel.id, quantity: 100, purchasePrice: 50 },
      { combinationId: unsoldShovel.id, quantity: 100, purchasePrice: 150 },
    ],
  });

  await salesOrderService.create({
    customerId: customer0.id,
    status: "RECEIVED",
    orderDate: new Date(),
    modeOfPayment: "CASH",
    salesOrderItems: [
      {
        combinationId: classicShovel.id,
        quantity: 50,
        originalPrice: 200,
        purchasePrice: 200,
      },
      {
        combinationId: basicShovel.id,
        quantity: 10,
        originalPrice: 100,
        purchasePrice: 100,
      },
    ],
  });
});

describe("Reports Service (Integration)", () => {
  it("should get popular products sorted by transaction count", async () => {
    const result = await reportsService.getPopularProducts({
      limit: 10,
      sort: "transactionCount",
      order: "DESC",
    });

    // Add 2nd order for Classic
    await salesOrderService.create({
      customerId: customer0.id,
      status: "RECEIVED",
      orderDate: new Date(),
      modeOfPayment: "CASH",
      salesOrderItems: [
        {
          combinationId: classicShovel.id,
          quantity: 5,
          originalPrice: 200,
          purchasePrice: 200,
        },
      ],
    });

    const result2 = await reportsService.getPopularProducts({
      limit: 10,
      sort: "transactionCount",
      order: "DESC",
    });

    expect(result2.data.length).toBe(2);

    const classic = result2.data.find(
      (r) => r.combinationId === classicShovel.id
    );
    const basic = result2.data.find((r) => r.combinationId === basicShovel.id);

    expect(classic).toBeDefined();
    // Classic has 2 orders
    expect(Number(classic.getDataValue("transactionCount"))).toBe(2);

    expect(basic).toBeDefined();
    // Basic has 1 order
    expect(Number(basic.getDataValue("transactionCount"))).toBe(1);

    // Verify order
    expect(result2.data[0].combinationId).toBe(classicShovel.id);
  });

  it("should get profit products with correct calculation", async () => {
    const result = await reportsService.getProfitProducts({
      limit: 10,
      sort: "totalProfit",
      order: "DESC",
    });

    // Classic: (200 - 100) * 50 = 5000
    // Basic: (100 - 50) * 10 = 500

    expect(result.data.length).toBe(2);

    const classic = result.data.find(
      (r) => r.combinationId === classicShovel.id
    );
    const basic = result.data.find((r) => r.combinationId === basicShovel.id);

    expect(classic).toBeDefined();
    expect(Number(classic.getDataValue("totalProfit"))).toBe(5000);

    expect(basic).toBeDefined();
    expect(Number(basic.getDataValue("totalProfit"))).toBe(500);

    // Ordered by Profit DESC
    expect(result.data[0].combinationId).toBe(classicShovel.id);
  });

  it("should get no sale products (unsold inventory)", async () => {
    const result = await reportsService.noSaleProducts({
      limit: 10,
    });

    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe(unsoldShovel.id);
    expect(result.data[0].name).toBe("Shovel - Green");
  });
});
