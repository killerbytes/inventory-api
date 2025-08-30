const userService = require("../../services/user.service");
const { setupDatabase, resetDatabase } = require("../setup");
const request = require("supertest");

const app = require("../../app");
const purchaseOrdersService = require("../../services/purchaseOrders.service");
const categoryService = require("../../services/category.service");
const productService = require("../../services/product.service");
const productCombinationService = require("../../services/productCombination.service");
const variantTypeService = require("../../services/variantType.service");

const categories = [
  {
    name: "Tools",
    description: "Hardware tools",
  },
  {
    name: "Electronics",
    description: "Electronics",
  },
];
const products = [
  {
    name: "Shovel",
    description: "Shovel BOX",
    baseUnit: "BOX",
    categoryId: 1,
  },
  {
    name: "Wire",
    description: "Wire",
    baseUnit: "PCS",
    categoryId: 2,
  },
  {
    name: "Shovel",
    description: "Shovel PCS",
    baseUnit: "PCS",
    categoryId: 1,
  },
];

const variantTypes = [
  {
    name: "Colors",
    productId: 1,
    values: [{ value: "Red" }, { value: "Blue" }],
  },
  {
    name: "Size",
    productId: 1,
    values: [{ value: "Small" }, { value: "Medium" }],
  },
];

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await userService.create({
    name: "Test User",
    username: "testuser",
    email: "test@test.com",
    password: "test",
    confirmPassword: "test",
  });
  await userService.update(1, { isActive: true });
  await categoryService.create(categories[0]);
  await categoryService.create(categories[1]);
  await productService.create(products[0]);
  await productService.create(products[1]);
  await variantTypeService.create(variantTypes[0]);
  await productCombinationService.updateByProductId(1, {
    combinations: [
      {
        price: 100,
        unit: "BOX",
        reorderLevel: 1,
        conversionFactor: 1,
        values: [
          {
            value: "Red",
            variantTypeId: 1,
          },
        ],
      },
      {
        price: 100,
        unit: "PCS",
        reorderLevel: 1,
        conversionFactor: 1,
        values: [
          {
            value: "Red",
            variantTypeId: 1,
          },
        ],
      },
    ],
  });
  const res = await request(app)
    .post("/api/auth/login")
    .set("Accept", "application/json") // tell server to expect json
    .set("Content-Type", "application/json")
    .send({ username: "testuser", password: "test" });

  const token = res.body.token;

  await request(app).get("/api/auth/me").set("x-access-token", token);
});

describe("Product Combination Service (Integration)", () => {
  it("should create a purchase order", async () => {
    const prod = await productService.get(1);
    console.log(prod.combinations);
    await purchaseOrdersService.create({
      supplierId: 1,
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      purchaseOrderItems: [
        {
          combinationId: 1,
          quantity: 1,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 1,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "CASH",
    });
  });
});
