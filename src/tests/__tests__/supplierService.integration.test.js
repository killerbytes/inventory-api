const supplierService = require("../../services/supplier.service");
const { sequelize, setupDatabase, resetDatabase } = require("../setup");
const { getConstraintFields } = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
});

const data = [
  {
    name: "Alice",
    email: "alice@test.com",
    phone: "1234567890",
    address: "123 Main St",
    notes: "This is a note",
    isActive: true,
  },
  {
    name: "Charlie",
    email: "charlie@test.com",
    phone: "546545434",
    address: "432 Main St",
    notes: "This is a note",
    isActive: true,
  },
];

describe("Customer Service (Integration)", () => {
  it("should create and fetch a supplier", async () => {
    const test = data[0];
    const created = await supplierService.create(test);
    const supplier = await supplierService.get(created.id);

    expect(supplier).not.toBeNull();
    expect(supplier.name).toBe(test.name);
    expect(supplier.email).toBe(test.email);
    expect(supplier.phone).toBe(test.phone);
  });

  it("should list all suppliers", async () => {
    await supplierService.create(data[0]);
    await supplierService.create(data[1]);

    const suppliers = await supplierService.list();
    expect(suppliers.length).toBe(2); // ✅ now deterministic
  });

  it("should update a supplier email", async () => {
    const supplier = await supplierService.create(data[0]);
    const updated = await supplierService.update(supplier.id, {
      email: "newalice@test.com",
      name: "Alice Updated",
      address: "123 Main St updated",
      phone: "34343",
    });

    expect(updated.name).toBe("Alice Updated");
    expect(updated.email).toBe("newalice@test.com");
    expect(updated.address).toBe("123 Main St updated");
    expect(updated.phone).toBe("34343");
  });

  it("should delete a supplier", async () => {
    const supplier = await supplierService.create(data[0]);
    const result = await supplierService.delete(supplier.id);

    expect(result).toBe(true);
    await expect(supplierService.get(supplier.id)).rejects.toThrow(
      "Supplier not found"
    );
  });

  it("should enforce unique email constraint", async () => {
    await supplierService.create(data[0]);

    try {
      await supplierService.create({ ...data[1], email: data[0].email });
      throw new Error(
        "Expected SequelizeUniqueConstraintError but no error was thrown"
      );
    } catch (err) {
      console.log("Unique email error:", {
        name: err.name,
        message: err.message,
        fields: err.fields,
        errors: err.errors?.map((e) => e.message),
      });

      expect(err.name).toBe("SequelizeUniqueConstraintError");
      expect(err.message).toBe("Validation error");
      expect(getConstraintFields(err)).toContain("email");
    }
  });

  it("should get a paginated list of suppliers", async () => {
    await supplierService.create(data[0]);
    await supplierService.create(data[1]);

    const suppliers = await supplierService.getPaginated({
      page: 1,
      limit: 1,
    });
    expect(suppliers.data.length).toBe(1);
    expect(suppliers.total).toBe(2);
    expect(suppliers.totalPages).toBe(2);
    expect(suppliers.currentPage).toBe(1);
  });

  it("should update a supplier's sort order", async () => {
    await supplierService.create(data[0]);
    await supplierService.create(data[1]);

    const suppliers = await supplierService.getPaginated({
      page: 1,
      limit: 1,
      sort: "name",
      order: "DESC",
    });
    expect(suppliers.data.length).toBe(1);
    expect(suppliers.data[0].name).toBe("Charlie");
  });

  it("should query suppliers by name", async () => {
    await supplierService.create(data[0]);
    await supplierService.create(data[1]);
    const suppliers = await supplierService.getPaginated({
      q: "cha",
      page: 1,
      limit: 1,
    });

    expect(suppliers.data.length).toBe(1);
    expect(suppliers.data[0].name).toBe("Charlie");
  });
});
