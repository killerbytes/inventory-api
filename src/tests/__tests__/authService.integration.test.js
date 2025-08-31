const userService = require("../../services/user.service");
const { setupDatabase, resetDatabase } = require("../setup");
const request = require("supertest");

const app = require("../../app");
const { createUser } = require("../utils");
const { getUser, loginUser } = require("../utils");
const authService = require("../../services/auth.service");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await createUser(0);
});

describe("Auth Service (Integration)", () => {
  it("should login and fetch user", async () => {
    const user = await authService.getCurrent();

    expect(user).not.toBeNull();
    expect(user.username).toBe("alice");
  });
});
