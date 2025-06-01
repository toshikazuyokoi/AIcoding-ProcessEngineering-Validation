module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // 修正: 全ディレクトリを対象に拡張
  roots: ["<rootDir>"],

  // 修正: より柔軟なテストファイル検出
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],

  // 修正: node_modules等を明示的に除外
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],

  transform: {
    "^.+\\.ts$": "ts-jest",
  },

  // 修正: 実装コードのみカバレッジ対象
  collectCoverageFrom: [
    "src/**/*.ts",
    "schemas/**/*.ts",
    "scripts/**/*.ts",
    "!**/*.d.ts",
    "!**/*.test.ts",
    "!**/*.spec.ts",
    "!**/node_modules/**",
    "!**/dist/**",
  ],

  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  // 修正: カバレッジ閾値を現実的に調整
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    "src/**/*.ts": {
      branches: 85,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  testTimeout: 15000, // 修正: WSL環境考慮で延長
  clearMocks: true,
  restoreMocks: true,
  verbose: true,

  // 追加: WSL環境対応
  forceExit: true,
  detectOpenHandles: true,
};
