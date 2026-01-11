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
  it("should login and return access and refresh tokens", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "alice", password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("should refresh access token", async () => {
    // Login to get tokens
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ username: "alice", password: "123456" });

    const { refreshToken } = loginRes.body;

    // Refresh token
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("should fail validation with invalid refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: "invalid-token" });

    expect(res.status).not.toBe(200);
  });

  it("should logout successfully", async () => {
    // Login to get tokens
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ username: "alice", password: "123456" });

    const { refreshToken } = loginRes.body;

    // Logout
    const res = await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken });

    expect(res.status).toBe(204);

    // Try to refresh with invalidated token
    const refreshRes = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken });

    expect(refreshRes.status).not.toBe(200);
  });
});
