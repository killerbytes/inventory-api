require("dotenv").config({ path: ".env.development" });

module.exports = {
  // Path to your Sequelize models
  "models-path": "./src/models",

  // Where migration files will be stored
  "migrations-path": "./src/migrations",

  // DB connection from .env
  "url-database":
    process.env.DB_URI ||
    `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,

  // Optional logging
  //   debug: true,
};
