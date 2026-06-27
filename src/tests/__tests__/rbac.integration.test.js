const request = require("supertest");
const { startServer } = require("../../app");
const { setupDatabase, resetDatabase, sequelize } = require("../setup");

let app;
let adminToken, userToken;

beforeAll(async () => {
  await setupDatabase();
  app = await startServer();
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await resetDatabase();
  
  await sequelize.models.User.create({
    username: "admin",
    name: "Admin",
    password: sequelize.models.User.generateHash("password123"),
    email: "admin@example.com",
    role: "Admin",
    isActive: true,
  });

  await sequelize.models.User.create({
    username: "user",
    name: "User",
    password: sequelize.models.User.generateHash("password123"),
    email: "user@example.com",
    role: "User",
    isActive: true,
  });

  const adminRes = await request(app)
    .post("/graphql")
    .send({
      query: `
        mutation {
          login(username: "admin", password: "password123") {
            accessToken
          }
        }
      `
    });
  adminToken = adminRes.body.data.login.accessToken;

  const userRes = await request(app)
    .post("/graphql")
    .send({
      query: `
        mutation {
          login(username: "user", password: "password123") {
            accessToken
          }
        }
      `
    });
  userToken = userRes.body.data.login.accessToken;
});

describe("Role-Based Access Control (RBAC)", () => {
  describe("User Management", () => {
    it("should allow admin to list users", async () => {
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `query { users { id username } }`
        });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeUndefined();
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    it("should FORBID regular user from listing users", async () => {
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          query: `query { users { id username } }`
        });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].extensions.code).toBe("FORBIDDEN");
    });
  });
  
  describe("Products Management", () => {
    it("should allow regular user to list products", async () => {
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          query: `query { products { id name } }`
        });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeUndefined();
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it("should FORBID regular user from creating products", async () => {
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          query: `
            mutation {
              createProduct(input: { name: "Hacked Product" }) {
                id
              }
            }
          `
        });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].extensions.code).toBe("FORBIDDEN");
    });
  });
});
