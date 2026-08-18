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
  beertitos: {
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
      keepAlive: false,
      statement_timeout: 10000,
      idle_in_transaction_session_timeout: 10000,
    },
    pool: {
      max: 2,
      min: 0,
      acquire: 20000,
      idle: 5000,
      evict: 1000,
    },
    logging: false,
  },
};
