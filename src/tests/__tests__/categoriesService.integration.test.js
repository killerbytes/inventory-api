const categoryService = require("../../services/categories.service");
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
    name: "Tools",
    description: "Hardware tools",
  },
  {
    name: "Electronics",
    description: "Electronics",
  },
  {
    name: "Clothing",
    description: "Clothing",
  },
];

describe("Customer Service (Integration)", () => {
  it("should create and fetch a category", async () => {
    const test = data[0];
    const created = await categoryService.create(test);
    const category = await categoryService.get(created.id);

    expect(category).not.toBeNull();
    expect(category.name).toBe(test.name);
    expect(category.description).toBe(test.description);
    expect(category.order).toBeNull();
  });

  it("should list all categories", async () => {
    await categoryService.create(data[0]);
    await categoryService.create(data[1]);

    const categories = await categoryService.list();
    expect(categories.length).toBe(2); // ✅ now deterministic
  });

  it("should update a category", async () => {
    const category = await categoryService.create(data[0]);
    const updated = await categoryService.update(category.id, {
      name: "Tools updated",
      description: "updated description",
    });

    expect(updated.name).toBe("Tools updated");
    expect(updated.description).toBe("updated description");
  });

  it("should delete a category", async () => {
    const category = await categoryService.create(data[0]);
    const result = await categoryService.delete(category.id);

    expect(result).toBe(true);
    await expect(categoryService.get(category.id)).rejects.toThrow(
      "Category not found"
    );
  });

  it("should enforce unique name constraint", async () => {
    await categoryService.create(data[0]);
    try {
      await categoryService.create({ ...data[1], name: data[0].name });
    } catch (err) {
      console.log("Unique name error:", {
        name: err.name,
        message: err.message,
        fields: err.fields,
        errors: err.errors?.map((e) => e.message),
      });
      expect(err.name).toBe("SequelizeUniqueConstraintError");
      expect(err.message).toBe("Validation error");
      expect(getConstraintFields(err)).toContain("name");
    }
  });

  if (
    ("should update a category's sort order",
    async () => {
      await categoryService.create(data[0]);
      await categoryService.create(data[1]);
      const categories = await categoryService.list();
      expect(categories.data.length).toBe(2);
      expect(categories.data[0].name).toBe("Clothing");
      expect(categories.data[1].name).toBe("Electronics");
      await categoryService.updateSort({
        id: categories.data[0].id,
        order: 1,
      });
      const categories2 = await categoryService.list();
      expect(categories2.data.length).toBe(2);
      expect(categories2.data[0].name).toBe("Electronics");
      expect(categories2.data[1].name).toBe("Clothing");
    })
  );
});
