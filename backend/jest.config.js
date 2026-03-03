// ================================================================
// backend/jest.config.js
// PURPOSE:
// Configure Jest for ES Modules + Test Environment
// ================================================================

export default {

  testEnvironment: "node",

  transform: {},

  testMatch: ["**/tests/**/*.test.js"],

  // Load env BEFORE tests
  setupFiles: ["<rootDir>/tests/loadEnv.js"],

  testTimeout: 20000
};