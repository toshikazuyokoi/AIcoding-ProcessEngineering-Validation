#!/usr/bin/env node

/**
 * ===================================
 * Task Management System - Test Runner Validation
 * ===================================
 * Generated for TSK-021-SCR-test-cross
 * Project: Task Management System
 * Component: Cross-Platform Test Runner Testing
 * Purpose: Test and validate the cross-platform test execution script
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

// Import the test runner modules
const { TestRunner, TestEnvironment, Logger } = require("./run-tests.js");

// ===================================
// Test Configuration
// ===================================
const TEST_CONFIG = {
  testTimeout: 60000,
  mockProjectRoot: path.join(os.tmpdir(), "test-task-management-runner"),
  requiredTestTypes: ["unit", "integration", "e2e", "performance", "security"],
  requiredDirectories: [
    "test-results",
    "coverage",
    "test-reports",
    "test-artifacts",
  ],
};

// ===================================
// Test Utilities
// ===================================
class TestLogger {
  static test(message) {
    console.log(`\x1b[35m🧪 ${message}\x1b[0m`);
  }

  static pass(message) {
    console.log(`\x1b[32m✅ PASS: ${message}\x1b[0m`);
  }

  static fail(message) {
    console.log(`\x1b[31m❌ FAIL: ${message}\x1b[0m`);
  }

  static skip(message) {
    console.log(`\x1b[33m⏭️  SKIP: ${message}\x1b[0m`);
  }
}

class MockTestEnvironment {
  constructor() {
    this.mockRoot = TEST_CONFIG.mockProjectRoot;
    this.originalCwd = process.cwd();
  }

  async setup() {
    TestLogger.test("Setting up mock test environment");

    // Create mock project structure
    if (fs.existsSync(this.mockRoot)) {
      await this.cleanup();
    }

    fs.mkdirSync(this.mockRoot, { recursive: true });

    // Create mock backend
    const backendDir = path.join(this.mockRoot, "backend");
    fs.mkdirSync(backendDir, { recursive: true });

    const backendPackageJson = {
      name: "task-management-backend",
      version: "1.0.0",
      scripts: {
        test: 'echo "Backend unit tests passed"',
        "test:coverage": 'echo "Backend coverage tests passed"',
        "test:integration": 'echo "Backend integration tests passed"',
      },
      dependencies: {
        express: "^4.18.0",
        jest: "^29.0.0",
      },
    };

    fs.writeFileSync(
      path.join(backendDir, "package.json"),
      JSON.stringify(backendPackageJson, null, 2)
    );

    // Create mock frontend
    const frontendDir = path.join(this.mockRoot, "frontend");
    fs.mkdirSync(frontendDir, { recursive: true });

    const frontendPackageJson = {
      name: "task-management-frontend",
      version: "1.0.0",
      scripts: {
        test: 'echo "Frontend unit tests passed"',
        "test:coverage": 'echo "Frontend coverage tests passed"',
        "test:integration": 'echo "Frontend integration tests passed"',
      },
      dependencies: {
        react: "^18.2.0",
        jest: "^29.0.0",
        "@playwright/test": "^1.40.0",
      },
    };

    fs.writeFileSync(
      path.join(frontendDir, "package.json"),
      JSON.stringify(frontendPackageJson, null, 2)
    );

    // Create mock docker-compose.test.yml
    const dockerCompose = `
version: '3.8'
services:
  postgres-test:
    image: postgres:16.1-alpine
    container_name: task-management-postgres-test
    environment:
      POSTGRES_DB: taskdb_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"

  redis-test:
    image: redis:7.2-alpine
    container_name: task-management-redis-test
    ports:
      - "6380:6379"

  backend-test:
    build: ./backend
    container_name: task-management-backend-test
    ports:
      - "8001:8000"

  frontend-test:
    build: ./frontend
    container_name: task-management-frontend-test
    ports:
      - "3001:3000"
`;

    fs.writeFileSync(
      path.join(this.mockRoot, "docker-compose.test.yml"),
      dockerCompose
    );

    TestLogger.pass("Mock test environment created");
  }

  async cleanup() {
    TestLogger.test("Cleaning up mock test environment");

    process.chdir(this.originalCwd);

    if (fs.existsSync(this.mockRoot)) {
      try {
        // Windows-specific cleanup with retry
        if (os.platform() === "win32") {
          await this.windowsCleanup();
        } else {
          fs.rmSync(this.mockRoot, { recursive: true, force: true });
        }
      } catch (error) {
        TestLogger.test(`Cleanup warning: ${error.message}`);
        // Don't fail the test for cleanup issues
      }
    }

    TestLogger.pass("Mock test environment cleaned up");
  }

  async windowsCleanup() {
    const maxRetries = 3;
    const retryDelay = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        fs.rmSync(this.mockRoot, { recursive: true, force: true });
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  changeToMockRoot() {
    process.chdir(this.mockRoot);
  }
}

// ===================================
// Test Suites
// ===================================
class TestEnvironmentTests {
  static async run() {
    TestLogger.test("Running TestEnvironment tests");

    let passed = 0;
    let failed = 0;

    // Test platform detection
    try {
      const platform = TestEnvironment.getPlatform();
      if (typeof platform === "string" && platform.length > 0) {
        TestLogger.pass(`Platform detection: ${platform}`);
        passed++;
      } else {
        TestLogger.fail("Platform detection returned invalid result");
        failed++;
      }
    } catch (error) {
      TestLogger.fail(`Platform detection failed: ${error.message}`);
      failed++;
    }

    // Test environment checking
    try {
      const checks = await TestEnvironment.checkTestEnvironment();
      if (Array.isArray(checks) && checks.length > 0) {
        TestLogger.pass(
          `Environment check works: ${checks.length} checks performed`
        );
        passed++;
      } else {
        TestLogger.fail("Environment check returned invalid result");
        failed++;
      }
    } catch (error) {
      TestLogger.fail(`Environment check failed: ${error.message}`);
      failed++;
    }

    // Test directory setup
    try {
      const tempDir = path.join(os.tmpdir(), "test-env-setup");
      const originalCwd = process.cwd();

      // Create temp directory first
      fs.mkdirSync(tempDir, { recursive: true });
      process.chdir(tempDir);

      await TestEnvironment.setupTestDirectories();

      const requiredDirs = [
        "test-results",
        "coverage",
        "test-reports",
        "test-artifacts",
      ];
      let allDirsCreated = true;

      for (const dir of requiredDirs) {
        if (!fs.existsSync(path.join(tempDir, dir))) {
          allDirsCreated = false;
          break;
        }
      }

      // Restore original directory
      process.chdir(originalCwd);

      if (allDirsCreated) {
        TestLogger.pass("Directory setup works");
        passed++;
      } else {
        TestLogger.fail(
          "Directory setup failed - some directories not created"
        );
        failed++;
      }

      // Cleanup
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      TestLogger.fail(`Directory setup test failed: ${error.message}`);
      failed++;
    }

    return { passed, failed };
  }
}

class TestRunnerTests {
  static async run() {
    TestLogger.test("Running TestRunner tests");

    let passed = 0;
    let failed = 0;

    const mockEnv = new MockTestEnvironment();

    try {
      await mockEnv.setup();
      mockEnv.changeToMockRoot();

      // Test TestRunner initialization
      try {
        const runner = new TestRunner({
          testType: "unit",
          coverage: false,
          verbose: false,
        });

        if (runner.platform && runner.projectRoot && runner.options) {
          TestLogger.pass("TestRunner initialization");
          passed++;
        } else {
          TestLogger.fail("TestRunner initialization failed");
          failed++;
        }
      } catch (error) {
        TestLogger.fail(`TestRunner initialization failed: ${error.message}`);
        failed++;
      }

      // Test environment checking
      try {
        const runner = new TestRunner();
        await runner.checkEnvironment();
        TestLogger.pass("Environment checking");
        passed++;
      } catch (error) {
        TestLogger.fail(`Environment checking failed: ${error.message}`);
        failed++;
      }

      // Test environment setup
      try {
        const runner = new TestRunner();
        await runner.setupEnvironment();
        TestLogger.pass("Environment setup");
        passed++;
      } catch (error) {
        TestLogger.fail(`Environment setup failed: ${error.message}`);
        failed++;
      }
    } finally {
      await mockEnv.cleanup();
    }

    return { passed, failed };
  }
}

class IntegrationTests {
  static async run() {
    TestLogger.test("Running Integration tests");

    let passed = 0;
    let failed = 0;

    // Test help flag
    try {
      const helpOutput = execSync(
        "node scripts/cross-platform/run-tests.js --help",
        {
          encoding: "utf8",
          stdio: "pipe",
        }
      );

      if (helpOutput.includes("Usage:") && helpOutput.includes("Test Types:")) {
        TestLogger.pass("Help flag works");
        passed++;
      } else {
        TestLogger.fail("Help flag output incomplete");
        failed++;
      }
    } catch (error) {
      TestLogger.fail(`Help flag test failed: ${error.message}`);
      failed++;
    }

    // Test script syntax
    try {
      execSync("node -c scripts/cross-platform/run-tests.js", {
        stdio: "pipe",
      });
      TestLogger.pass("Script syntax is valid");
      passed++;
    } catch (error) {
      TestLogger.fail(`Script syntax check failed: ${error.message}`);
      failed++;
    }

    // Test module exports
    try {
      const runTestsModule = require("./run-tests.js");
      if (
        runTestsModule.TestRunner &&
        runTestsModule.TestEnvironment &&
        runTestsModule.Logger
      ) {
        TestLogger.pass("Module exports are correct");
        passed++;
      } else {
        TestLogger.fail("Module exports are incomplete");
        failed++;
      }
    } catch (error) {
      TestLogger.fail(`Module export test failed: ${error.message}`);
      failed++;
    }

    return { passed, failed };
  }
}

// ===================================
// Test Runner
// ===================================
class TestValidationRunner {
  constructor() {
    this.totalPassed = 0;
    this.totalFailed = 0;
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log("\n" + "=".repeat(60));
    TestLogger.test("🧪 Cross-Platform Test Runner Validation Suite");
    console.log("=".repeat(60));

    // Run TestEnvironment tests
    console.log("\n📋 TestEnvironment Tests");
    console.log("-".repeat(30));
    const envResults = await TestEnvironmentTests.run();
    this.totalPassed += envResults.passed;
    this.totalFailed += envResults.failed;

    // Run TestRunner tests
    console.log("\n📋 TestRunner Tests");
    console.log("-".repeat(30));
    const runnerResults = await TestRunnerTests.run();
    this.totalPassed += runnerResults.passed;
    this.totalFailed += runnerResults.failed;

    // Run Integration tests
    console.log("\n📋 Integration Tests");
    console.log("-".repeat(30));
    const integrationResults = await IntegrationTests.run();
    this.totalPassed += integrationResults.passed;
    this.totalFailed += integrationResults.failed;

    this.printSummary();
  }

  printSummary() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    console.log("\n" + "=".repeat(60));
    TestLogger.test("📊 Test Validation Results Summary");
    console.log("=".repeat(60));

    console.log(`\n📈 Results:`);
    console.log(`  ✅ Passed: ${this.totalPassed}`);
    console.log(`  ❌ Failed: ${this.totalFailed}`);
    console.log(`  📊 Total:  ${this.totalPassed + this.totalFailed}`);
    console.log(`  ⏱️  Duration: ${duration}ms`);

    const successRate =
      this.totalPassed + this.totalFailed > 0
        ? (
            (this.totalPassed / (this.totalPassed + this.totalFailed)) *
            100
          ).toFixed(1)
        : 0;

    console.log(`  📊 Success Rate: ${successRate}%`);

    if (this.totalFailed === 0) {
      console.log("\n🎉 All validation tests passed!");
    } else {
      console.log(`\n⚠️  ${this.totalFailed} validation test(s) failed`);
    }

    console.log("\n" + "=".repeat(60));

    // Exit with appropriate code
    process.exit(this.totalFailed > 0 ? 1 : 0);
  }
}

// ===================================
// Main Execution
// ===================================
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Cross-Platform Test Runner Validation Suite

Usage: node test-run-tests.js [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Enable verbose logging

Examples:
  node test-run-tests.js           # Run all validation tests
  node test-run-tests.js --verbose # Run with verbose output
`);
    process.exit(0);
  }

  if (args.includes("--verbose") || args.includes("-v")) {
    process.env.VERBOSE = "true";
  }

  try {
    const runner = new TestValidationRunner();
    await runner.runAllTests();
  } catch (error) {
    TestLogger.fail(`Test validation runner failed: ${error.message}`);

    if (process.env.VERBOSE) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run validation tests if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    TestLogger.fail(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { TestValidationRunner, MockTestEnvironment, TestLogger };
