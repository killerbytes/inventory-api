const request = require("supertest");
const app = require("../../app");
const { setupDatabase, resetDatabase, sequelize } = require("../setup");
const { createUser, loginUser } = require("../utils");

let adminToken, userToken;

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await resetDatabase();
  // Create an admin user (User ID 1 is default admin in some contexts, but let's be explicit if we can)
  // In our system, isAdmin is a flag.
  const admin = await sequelize.models.User.create({
    username: "admin",
    name: "Admin",
    password: sequelize.models.User.generateHash("password123"),
    email: "admin@example.com",
    isAdmin: true,
    isActive: true,
  });

  const regularUser = await sequelize.models.User.create({
    username: "user",
    name: "User",
    password: sequelize.models.User.generateHash("password123"),
    email: "user@example.com",
    isAdmin: false,
    isActive: true,
  });

  // Login both
  const adminRes = await request(app)
    .post("/api/auth/login")
    .send({ username: "admin", password: "password123" });
  adminToken = adminRes.body.accessToken;

  const userRes = await request(app)
    .post("/api/auth/login")
    .send({ username: "user", password: "password123" });
  userToken = userRes.body.accessToken;
});

describe("Role-Based Access Control (RBAC)", () => {
  describe("User Management (/api/users)", () => {
    it("should allow admin to list users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("x-access-token", adminToken);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should FORBID regular user from listing users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("x-access-token", userToken);

      // THIS IS EXPECTED TO FAIL CURRENTLY (it will likely return 200)
      expect(res.status).toBe(403);
    });
  });

  describe("Backup (/api/backup)", () => {
    it("should allow admin to trigger backup", async () => {
      // Mocking the backup logic might be needed if it takes too long,
      // but let's see if it just responds.
      const res = await request(app)
        .post("/api/backup")
        .set("x-access-token", adminToken);

      expect(res.status).not.toBe(403);
      expect(res.status).not.toBe(401);
    });

    it("should FORBID regular user from triggering backup", async () => {
      const res = await request(app)
        .post("/api/backup")
        .set("x-access-token", userToken);

      // THIS IS EXPECTED TO FAIL CURRENTLY
      expect(res.status).toBe(403);
    });
  });
});
