module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/tests/setupEnv.js"],
  reporters: [
    "default",
    [
      "jest-summary-reporter",
      {
        failuresOnly: true,
      },
    ],
  ],
};
