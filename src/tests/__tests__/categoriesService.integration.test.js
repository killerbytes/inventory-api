const categoryService = require("../../services/category.service");
const { sequelize, setupDatabase, resetDatabase } = require("../setup");
const { getConstraintFields, createCategory, categories } = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createCategory(0);
  await createCategory(1);
});

describe("Customer Service (Integration)", () => {
  it("should create and fetch a category", async () => {
    const cat = await categoryService.create({
      name: "Primary",
    });
    const category = await categoryService.get(cat.id);

    expect(category).not.toBeNull();
    expect(category.name).toBe("Primary");
    expect(category.description).toBeNull();
    expect(category.order).toBeNull();
  });

  it("should list all categories", async () => {
    const categories = await categoryService.list();
    expect(categories.length).toBe(2); // ✅ now deterministic
  });

  it("should update a category", async () => {
    const category = await categoryService.create({
      name: "Primary",
    });
    const updated = await categoryService.update(category.id, {
      name: "Tools updated",
      description: "updated description",
    });

    expect(updated.name).toBe("Tools updated");
    expect(updated.description).toBe("updated description");
  });

  it("should delete a category", async () => {
    const category = await categoryService.create({
      name: "Primary",
    });
    const result = await categoryService.delete(category.id);

    expect(result).toBe(true);
    await expect(categoryService.get(category.id)).rejects.toThrow(
      "Category not found"
    );
  });

  it("should enforce unique name constraint", async () => {
    try {
      await categoryService.create({
        ...categories[1],
        name: categories[0].name,
      });
      throw new Error(
        "Expected SequelizeUniqueConstraintError but no error was thrown"
      );
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

  it("should update a category's sort order", async () => {
    const categories = await categoryService.list();

    expect(categories.length).toBe(2);
    expect(categories[0].name).toBe("Tools");
    expect(categories[1].name).toBe("Electronics");
    await categoryService.updateSort([categories[1].id, categories[0].id]);

    const categories2 = await categoryService.list();
    expect(categories2.length).toBe(2);
    expect(categories2[0].name).toBe("Electronics");
    expect(categories2[1].name).toBe("Tools");
  });

  it("should enforce unique name constraint on update", async () => {
    try {
      await categoryService.update(1, { name: categories[1].name });
      throw new Error(
        "Expected SequelizeUniqueConstraintError but no error was thrown"
      );
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
  it("should create and fetch a category with parent", async () => {
    const created = await categoryService.create({
      name: "Primary",
    });
    await categoryService.create({
      name: "Sub",
      description: "Sub",
      parentId: created.id,
    });
    const category = await categoryService.get(created.id);
    // const category = await categoryService.list();

    expect(category).not.toBeNull();
    expect(category.name).toBe("Primary");
    expect(category.description).toBeNull();
    expect(category.order).toBeNull();
    expect(category.subCategories.length).toBe(1);
    expect(category.subCategories[0].name).toBe("Sub");
  });
});
