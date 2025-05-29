#!/usr/bin/env node

/**
 * ===================================
 * Task Management System - Deployment Script Validation
 * ===================================
 * Generated for TSK-022-SCR-deploy-cross
 * Project: Task Management System
 * Component: Cross-Platform Deployment Testing
 * Purpose: Test and validate the cross-platform deployment script
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

// Import the deployment modules
const { DeploymentManager, SystemChecker, Logger } = require("./deploy.js");

// ===================================
// Test Configuration
// ===================================
const TEST_CONFIG = {
  testTimeout: 60000,
  mockProjectRoot: path.join(os.tmpdir(), "test-task-management-deploy"),
  requiredEnvironments: ["development", "staging", "production"],
  requiredStrategies: ["blue-green", "rolling", "recreate"],
  requiredDirectories: ["backups", "deployment-reports"],
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

class MockDeploymentEnvironment {
  constructor() {
    this.mockRoot = TEST_CONFIG.mockProjectRoot;
    this.originalCwd = process.cwd();
  }

  async setup() {
    TestLogger.test("Setting up mock deployment environment");

    // Create mock project structure
    if (fs.existsSync(this.mockRoot)) {
      await this.cleanup();
    }

    fs.mkdirSync(this.mockRoot, { recursive: true });

    // Create mock docker-compose files
    const composeFiles = [
      "docker-compose.dev.yml",
      "docker-compose.staging.yml",
      "docker-compose.yml",
    ];

    for (const file of composeFiles) {
      const composeContent = `
version: '3.8'
services:
  postgres:
    image: postgres:16.1-alpine
    container_name: task-management-postgres-${
      file.includes("dev")
        ? "dev"
        : file.includes("staging")
        ? "staging"
        : "prod"
    }
    environment:
      POSTGRES_DB: taskdb_${
        file.includes("dev")
          ? "dev"
          : file.includes("staging")
          ? "staging"
          : "prod"
      }
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "${
        file.includes("dev")
          ? "5432"
          : file.includes("staging")
          ? "5433"
          : "5434"
      }:5432"

  redis:
    image: redis:7.2-alpine
    container_name: task-management-redis-${
      file.includes("dev")
        ? "dev"
        : file.includes("staging")
        ? "staging"
        : "prod"
    }
    ports:
      - "${
        file.includes("dev")
          ? "6379"
          : file.includes("staging")
          ? "6380"
          : "6381"
      }:6379"

  backend:
    build: ./backend
    container_name: task-management-backend-${
      file.includes("dev")
        ? "dev"
        : file.includes("staging")
        ? "staging"
        : "prod"
    }
    ports:
      - "${
        file.includes("dev")
          ? "8000"
          : file.includes("staging")
          ? "8001"
          : "8002"
      }:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    container_name: task-management-frontend-${
      file.includes("dev")
        ? "dev"
        : file.includes("staging")
        ? "staging"
        : "prod"
    }
    ports:
      - "${
        file.includes("dev")
          ? "3000"
          : file.includes("staging")
          ? "3001"
          : "3002"
      }:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
`;

      fs.writeFileSync(path.join(this.mockRoot, file), composeContent);
    }

    // Create mock environment files
    const envFiles = [".env.dev", ".env.staging", ".env.production"];

    for (const file of envFiles) {
      const envContent = `
NODE_ENV=${
        file.includes("dev")
          ? "development"
          : file.includes("staging")
          ? "staging"
          : "production"
      }
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskdb_${
        file.includes("dev")
          ? "dev"
          : file.includes("staging")
          ? "staging"
          : "prod"
      }
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-secret-key
`;

      fs.writeFileSync(path.join(this.mockRoot, file), envContent);
    }

    // Create mock backend and frontend directories
    fs.mkdirSync(path.join(this.mockRoot, "backend"), { recursive: true });
    fs.mkdirSync(path.join(this.mockRoot, "frontend"), { recursive: true });

    // Create mock Dockerfiles
    fs.writeFileSync(
      path.join(this.mockRoot, "backend/Dockerfile"),
      'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nEXPOSE 8000\nCMD ["npm", "start"]'
    );

    fs.writeFileSync(
      path.join(this.mockRoot, "frontend/Dockerfile"),
      'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nEXPOSE 3000\nCMD ["npm", "start"]'
    );

    TestLogger.pass("Mock deployment environment created");
  }

  async cleanup() {
    TestLogger.test("Cleaning up mock deployment environment");

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

    TestLogger.pass("Mock deployment environment cleaned up");
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

    // Test requirements checking
    try {
      const checks = await SystemChecker.checkRequirements();
      if (Array.isArray(checks) && checks.length > 0) {
        TestLogger.pass(
          `Requirements check works: ${checks.length} checks performed`
        );
        passed++;
      } else {
        TestLogger.fail("Requirements check returned invalid result");
        failed++;
      }
    } catch (error) {
      TestLogger.fail(`Requirements check failed: ${error.message}`);
      failed++;
    }

    // Test Docker service check
    try {
      const dockerRunning = await SystemChecker.checkDockerService();
      if (typeof dockerRunning === "boolean") {
        TestLogger.pass(`Docker service check works: ${dockerRunning}`);
        passed++;
      } else {
        TestLogger.fail("Docker service check returned invalid result");
        failed++;
      }
    } catch (error) {
      TestLogger.fail(`Docker service check failed: ${error.message}`);
      failed++;
    }

    return { passed, failed };
  }
}

class DeploymentManagerTests {
  static async run() {
    TestLogger.test("Running DeploymentManager tests");

    let passed = 0;
    let failed = 0;

    const mockEnv = new MockDeploymentEnvironment();

    try {
      await mockEnv.setup();
      mockEnv.changeToMockRoot();

      // Test DeploymentManager initialization
      try {
        const deployer = new DeploymentManager({
          environment: "development",
          strategy: "rolling",
          dryRun: true,
        });

        if (
          deployer.platform &&
          deployer.projectRoot &&
          deployer.options &&
          deployer.deploymentId
        ) {
          TestLogger.pass("DeploymentManager initialization");
          passed++;
        } else {
          TestLogger.fail("DeploymentManager initialization failed");
          failed++;
        }
      } catch (error) {
        TestLogger.fail(
          `DeploymentManager initialization failed: ${error.message}`
        );
        failed++;
      }

      // Test deployment validation
      try {
        const deployer = new DeploymentManager({
          environment: "development",
          strategy: "rolling",
          dryRun: true,
        });

        await deployer.validateDeployment();
        TestLogger.pass("Deployment validation");
        passed++;
      } catch (error) {
        TestLogger.fail(`Deployment validation failed: ${error.message}`);
        failed++;
      }

      // Test deployment ID generation
      try {
        const deployer1 = new DeploymentManager();
        const deployer2 = new DeploymentManager();

        if (deployer1.deploymentId !== deployer2.deploymentId) {
          TestLogger.pass("Deployment ID generation is unique");
          passed++;
        } else {
          TestLogger.fail("Deployment ID generation not unique");
          failed++;
        }
      } catch (error) {
        TestLogger.fail(
          `Deployment ID generation test failed: ${error.message}`
        );
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
        "node scripts/cross-platform/deploy.js --help",
        {
          encoding: "utf8",
          stdio: "pipe",
        }
      );

      if (
        helpOutput.includes("Usage:") &&
        helpOutput.includes("Environments:")
      ) {
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
      execSync("node -c scripts/cross-platform/deploy.js", {
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
      const deployModule = require("./deploy.js");
      if (
        deployModule.DeploymentManager &&
        deployModule.SystemChecker &&
        deployModule.Logger
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
class DeploymentTestRunner {
  constructor() {
    this.totalPassed = 0;
    this.totalFailed = 0;
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log("\n" + "=".repeat(60));
    TestLogger.test("🧪 Cross-Platform Deployment Script Validation Suite");
    console.log("=".repeat(60));

    // Run SystemChecker tests
    console.log("\n📋 SystemChecker Tests");
    console.log("-".repeat(30));
    const systemResults = await SystemCheckerTests.run();
    this.totalPassed += systemResults.passed;
    this.totalFailed += systemResults.failed;

    // Run DeploymentManager tests
    console.log("\n📋 DeploymentManager Tests");
    console.log("-".repeat(30));
    const deploymentResults = await DeploymentManagerTests.run();
    this.totalPassed += deploymentResults.passed;
    this.totalFailed += deploymentResults.failed;

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
    TestLogger.test("📊 Deployment Test Results Summary");
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
      console.log("\n🎉 All deployment tests passed!");
    } else {
      console.log(`\n⚠️  ${this.totalFailed} deployment test(s) failed`);
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
Cross-Platform Deployment Script Validation Suite

Usage: node test-deploy.js [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Enable verbose logging

Examples:
  node test-deploy.js           # Run all validation tests
  node test-deploy.js --verbose # Run with verbose output
`);
    process.exit(0);
  }

  if (args.includes("--verbose") || args.includes("-v")) {
    process.env.VERBOSE = "true";
  }

  try {
    const runner = new DeploymentTestRunner();
    await runner.runAllTests();
  } catch (error) {
    TestLogger.fail(`Deployment test runner failed: ${error.message}`);

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

module.exports = {
  DeploymentTestRunner,
  MockDeploymentEnvironment,
  TestLogger,
};
