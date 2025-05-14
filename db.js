// db.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("inventory_db", "root", "killer", {
  host: "localhost",
  dialect: "mysql",
  logging: true, // disable SQL logging
});

module.exports = sequelize;
