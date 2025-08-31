const supplierService = require("../../services/supplier.service");
const { sequelize, setupDatabase, resetDatabase } = require("../setup");
const { getConstraintFields, createSupplier, suppliers } = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createSupplier(0);
  await createSupplier(1);
});

describe("Customer Service (Integration)", () => {
  it("should create and fetch a supplier", async () => {
    const created = await supplierService.create({
      name: "Test Supplier",
      email: "email@test.com",
      phone: "1234567890",
      address: "123 Main St",
    });
    const supplier = await supplierService.get(created.id);

    expect(supplier).not.toBeNull();
    expect(supplier.name).toBe("Test Supplier");
    expect(supplier.email).toBe("email@test.com");
    expect(supplier.phone).toBe("1234567890");
    expect(supplier.address).toBe("123 Main St");
  });

  it("should list all suppliers", async () => {
    const suppliers = await supplierService.list();
    expect(suppliers.length).toBe(2); // ✅ now deterministic
  });

  it("should update a supplier email", async () => {
    const supplier = await supplierService.create({
      name: "Test Supplier",
      email: "email@test.com",
      phone: "1234567890",
      address: "123 Main St",
    });
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
    const supplier = await supplierService.create({
      name: "Test Supplier",
      email: "email@test.com",
      phone: "1234567890",
      address: "123 Main St",
    });
    const result = await supplierService.delete(supplier.id);

    expect(result).toBe(true);
    await expect(supplierService.get(supplier.id)).rejects.toThrow(
      "Supplier not found"
    );
  });

  it("should enforce unique email constraint", async () => {
    try {
      await supplierService.create({
        ...suppliers[1],
        email: suppliers[0].email,
      });
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
    const suppliers = await supplierService.getPaginated({
      q: "cha",
      page: 1,
      limit: 1,
    });

    expect(suppliers.data.length).toBe(1);
    expect(suppliers.data[0].name).toBe("Charlie");
  });
});
