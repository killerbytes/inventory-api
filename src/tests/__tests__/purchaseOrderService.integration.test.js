const userService = require("../../services/users.service");
const { setupDatabase, resetDatabase } = require("../setup");
const request = require("supertest");

const app = require("../../app");
const purchaseOrdersService = require("../../services/purchaseOrders.service");

beforeAll(async () => {
  await setupDatabase(); // run migrations / sync once
});

beforeEach(async () => {
  await resetDatabase();
  await userService.create({
    name: "Test User",
    username: "testuser",
    email: "test@test.com",
    password: "test",
    confirmPassword: "test",
    isActive: true,
  });
  await userService.update(1, { isActive: true });
});

describe("Product Combination Service (Integration)", () => {
  it("should create a purchase order", async () => {
    await purchaseOrdersService.create({
      supplierId: 1,
      deliveryDate: new Date(),
      notes: "Test Notes",
      internalNotes: "Test Internal Notes",
      purchaseOrderItems: [
        {
          combinationId: 1,
          quantity: 1,
          purchasePrice: 100,
        },
        {
          combinationId: 2,
          quantity: 1,
          purchasePrice: 100,
        },
      ],
      modeOfPayment: "Cash",
    });
  });
});
