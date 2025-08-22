const db = require("../models");
const { sequelize } = db;

const setupDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (err) {
    console.error("Sequelize sync failed:", err);
    throw err;
  }
};

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (err) {
    console.warn("Sequelize already closed", err);
  }
});

beforeEach(async () => {
  await sequelize.truncate({ cascade: true });
});

module.exports = { sequelize, setupDatabase };
