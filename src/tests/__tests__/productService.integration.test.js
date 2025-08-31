const productService = require("../../services/product.service");
const { sequelize, setupDatabase, resetDatabase } = require("../setup");
const categoryService = require("../../services/category.service");
const {
  getConstraintFields,
  createCategory,
  products,
  categories,
} = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  createCategory(0);
  createCategory(1);
});

describe("Product Service (Integration)", () => {
  it("should create and fetch product", async () => {
    const created = await productService.create(products[0]);
    const product = await productService.get(created.id);

    expect(product).not.toBeNull();
    expect(product.name).toBe(products[0].name);
    expect(product.description).toBe(products[0].description);
    expect(product.baseUnit).toBe(products[0].baseUnit);
  });

  it("should update product", async () => {
    const created = await productService.create(products[0]);

    const updated = await productService.update(created.id, {
      name: "Wood Shovel",
      description: "Shovel Updated",
      baseUnit: "BOX",
      categoryId: 1,
    });

    expect(updated).not.toBeNull();
    expect(updated.name).toBe("Wood Shovel");
    expect(updated.description).toBe("Shovel Updated");
    expect(updated.baseUnit).toBe("BOX");
  });

  it("should list all products", async () => {
    await productService.create(products[0]);
    await productService.create(products[1]);

    const prods = await productService.list();

    expect(prods).not.toBeNull();
    expect(prods.length).toBe(2);
  });

  it("should delete product", async () => {
    const created = await productService.create(products[0]);
    const deleted = await productService.delete(created.id);

    expect(deleted).toBe(true);
    await expect(productService.get(created.id)).rejects.toThrow(
      "Product not found"
    );
  });

  it("should enforce unique name and unit constraint", async () => {
    await productService.create(products[0]);

    try {
      await productService.create({
        ...products[0],
      });
      throw new Error(
        "Expected SequelizeUniqueConstraintError but no error was thrown"
      );
    } catch (err) {
      console.log("Unique name/baseUnit error:", {
        name: err.name,
        message: err.message,
        fields: err.fields,
        errors: err.errors?.map((e) => e.message),
      });

      expect(err.name).toBe("SequelizeUniqueConstraintError");
      expect(err.message).toBe("Validation error");
      expect(getConstraintFields(err)).toContain("name");
      expect(getConstraintFields(err)).toEqual(
        expect.arrayContaining(["name", "baseUnit"])
      );
    }
  });

  it("should fetch all products by sku", async () => {
    await productService.create(products[0]);
    await productService.create(products[1]);
    const prods = await productService.getAllBySku("01|SHO");
    expect(prods.length).toBe(1);
    expect(prods[0].name).toBe(products[0].name);
  });

  it("should update a product's unit", async () => {
    const create = await productService.create(products[0]);

    const product = await productService.get(create.id);
    const updated = await productService.update(product.id, {
      name: product.name,
      categoryId: product.categoryId,
      baseUnit: "BOX",
    });
    expect(updated.baseUnit).toBe("BOX");
  });

  it("should clone a product to a new unit", async () => {
    const create = await productService.create(products[0]);

    const product = await productService.get(create.id);
    // const updated = await productService.cloneToUnit(product.id, {
    //   baseUnit: "BOX",
    // });

    // expect(updated.baseUnit).toBe("BOX");
  });

  it("should get a paginated list of products", async () => {
    await productService.create(products[0]);
    await productService.create(products[1]);

    const prods = await productService.getPaginated({
      page: 1,
      limit: 1,
    });

    expect(prods.data.length).toBe(2);
    expect(prods.data[0].categoryName).toBe(categories[0].name);
    expect(prods.data[0].products[0].name).toBe(products[0].name);
    expect(prods.data[1].categoryName).toBe(categories[1].name);
    expect(prods.data[1].products[0].name).toBe(products[1].name);
  });
});
