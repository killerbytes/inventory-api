const { setupDatabase, resetDatabase } = require("../setup");
const request = require("supertest");
const { startServer } = require("../../app");
const { createUser } = require("../utils");

let app;

beforeAll(async () => {
  await setupDatabase();
  app = await startServer();
});

beforeEach(async () => {
  await resetDatabase();
});

describe("Security (Integration)", () => {
  it("should block unauthenticated access to users query", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `query { users { id username } }`
      });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  it("should block unauthenticated access to createCategory mutation", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            createCategory(input: { name: "Hacker Category" }) {
              id
            }
          }
        `
      });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  it("should block unauthenticated access to productCombinations query", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `query { productCombinations { id } }`
      });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  it("should allow authenticated access to users query for Admin", async () => {
    const user = await createUser(0);
    await user.update({ role: "Admin" });

    const loginRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            login(username: "alice", password: "123456") {
              accessToken
            }
          }
        `
      });

    const token = loginRes.body.data.login.accessToken;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query { users { id username } }`
      });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.users)).toBe(true);
  });
});
