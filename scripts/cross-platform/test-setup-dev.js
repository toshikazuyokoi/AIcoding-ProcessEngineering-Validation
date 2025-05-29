#!/usr/bin/env node

/**
 * ===================================
 * Task Management System - Cross-Platform Setup Test
 * ===================================
 * Generated for TSK-020-SCR-setup-cross
 * Project: Task Management System
 * Component: Cross-Platform Setup Script Testing
 * Purpose: Test and validate the development environment setup script
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

// Import the setup script modules
const { EnvironmentSetup, SystemChecker, Logger } = require("./setup-dev.js");

// ===================================
// Test Configuration
// ===================================
const TEST_CONFIG = {
  testTimeout: 30000,
  mockProjectRoot: path.join(os.tmpdir(), "test-task-management"),
  requiredFiles: [
    "backend/package.json",
    "frontend/package.json",
    "docker-compose.dev.yml",
    "backend/.env.example",
    "frontend/.env.example",
  ],
  requiredDirectories: [
    "logs",
    "coverage",
    "test-results",
    "backup",
    "uploads",
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

class MockEnvironment {
  constructor() {
    this.mockRoot = TEST_CONFIG.mockProjectRoot;
    this.originalCwd = process.cwd();
  }

  async setup() {
    TestLogger.test("Setting up mock environment");

    // Create mock project structure
    if (fs.existsSync(this.mockRoot)) {
      fs.rmSync(this.mockRoot, { recursive: true, force: true });
    }

    fs.mkdirSync(this.mockRoot, { recursive: true });

    // Create mock backend
    const backendDir = path.join(this.mockRoot, "backend");
    fs.mkdirSync(backendDir, { recursive: true });

    const backendPackageJson = {
      name: "task-management-backend",
      version: "1.0.0",
      scripts: {
        dev: 'echo "Backend dev server"',
        build: 'echo "Backend build"',
        "db:migrate": 'echo "Database migration"',
      },
      dependencies: {
        express: "^4.18.0",
      },
    };

    fs.writeFileSync(
      path.join(backendDir, "package.json"),
      JSON.stringify(backendPackageJson, null, 2)
    );

    // Create mock .env.example
    fs.writeFileSync(
      path.join(backendDir, ".env.example"),
      "DATABASE_URL=postgresql://postgres:password@localhost:5432/taskdb_dev\nJWT_SECRET=your-secret-key"
    );

    // Create mock frontend
    const frontendDir = path.join(this.mockRoot, "frontend");
    fs.mkdirSync(frontendDir, { recursive: true });

    const frontendPackageJson = {
      name: "task-management-frontend",
      version: "1.0.0",
      scripts: {
        dev: 'echo "Frontend dev server"',
        build: 'echo "Frontend build"',
      },
      dependencies: {
        react: "^18.2.0",
      },
    };

    fs.writeFileSync(
      path.join(frontendDir, "package.json"),
      JSON.stringify(frontendPackageJson, null, 2)
    );

    // Create mock .env.example
    fs.writeFileSync(
      path.join(frontendDir, ".env.example"),
      "REACT_APP_API_URL=http://localhost:8000\nREACT_APP_ENV=development"
    );

    // Create mock docker-compose.dev.yml
    const dockerCompose = `
version: '3.8'
services:
  postgres:
    image: postgres:16.1-alpine
    container_name: task-management-postgres-dev
    environment:
      POSTGRES_DB: taskdb_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dev_password_123
    ports:
      - "5432:5432"

  redis:
    image: redis:7.2-alpine
    container_name: task-management-redis-dev
    ports:
      - "6379:6379"
`;

    fs.writeFileSync(
      path.join(this.mockRoot, "docker-compose.dev.yml"),
      dockerCompose
    );

    TestLogger.pass("Mock environment created");
  }

  async cleanup() {
    TestLogger.test("Cleaning up mock environment");

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

    TestLogger.pass("Mock environment cleaned up");
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

  changeTomockRoot() {
    process.chdir(this.mockRoot);
  }
}

// ===================================
// Test Suites
// ===================================
class SystemCheckerTests {
  static async run() {
    TestLogger.test("Running SystemChecker tests");

    let passed = 0;
    let failed = 0;

    // Test platform detection
    try {
      const platform = SystemChecker.getPlatform();
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

    // Test command checking
    try {
      const nodeCheck = await SystemChecker.checkCommand("node");
      if (typeof nodeCheck === "object" && "installed" in nodeCheck) {
        TestLogger.pass(
          `Command check works: node installed = ${nodeCheck.installed}`
        );
        passed++;
      } else {
        TestLogger.fail("Command check returned invalid result");
        failed++;
      }
    } catch (error) {
      TestLogger.fail(`Command check failed: ${error.message}`);
      failed++;
    }

    // Test port checking
    try {
      const portAvailable = await SystemChecker.checkPort(0); // Port 0 should be available
      if (typeof portAvailable === "boolean") {
        TestLogger.pass(
          `Port check works: port 0 available = ${portAvailable}`
        );
        passed++;
      } else {
        TestLogger.fail("Port check returned invalid result");
        failed++;
      }
    } catch (error) {
      TestLogger.fail(`Port check failed: ${error.message}`);
      failed++;
    }

    return { passed, failed };
  }
}

class EnvironmentSetupTests {
  static async run() {
    TestLogger.test("Running EnvironmentSetup tests");

    let passed = 0;
    let failed = 0;

    const mockEnv = new MockEnvironment();

    try {
      await mockEnv.setup();
      mockEnv.changeTomockRoot();

      // Test environment setup initialization
      try {
        const setup = new EnvironmentSetup();
        if (setup.platform && setup.projectRoot) {
          TestLogger.pass("EnvironmentSetup initialization");
          passed++;
        } else {
          TestLogger.fail("EnvironmentSetup initialization failed");
          failed++;
        }
      } catch (error) {
        TestLogger.fail(
          `EnvironmentSetup initialization failed: ${error.message}`
        );
        failed++;
      }

      // Test directory setup
      try {
        const setup = new EnvironmentSetup();
        await setup.setupDirectories();

        let allDirsCreated = true;
        for (const dir of TEST_CONFIG.requiredDirectories) {
          if (!fs.existsSync(path.join(mockEnv.mockRoot, dir))) {
            allDirsCreated = false;
            break;
          }
        }

        if (allDirsCreated) {
          TestLogger.pass("Directory setup");
          passed++;
        } else {
          TestLogger.fail("Directory setup - some directories not created");
          failed++;
        }
      } catch (error) {
        TestLogger.fail(`Directory setup failed: ${error.message}`);
        failed++;
      }

      // Test environment file setup
      try {
        const setup = new EnvironmentSetup();
        await setup.setupEnvironmentFiles();

        const backendEnvExists = fs.existsSync(
          path.join(mockEnv.mockRoot, "backend/.env")
        );
        const frontendEnvExists = fs.existsSync(
          path.join(mockEnv.mockRoot, "frontend/.env")
        );

        if (backendEnvExists && frontendEnvExists) {
          TestLogger.pass("Environment file setup");
          passed++;
        } else {
          TestLogger.fail("Environment file setup - files not created");
          failed++;
        }
      } catch (error) {
        TestLogger.fail(`Environment file setup failed: ${error.message}`);
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
        "node scripts/cross-platform/setup-dev.js --help",
        {
          encoding: "utf8",
          stdio: "pipe",
        }
      );

      if (helpOutput.includes("Usage:") && helpOutput.includes("Options:")) {
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
      execSync("node -c scripts/cross-platform/setup-dev.js", {
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
      const setupModule = require("./setup-dev.js");
      if (
        setupModule.EnvironmentSetup &&
        setupModule.SystemChecker &&
        setupModule.Logger
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
class TestRunner {
  constructor() {
    this.totalPassed = 0;
    this.totalFailed = 0;
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log("\n" + "=".repeat(60));
    TestLogger.test("🧪 Cross-Platform Setup Script Test Suite");
    console.log("=".repeat(60));

    // Run SystemChecker tests
    console.log("\n📋 SystemChecker Tests");
    console.log("-".repeat(30));
    const systemResults = await SystemCheckerTests.run();
    this.totalPassed += systemResults.passed;
    this.totalFailed += systemResults.failed;

    // Run EnvironmentSetup tests
    console.log("\n📋 EnvironmentSetup Tests");
    console.log("-".repeat(30));
    const setupResults = await EnvironmentSetupTests.run();
    this.totalPassed += setupResults.passed;
    this.totalFailed += setupResults.failed;

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
    TestLogger.test("📊 Test Results Summary");
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
      console.log("\n🎉 All tests passed!");
    } else {
      console.log(`\n⚠️  ${this.totalFailed} test(s) failed`);
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
Cross-Platform Setup Script Test Suite

Usage: node test-setup-dev.js [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Enable verbose logging

Examples:
  node test-setup-dev.js           # Run all tests
  node test-setup-dev.js --verbose # Run with verbose output
`);
    process.exit(0);
  }

  if (args.includes("--verbose") || args.includes("-v")) {
    process.env.VERBOSE = "true";
  }

  try {
    const runner = new TestRunner();
    await runner.runAllTests();
  } catch (error) {
    TestLogger.fail(`Test runner failed: ${error.message}`);

    if (process.env.VERBOSE) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    TestLogger.fail(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { TestRunner, MockEnvironment, TestLogger };
