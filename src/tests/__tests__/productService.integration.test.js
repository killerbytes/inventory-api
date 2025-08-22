const productService = require("../../services/products.service");
const { sequelize, setupDatabase } = require("../setup");
const { getConstraintFields } = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

// ✅ reset DB before each test so data doesn’t leak
beforeEach(async () => {
  await sequelize.sync({ force: true });
});

const data = [
  {
    name: "Shovel",
    description: "Shovel",
    unit: "PCS",
    categoryId: 1,
  },
  {
    name: "Wire",
    description: "Wire",
    unit: "BOX",
    categoryId: 2,
  },
];

describe("Customer Service (Integration)", () => {
  it("should create and fetch product", async () => {
    const test = data[0];
    const created = await productService.create(test);
    const product = await productService.get(created.id);

    expect(product).not.toBeNull();
    expect(product.name).toBe(test.name);
    expect(product.description).toBe(test.description);
  });
});
