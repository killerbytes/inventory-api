const userService = require("../../services/user.service");
const { setupDatabase, resetDatabase } = require("../setup");
const { getConstraintFields, createUser, users } = require("../utils");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createUser(0);
  await createUser(1);
});

describe("User Service (Integration)", () => {
  it("should create and fetch a user", async () => {
    const user = await userService.get(1);
    expect(user).not.toBeNull();
    expect(user.name).toBe(users[0].name);
    expect(user.email).toBe(users[0].email);
    expect(user.username).toBe(users[0].username);
  });

  it("should list all users", async () => {
    const users = await userService.list();
    expect(users.length).toBe(2); // ✅ now deterministic
  });

  it("should update a user email", async () => {
    const updated = await userService.update(1, {
      email: "newalice@test.com",
      name: "Alice Updated",
      username: "alice_updated",
    });

    expect(updated.name).toBe("Alice Updated");
    expect(updated.email).toBe("newalice@test.com");
    expect(updated.username).toBe("alice_updated");
  });

  it("should delete a user", async () => {
    const user = await userService.get(1);
    const result = await userService.delete(user.id);

    expect(result).toBe(true);

    await expect(userService.get(user.id)).rejects.toThrow("User not found");
  });

  it("should enforce unique username constraint", async () => {
    try {
      await userService.create({ ...users[0], email: "test@email.com" });
      throw new Error(
        "Expected SequelizeUniqueConstraintError but no error was thrown"
      );
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
    try {
      await userService.create({ ...users[1], email: users[0].email });
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

  it("should get a paginated list of users", async () => {
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
    const users = await userService.getPaginated({
      q: "cha",
      page: 1,
      limit: 1,
    });
    expect(users.data.length).toBe(1);
    expect(users.data[0].username).toBe("charlie");
  });
});
