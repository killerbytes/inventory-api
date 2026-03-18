// src/tests/setupEnv.js
const path = require("path");
const dotenv = require("dotenv");

// Load the environment variables from .env.test
const envPath = path.resolve(__dirname, "../../.env.test");
dotenv.config({ path: envPath });

// Ensure NODE_ENV is set to test for all test runs
process.env.NODE_ENV = "test";
