const request = require("supertest");
const app = require("../../app");
const { setupDatabase, resetDatabase } = require("../setup");
const { createUser } = require("../utils");

beforeAll(async () => {
  await setupDatabase();
});

beforeEach(async () => {
  await resetDatabase();
});

describe("Security (Integration)", () => {
  it("should block unauthenticated access to /api/users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(403);
  });

  it("should block unauthenticated access to /api/categories POST", async () => {
    const res = await request(app).post("/api/categories").send({
      name: "Hacker Category",
    });
    expect(res.status).toBe(403);
  });

  it("should block unauthenticated access to /api/product-combinations", async () => {
    const res = await request(app).get("/api/product-combinations");
    // Ensure 403 or 401 is returned. The middleware returns 403 for "No token provided".
    expect(res.status).toBe(403);
  });

  it("should block unauthenticated access to /api/backup", async () => {
    // Note: /api/backup is a POST request in app.js
    const res = await request(app).post("/api/backup");
    expect(res.status).toBe(403);
  });

  it("should allow authenticated access to /api/users", async () => {
    const user = await createUser(0); // Create an admin or regular user
    await user.update({ isAdmin: true });
    // We need to login or generate a token.
    // utils.js usually has loginUser or we can generate token directly if we have access to service.
    // Let's use the login flow if possible, or just generate a token.
    // Checking authService.integration.test.js: it uses `request(app).post("/api/auth/login")`.

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ username: "alice", password: "123456" });

    const token = loginRes.body.accessToken;

    const res = await request(app)
      .get("/api/users")
      .set("x-access-token", token);

    expect(res.status).toBe(200);
  });
});
