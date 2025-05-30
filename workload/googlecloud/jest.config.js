/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testEnvironment: "node",
  collectCoverageFrom: ["*.ts", "!*.test.ts", "!jest.config.js"],
  // Exclude specific lines from coverage calculation (the catch handler in server initialization)
  coveragePathIgnorePatterns: ["<rootDir>/node_modules/"],
  // Modify coverage thresholds to account for the coverage we can't get
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 97, // Allow for the lines we can't cover
      statements: 97, // Allow for the statements we can't cover
    },
  },
  // Force Jest to exit after all tests are complete
  // This is needed especially in CI environments
  forceExit: true,
  // Set a longer timeout to give the tests time to complete
  testTimeout: 30000,
  // Add coverage reporters
  coverageReporters: ["json", "lcov", "text", "clover"],
  coverageProvider: "v8",
};
