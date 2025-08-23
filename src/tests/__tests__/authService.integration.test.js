const userService = require("../../services/users.service");
const { setupDatabase, resetDatabase } = require("../setup");
const request = require("supertest");

const app = require("../../app");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
});

describe("Auth Service (Integration)", () => {
  it("should login and fetch user", async () => {
    await userService.create({
      name: "Test User",
      username: "testuser",
      email: "test@test.com",
      password: "test",
      confirmPassword: "test",
      isActive: true,
    });
    await userService.update(1, { isActive: true });
    const res = await request(app)
      .post("/api/auth/login")
      .set("Accept", "application/json") // tell server to expect json
      .set("Content-Type", "application/json")
      .send({ username: "testuser", password: "test" })
      .expect(200);

    const token = res.body.token;

    const me = await request(app)
      .get("/api/auth/me")
      .set("x-access-token", token)
      .expect(200);
    const user2 = me.body;

    expect(user2).not.toBeNull();
    expect(user2.username).toBe("testuser");
  });
});
