const env = process.env.NODE_ENV || "development";
const envPath = `.env.${env}`;
require("dotenv").config({ path: envPath });

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    logging: false,
    pool: {
      max: 1, // pool of one connection only
      idleTimeoutMillis: 10000, // close if unused
    },
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  },
  staging: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    use_env_variable: process.env.DATABASE_URL ? "DATABASE_URL" : null,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 1, // pool of one connection only
      idleTimeoutMillis: 10000, // close if unused
    },
    logging: false,
  },
};
