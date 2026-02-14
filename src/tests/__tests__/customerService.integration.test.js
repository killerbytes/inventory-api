const customerService = require("../../services/customer.service");
const { sequelize, setupDatabase, resetDatabase } = require("../setup");
const { getConstraintFields, createCustomer, customers } = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createCustomer(0);
  await createCustomer(1);
});

describe("Customer Service (Integration)", () => {
  it("should create and fetch a customer", async () => {
    const created = await customerService.create({
      name: "Test Customer",
      address: "123 Main St",
      phone: "1234567890",
      email: "email@test.com",
    });
    const customer = await customerService.get(created.id);

    expect(customer).not.toBeNull();
    expect(customer.name).toBe("Test Customer");
    expect(customer.email).toBe("email@test.com");
    expect(customer.phone).toBe("1234567890");
  });

  it("should list all customers", async () => {
    const customers = await customerService.list();
    expect(customers.length).toBe(2); // ✅ now deterministic
  });

  it("should update a customer email", async () => {
    const customer = await customerService.create({
      name: "Test Customer",
      address: "123 Main St",
      phone: "1234567890",
    });
    const updated = await customerService.update(customer.id, {
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

  it("should delete a customer", async () => {
    const customer = await customerService.create({
      name: "Test Customer",
      address: "123 Main St",
      phone: "1234567890",
    });
    const result = await customerService.delete(customer.id);

    expect(result).toBe(true);
    await expect(customerService.get(customer.id)).rejects.toThrow(
      "Customer not found"
    );
  });

  it("should enforce unique email constraint", async () => {
    try {
      await customerService.create({
        ...customers[1],
        email: customers[0].email,
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

  it("should get a paginated list of customers", async () => {
    const customers = await customerService.getPaginated({
      page: 1,
      limit: 1,
    });
    expect(customers.data.length).toBe(1);
    expect(customers.meta.total).toBe(2);
    expect(customers.meta.totalPages).toBe(2);
    expect(customers.meta.currentPage).toBe(1);
  });

  it("should update a customer's sort order", async () => {
    const customers = await customerService.getPaginated({
      page: 1,
      limit: 1,
      sort: "name",
      order: "DESC",
    });
    expect(customers.data.length).toBe(1);
    expect(customers.data[0].name).toBe("Charlie");
  });

  it("should query customers by name", async () => {
    const customers = await customerService.getPaginated({
      q: "cha",
      page: 1,
      limit: 1,
    });

    expect(customers.data.length).toBe(1);
    expect(customers.data[0].name).toBe("Charlie");
  });
});
