const db = require("../../models");
const { Product } = db;

const { sequelize, setupDatabase, resetDatabase } = require("../setup");
const categoryService = require("../../services/categories.service");
const productService = require("../../services/products.service");
const productCombinationService = require("../../services/productCombination.service");
const variantTypeService = require("../../services/variantTypes.service");
const userService = require("../../services/users.service");
const request = require("supertest");
const app = require("../../app");

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
  const res = await request(app)
    .post("/api/auth/login")
    .set("Accept", "application/json") // tell server to expect json
    .set("Content-Type", "application/json")
    .send({ username: "testuser", password: "test" });

  const token = res.body.token;

  await request(app).get("/api/auth/me").set("x-access-token", token);
});

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
    unit: "BOX",
    categoryId: 1,
  },
  {
    name: "Wire",
    description: "Wire",
    unit: "PCS",
    categoryId: 2,
  },
  {
    name: "Shovel",
    description: "Shovel PCS",
    unit: "PCS",
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

describe("Product Combination Service (Integration)", () => {
  it("should create and fetch a product combination", async () => {
    await productCombinationService.updateByProductId(1, {
      combinations: [
        {
          price: 100,
          reorderLevel: 1,
          values: [
            {
              value: "Red",
              variantTypeId: 1,
            },
          ],
        },
      ],
    });

    const product = await productCombinationService.getByProductId(1);

    expect(product.combinations[0]).not.toBeNull();
    expect(product.combinations[0].name).toBe("Shovel - Red");
    expect(product.combinations[0].sku).toBe("01|SHO|BOX|RED");
    expect(product.combinations[0].price).toBe(100);
    expect(product.combinations[0].reorderLevel).toBe(1);
    expect(product.combinations[0].inventory.quantity).toBe(0);
    expect(product.variants).not.toBeNull();
    expect(product.variants[0].name).toBe("Colors");
    expect(product.variants[0].values[0].value).toBe("Blue");
    expect(product.variants[0].values[1].value).toBe("Red");
    expect(product.variants[0].values.length).toBe(2);
    expect(product.variants[0].values[0].variantTypeId).toBe(1);
    expect(product.variants[0].values[1].variantTypeId).toBe(1);
    expect(product.variants[0].productId).toBe(1);
    expect(product.variants[0].productId).toBe(1);
    expect(product.variants[0].values[0].id).toBe(2);
    expect(product.variants[0].values[1].id).toBe(1);

    await variantTypeService.create(variantTypes[1]);
    await productCombinationService.updateByProductId(1, {
      combinations: [
        {
          id: 1,
          price: 100,
          reorderLevel: 1,
          values: [
            {
              value: "Red",
              variantTypeId: 1,
            },
            {
              value: "Medium",
              variantTypeId: 2,
            },
          ],
        },
      ],
    });

    const product2 = await productCombinationService.getByProductId(1);
    expect(product2.combinations[0]).not.toBeNull();
    expect(product2.combinations[0].name).toBe("Shovel - Red | Medium");
    expect(product2.combinations[0].sku).toBe("01|SHO|BOX|RED|MED");
    expect(product2.combinations[0].price).toBe(100);
    expect(product2.combinations[0].reorderLevel).toBe(1);
    expect(product2.combinations[0].inventory.quantity).toBe(0);
    expect(product2.variants[0]).not.toBeNull();
    expect(product2.variants[0].name).toBe("Colors");
    expect(product2.variants[0].values[0].value).toBe("Blue");
    expect(product2.variants[0].values[1].value).toBe("Red");
    expect(product2.variants[0].values.length).toBe(2);
    expect(product2.variants[0].values[0].variantTypeId).toBe(1);
    expect(product2.variants[0].values[1].variantTypeId).toBe(1);
    expect(product2.variants[0].productId).toBe(1);
    expect(product2.variants[0].values[0].id).toBe(2);
    expect(product2.variants[0].values[1].id).toBe(1);
    expect(product2.variants[1]).not.toBeNull();
    expect(product2.variants[1].name).toBe("Size");
    expect(product2.variants[1].values[0].value).toBe("Medium");
    expect(product2.variants[1].values[1].value).toBe("Small");
    expect(product2.variants[1].values.length).toBe(2);
    expect(product2.variants[1].values[0].variantTypeId).toBe(2);
    expect(product2.variants[1].values[1].variantTypeId).toBe(2);
    expect(product2.variants[1].productId).toBe(1);
    expect(product2.variants[1].values[0].id).toBe(4);
    expect(product2.variants[1].values[1].id).toBe(3);
  });

  it("should make an stock adjustment", async () => {
    await productCombinationService.updateByProductId(1, {
      combinations: [
        {
          price: 100,
          reorderLevel: 1,
          values: [
            {
              value: "Red",
              variantTypeId: 1,
            },
          ],
        },
      ],
    });

    await productCombinationService.stockAdjustment({
      combinationId: 1,
      newQuantity: 10,
      reason: "EXPIRED",
      notes: "test",
    });
    const product = await productService.get(1);
    expect(product.combinations[0].inventory.quantity).toBe(10);

    const product2 = await productService.create(products[2]);

    await productCombinationService.breakPack({
      fromCombinationId: 1,
      quantity: 1,
      toCombinationId: 3,
      conversionFactor: 24,
    });

    // const p = await Product.findByPk(3);
    // console.log(p);

    // expect(p.inventory.quantity).toBe(1);
  });

  // it("should break a product combination to another unit", async () => {
  //   // const { fromCombinationId, quantity, toCombinationId } = payload;
  //   // await productCombinationService.updateByProductId(2, {
  //   //   combinations: [
  //   //     {
  //   //       price: 100,
  //   //       reorderLevel: 1,
  //   //       values: [
  //   //         {
  //   //           value: "Red",
  //   //           variantTypeId: 1,
  //   //         },
  //   //       ],
  //   //     },
  //   //   ],
  //   // });
  //   // await productCombinationService.breakPack({
  //   //   fromCombinationId: 1,
  //   //   quantity: 1,
  //   //   toCombinationId: 2,
  //   //   conversionFactor: 24,
  //   // });
  //   // const product = await productService.get(2);
  //   // console.log(product);
  // });
});
