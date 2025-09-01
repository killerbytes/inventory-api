const { setupDatabase, resetDatabase } = require("../setup");
const variantTypeService = require("../../services/variantType.service");
const { createCategory, createProduct } = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createCategory(0);
  await createCategory(1);
  await createProduct(0);
  await createProduct(1);
});

describe("Variant Type Service (Integration)", () => {
  it("should create and fetch a variant type", async () => {
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
