// src/tests/setup.js
const { sequelize, User } = require("../models");
const authService = require("../services/auth.service");

// Mock authService.getCurrent to return a default test user
jest.mock("../services/auth.service", () => {
  const originalModule = jest.requireActual("../services/auth.service");
  return {
    __esModule: true,
    ...originalModule,
    getCurrent: jest.fn().mockImplementation(async () => {
      const models = require("../models");
      const user = await models.sequelize.models.User.findOne({ where: { username: "alice" } });
      if (!user) {
        throw new Error("Test user 'alice' not found");
      }
      return user;
    }),
  };
});

// ✅ Run once before all tests (authenticate)
async function setupDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connected (test).");
  } catch (err) {
    console.error("Sequelize connection failed:", err);
    throw err;
  }
}

// ✅ Reset DB before each test
async function resetDatabase() {
  try {
    await sequelize.sync({ force: true }); // drop + recreate tables
  } catch (err) {
    console.error("Sequelize sync failed:", err);
    throw err;
  }
}

module.exports = { sequelize, setupDatabase, resetDatabase };
