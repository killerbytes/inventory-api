const userService = require("../../services/users.service");
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
    username: "alice",
    password: "123456",
    confirmPassword: "123456",
  },
  {
    name: "Charlie",
    email: "charlie@test.com",
    username: "charlie",
    password: "123456",
    confirmPassword: "123456",
  },
];

describe("User Service (Integration)", () => {
  it("should create and fetch a user", async () => {
    const test = data[0];
    const created = await userService.create(test);
    const user = await userService.get(created.id);

    expect(user).not.toBeNull();
    expect(user.name).toBe(test.name);
    expect(user.email).toBe(test.email);
    expect(user.username).toBe(test.username);
  });

  it("should list all users", async () => {
    await userService.create(data[0]);
    await userService.create(data[1]);

    const users = await userService.list();
    expect(users.length).toBe(2); // ✅ now deterministic
  });

  it("should update a user email", async () => {
    const user = await userService.create(data[0]);
    const updated = await userService.update(user.id, {
      email: "newalice@test.com",
      name: "Alice Updated",
      username: "alice_updated",
    });

    expect(updated.name).toBe("Alice Updated");
    expect(updated.email).toBe("newalice@test.com");
    expect(updated.username).toBe("alice_updated");
  });

  it("should delete a user", async () => {
    const user = await userService.create(data[0]);
    const result = await userService.delete(user.id);

    expect(result).toBe(true);

    await expect(userService.get(user.id)).rejects.toThrow("User not found");
  });

  it("should enforce unique username constraint", async () => {
    await userService.create(data[0]);

    try {
      await userService.create({ ...data[0], email: "test@email.com" });
    } catch (err) {
      console.log("Unique username error:", {
        name: err.name,
        message: err.message,
        fields: err.fields,
        errors: err.errors?.map((e) => e.message),
      });

      expect(err.name).toBe("SequelizeUniqueConstraintError");
      expect(err.message).toBe("Validation error");
      expect(getConstraintFields(err)).toContain("username");
    }
  });

  it("should enforce unique email constraint", async () => {
    await userService.create(data[0]);

    try {
      await userService.create({ ...data[1], email: data[0].email });
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

  it("should get a paginated list of users", async () => {
    await userService.create(data[0]);
    await userService.create(data[1]);

    const users = await userService.getPaginated({
      page: 1,
      limit: 1,
    });
    expect(users.data.length).toBe(1);
    expect(users.total).toBe(2);
    expect(users.totalPages).toBe(2);
    expect(users.currentPage).toBe(1);
  });

  it("should update a user's sort order", async () => {
    await userService.create(data[0]);
    await userService.create(data[1]);

    const users = await userService.getPaginated({
      page: 1,
      limit: 1,
      sort: "username",
      order: "DESC",
    });
    expect(users.data.length).toBe(1);
    expect(users.data[0].username).toBe("charlie");
  });

  it("should query users by name", async () => {
    await userService.create(data[0]);
    await userService.create(data[1]);
    const users = await userService.getPaginated({
      q: "cha",
      page: 1,
      limit: 1,
    });
    expect(users.data.length).toBe(1);
    expect(users.data[0].username).toBe("charlie");
  });
});
