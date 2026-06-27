const userService = require("../../services/user.service");
const { setupDatabase, resetDatabase } = require("../setup");
const request = require("supertest");

const { startServer } = require("../../app");
const { createUser } = require("../utils");
const { getUser, loginUser } = require("../utils");
const authService = require("../../services/auth.service");

let app;

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
  app = await startServer(); // mount GraphQL
});

beforeEach(async () => {
  await resetDatabase();
  await createUser(0);
});

describe("Auth Service (Integration)", () => {
  it("should login and return access and refresh tokens", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation Login($username: String!, $password: String!) {
            login(username: $username, password: $password) {
              accessToken
            }
          }
        `,
        variables: { username: "alice", password: "123456" }
      });

    expect(res.status).toBe(200);
    expect(res.body.data.login).toHaveProperty("accessToken");
    expect(res.body.data.login).not.toHaveProperty("refreshToken"); // Refresh token should be in cookie
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/refreshToken=.+/);
  });

  it("should refresh access token", async () => {
    // Login to get tokens
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

    const cookies = loginRes.headers["set-cookie"];

    // Refresh token
    const res = await request(app)
      .post("/graphql")
      .set("Cookie", cookies)
      .send({
        query: `
          mutation {
            refreshTokens {
              accessToken
            }
          }
        `
      });

    expect(res.status).toBe(200);
    expect(res.body.data.refreshTokens).toHaveProperty("accessToken");
    // Expect new refresh token cookie
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should fail validation with invalid refresh token", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Cookie", ["refreshToken=invalid-token"])
      .send({
        query: `
          mutation {
            refreshTokens {
              accessToken
            }
          }
        `
      });

    // Apollo server returns 200 with an errors array when a resolver throws an error.
    // Sometimes it returns 400 depending on the plugin setup.
    expect(res.body.errors).toBeDefined();
  });

  it("should logout successfully", async () => {
    // Login to get tokens
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

    const cookies = loginRes.headers["set-cookie"];

    // Logout
    const res = await request(app)
      .post("/graphql")
      .set("Cookie", cookies)
      .send({
        query: `
          mutation {
            logout
          }
        `
      });

    expect(res.status).toBe(200);
    expect(res.body.data.logout).toBe(true);

    // Try to refresh with invalidated token
    const refreshRes = await request(app)
      .post("/graphql")
      .set("Cookie", cookies)
      .send({
        query: `
          mutation {
            refreshTokens {
              accessToken
            }
          }
        `
      });

    expect(refreshRes.body.errors).toBeDefined();
  });
});
