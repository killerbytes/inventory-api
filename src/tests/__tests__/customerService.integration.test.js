const customerService = require("../../services/customer.service");
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
  it("should create and fetch a customer", async () => {
    const test = data[0];
    const created = await customerService.create(test);
    const customer = await customerService.get(created.id);

    expect(customer).not.toBeNull();
    expect(customer.name).toBe(test.name);
    expect(customer.email).toBe(test.email);
    expect(customer.phone).toBe(test.phone);
  });

  it("should list all customers", async () => {
    await customerService.create(data[0]);
    await customerService.create(data[1]);

    const customers = await customerService.list();
    expect(customers.length).toBe(2); // ✅ now deterministic
  });

  it("should update a customer email", async () => {
    const customer = await customerService.create(data[0]);
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
    const customer = await customerService.create(data[0]);
    const result = await customerService.delete(customer.id);

    expect(result).toBe(true);
    await expect(customerService.get(customer.id)).rejects.toThrow(
      "Customer not found"
    );
  });

  it("should enforce unique email constraint", async () => {
    await customerService.create(data[0]);

    try {
      await customerService.create({ ...data[1], email: data[0].email });
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
    await customerService.create(data[0]);
    await customerService.create(data[1]);

    const customers = await customerService.getPaginated({
      page: 1,
      limit: 1,
    });
    expect(customers.data.length).toBe(1);
    expect(customers.total).toBe(2);
    expect(customers.totalPages).toBe(2);
    expect(customers.currentPage).toBe(1);
  });

  it("should update a customer's sort order", async () => {
    await customerService.create(data[0]);
    await customerService.create(data[1]);

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
    await customerService.create(data[0]);
    await customerService.create(data[1]);
    const customers = await customerService.getPaginated({
      q: "cha",
      page: 1,
      limit: 1,
    });

    expect(customers.data.length).toBe(1);
    expect(customers.data[0].name).toBe("Charlie");
  });
});
