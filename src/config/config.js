// config/config.js
require("dotenv").config(); // Optional, if you're using .env

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "dev_user",
    password: process.env.DB_PASSWORD || "dev_pass",
    database: process.env.DB_NAME || "dev_db",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    // port: 5432,
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
  },
};
