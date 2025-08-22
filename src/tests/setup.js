// src/tests/setup.js
const { sequelize } = require("../models");

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
