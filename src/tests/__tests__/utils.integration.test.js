const { getSKU, shortenNameTo, shortenTitleTo } = require("../../utils");

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

describe("Utils", () => {
  it("should shorten name to", async () => {
    const name = "[Godex] PP-R Female Elbow";
    const category = 1;
    const unit = "m";
    const values = [
      {
        variantTypeId: 1,
        value: "1",
      },
      {
        variantTypeId: 2,
        value: "2",
      },
      {
        variantTypeId: 3,
        value: "3",
      },
    ];

    console.log(shortenTitleTo(name));

    // expect(result).toBe("Test Product - 1|2|3");
    // expect(result).toHaveLength(20);
    // expect(result).toMatch(/^[0-9]{2}\|[0-9]{2}\|[0-9]{2}$/);
    // expect(result).toMatch(/^[0-9]{2}\|[0-9]{2}\|[0-9]{2}$/);
  });
});
