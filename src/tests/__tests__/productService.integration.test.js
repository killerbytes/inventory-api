const productService = require("../../services/products.service");
const { sequelize, setupDatabase, resetDatabase } = require("../setup");
const categoryService = require("../../services/categories.service");
const { getConstraintFields } = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

// ✅ reset DB before each test so data doesn’t leak
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

describe("Customer Service (Integration)", () => {
  it("should create and fetch product", async () => {
    const test = data[0];
    await categoryService.create(category[0]);
    const created = await productService.create(test);
    const product = await productService.get(created.id);

    expect(product).not.toBeNull();
    expect(product.name).toBe(test.name);
    expect(product.description).toBe(test.description);
    expect(product.unit).toBe(test.unit);
  });

  it("should update product", async () => {
    await categoryService.create(category[0]);
    const created = await productService.create(data[0]);
    const updated = await productService.update(created.id, {
      name: "Wood Shovel",
      description: "Shovel Updated",
      unit: "BOX",
      categoryId: 1,
    });

    expect(updated).not.toBeNull();
    expect(updated.name).toBe("Wood Shovel");
    expect(updated.description).toBe("Shovel Updated");
    expect(updated.unit).toBe("BOX");
  });

  it("should list all products", async () => {
    await categoryService.create(category[0]);
    await categoryService.create(category[1]);
    await productService.create(data[0]);
    await productService.create(data[1]);

    const products = await productService.list();

    expect(products).not.toBeNull();
    expect(products.length).toBe(2);
  });

  it("should delete product", async () => {
    await categoryService.create(category[0]);
    const created = await productService.create(data[0]);
    const deleted = await productService.delete(created.id);

    expect(deleted).toBe(true);
    await expect(productService.get(created.id)).rejects.toThrow(
      "Product not found"
    );
  });

  it("should enforce unique name and unit constraint", async () => {
    await categoryService.create(category[0]);
    await categoryService.create(category[1]);
    await productService.create(data[0]);

    try {
      await productService.create({
        ...data[1],
        name: data[0].name,
        unit: data[0].unit,
      });
      throw new Error(
        "Expected SequelizeUniqueConstraintError but no error was thrown"
      );
    } catch (err) {
      console.log("Unique sku error:", {
        name: err.name,
        message: err.message,
        fields: err.fields,
        errors: err.errors?.map((e) => e.message),
      });

      expect(err.name).toBe("SequelizeUniqueConstraintError");
      expect(err.message).toBe("Validation error");
      expect(getConstraintFields(err)).toContain("name");
      expect(getConstraintFields(err)).toContain("unit");
    }
  });

  it("should fetch all products by sku", async () => {
    await categoryService.create(category[0]);
    await categoryService.create(category[1]);
    await productService.create(data[0]);
    await productService.create(data[1]);
    const products = await productService.getAllBySku("01|SHO");
    expect(products.length).toBe(1);
    expect(products[0].name).toBe(data[0].name);
  });

  it("should update a product's unit", async () => {
    await categoryService.create(category[0]);
    await categoryService.create(category[1]);
    const create = await productService.create(data[0]);

    const product = await productService.get(create.id);
    const updated = await productService.update(product.id, {
      name: product.name,
      categoryId: product.categoryId,
      unit: "BOX",
    });
    expect(updated.unit).toBe("BOX");
  });

  it("should clone a product to a new unit", async () => {
    await categoryService.create(category[0]);
    await categoryService.create(category[1]);
    const create = await productService.create(data[0]);

    const product = await productService.get(create.id);
    const updated = await productService.cloneToUnit(product.id, {
      unit: "BOX",
    });

    expect(updated.unit).toBe("BOX");
  });

  it("should get a paginated list of products", async () => {
    await categoryService.create(category[0]);
    await categoryService.create(category[1]);
    await productService.create(data[0]);
    await productService.create(data[1]);

    const products = await productService.getPaginated({
      page: 1,
      limit: 1,
    });

    expect(products.data.length).toBe(2);
    expect(products.data[0].categoryName).toBe(category[0].name);
    expect(products.data[0].products[0].name).toBe(data[0].name);
    expect(products.data[1].categoryName).toBe(category[1].name);
    expect(products.data[1].products[0].name).toBe(data[1].name);
  });
});
