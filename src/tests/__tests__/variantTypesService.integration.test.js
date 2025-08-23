const { sequelize, setupDatabase, resetDatabase } = require("../setup");
const variantTypeService = require("../../services/variantTypes.service");
const categoryService = require("../../services/categories.service");
const productService = require("../../services/products.service");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
});

const category = [
  {
    name: "Tools",
    description: "Hardware tools",
  },
  {
    name: "Electronics",
    description: "Electronics",
  },
];
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

describe("Variant Type Service (Integration)", () => {
  it("should create and fetch a variant type", async () => {
    await categoryService.create(category[0]);
    await productService.create(data[0]);
    const create = await variantTypeService.create({
      name: "Test Variant Type",
      productId: 1,
      values: [{ value: "TEST1" }, { value: "TEST2" }],
    });

    const variantType = await variantTypeService.getByProductId(
      create.productId
    );

    expect(variantType[0]).not.toBeNull();
    expect(variantType[0].name).toBe("Test Variant Type");
    expect(variantType[0].values.length).toBe(2);
  });
  it("should list all variant types", async () => {
    await categoryService.create(category[0]);
    await categoryService.create(category[1]);
    await productService.create(data[0]);
    await productService.create(data[1]);

    await variantTypeService.create({
      name: "Test Variant Type",
      productId: 1,
      isTemplate: true,
      values: [{ value: "TEST1" }, { value: "TEST2" }],
    });
    await variantTypeService.create({
      name: "Test Variant Type 2",
      productId: 2,
      isTemplate: true,
      values: [{ value: "TEST1" }, { value: "TEST2" }],
    });

    const variantTypes = await variantTypeService.getAll();
    expect(variantTypes.length).toBe(2);
  });
  it("should update a variant type", async () => {
    await categoryService.create(category[0]);
    await productService.create(data[0]);

    const create = await variantTypeService.create({
      name: "Test Variant Type",
      productId: 1,
      values: [{ value: "TEST1" }, { value: "TEST2" }],
    });

    const updated = await variantTypeService.update(create.id, {
      name: "Updated Test Variant Type",
      values: [{ value: "TEST1" }, { value: "TEST2" }, { value: "TEST3" }],
    });

    expect(updated.name).toBe("Updated Test Variant Type");
    expect(updated.values.length).toBe(3);
  });

  it("should delete a variant type", async () => {
    await categoryService.create(category[0]);
    await productService.create(data[0]);
    const create = await variantTypeService.create({
      name: "Test Variant Type",
      productId: 1,
      values: [{ value: "TEST1" }, { value: "TEST2" }],
    });

    const deleted = await variantTypeService.delete(create.id);
    expect(deleted).toBe(true);
    const x = await variantTypeService.getByProductId(create.productId);
    expect(x.length).toBe(0);
  });
});
