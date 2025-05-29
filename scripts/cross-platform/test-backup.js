#!/usr/bin/env node

/**
 * ===================================
 * Task Management System - Backup Script Validation
 * ===================================
 * Generated for TSK-023-SCR-backup-cross
 * Project: Task Management System
 * Component: Cross-Platform Backup Testing
 * Purpose: Test and validate the cross-platform backup script
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

// Import the backup modules
const { BackupManager, SystemChecker, Logger } = require("./backup.js");

// ===================================
// Test Configuration
// ===================================
const TEST_CONFIG = {
  testTimeout: 60000,
  mockProjectRoot: path.join(os.tmpdir(), "test-task-management-backup"),
  requiredEnvironments: ["development", "staging", "production"],
  requiredBackupTypes: ["full", "incremental", "differential"],
  requiredDirectories: [
    "backups",
    "database",
    "redis",
    "config",
    "files",
    "logs",
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

class MockBackupEnvironment {
  constructor() {
    this.mockRoot = TEST_CONFIG.mockProjectRoot;
    this.originalCwd = process.cwd();
  }

  async setup() {
    TestLogger.test("Setting up mock backup environment");

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
`;

      fs.writeFileSync(path.join(this.mockRoot, file), composeContent);
    }

    // Create mock environment files
    const envFiles = [
      ".env",
      ".env.development",
      ".env.staging",
      ".env.production",
    ];

    for (const file of envFiles) {
      const envContent = `
NODE_ENV=${
        file.includes("development")
          ? "development"
          : file.includes("staging")
          ? "staging"
          : "production"
      }
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskdb
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-secret-key
BACKUP_PASSWORD=test-backup-password
`;

      fs.writeFileSync(path.join(this.mockRoot, file), envContent);
    }

    // Create mock package.json
    const packageJson = {
      name: "task-management-system",
      version: "1.0.0",
      description: "Task Management System",
      scripts: {
        start: "node server.js",
        test: "jest",
      },
      dependencies: {
        express: "^4.18.0",
        pg: "^8.8.0",
        redis: "^4.5.0",
      },
    };

    fs.writeFileSync(
      path.join(this.mockRoot, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Create mock directories
    const mockDirs = ["logs", "uploads", "config"];
    for (const dir of mockDirs) {
      fs.mkdirSync(path.join(this.mockRoot, dir), { recursive: true });

      // Create some mock files
      fs.writeFileSync(
        path.join(this.mockRoot, dir, "test-file.txt"),
        "This is a test file for backup validation"
      );
    }

    TestLogger.pass("Mock backup environment created");
  }

  async cleanup() {
    TestLogger.test("Cleaning up mock backup environment");

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

    TestLogger.pass("Mock backup environment cleaned up");
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

    // Test disk space checking
    try {
      const freeSpace = SystemChecker.getAvailableSpace();
      if (typeof freeSpace === "string") {
        TestLogger.pass(`Disk space check works: ${freeSpace}`);
        passed++;
      } else {
        TestLogger.fail("Disk space check returned invalid result");
        failed++;
      }
    } catch (error) {
      TestLogger.fail(`Disk space check failed: ${error.message}`);
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

class BackupManagerTests {
  static async run() {
    TestLogger.test("Running BackupManager tests");

    let passed = 0;
    let failed = 0;

    const mockEnv = new MockBackupEnvironment();

    try {
      await mockEnv.setup();
      mockEnv.changeToMockRoot();

      // Test BackupManager initialization
      try {
        const backupManager = new BackupManager({
          environment: "development",
          backupType: "full",
          dryRun: true,
        });

        if (
          backupManager.platform &&
          backupManager.projectRoot &&
          backupManager.options &&
          backupManager.backupId
        ) {
          TestLogger.pass("BackupManager initialization");
          passed++;
        } else {
          TestLogger.fail("BackupManager initialization failed");
          failed++;
        }
      } catch (error) {
        TestLogger.fail(
          `BackupManager initialization failed: ${error.message}`
        );
        failed++;
      }

      // Test backup configuration validation
      try {
        const backupManager = new BackupManager({
          environment: "development",
          backupType: "full",
          dryRun: true,
        });

        await backupManager.validateBackupConfiguration();
        TestLogger.pass("Backup configuration validation");
        passed++;
      } catch (error) {
        TestLogger.fail(
          `Backup configuration validation failed: ${error.message}`
        );
        failed++;
      }

      // Test backup ID generation
      try {
        const backupManager1 = new BackupManager();
        const backupManager2 = new BackupManager();

        if (backupManager1.backupId !== backupManager2.backupId) {
          TestLogger.pass("Backup ID generation is unique");
          passed++;
        } else {
          TestLogger.fail("Backup ID generation not unique");
          failed++;
        }
      } catch (error) {
        TestLogger.fail(`Backup ID generation test failed: ${error.message}`);
        failed++;
      }

      // Test checksum generation
      try {
        const backupManager = new BackupManager();
        const testFile = path.join(mockEnv.mockRoot, "test-checksum.txt");
        fs.writeFileSync(testFile, "test content for checksum");

        const checksum = backupManager.generateChecksum(testFile);
        if (typeof checksum === "string" && checksum.length === 64) {
          TestLogger.pass("Checksum generation works");
          passed++;
        } else {
          TestLogger.fail("Checksum generation failed");
          failed++;
        }
      } catch (error) {
        TestLogger.fail(`Checksum generation test failed: ${error.message}`);
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
        "node scripts/cross-platform/backup.js --help",
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
      execSync("node -c scripts/cross-platform/backup.js", {
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
      const backupModule = require("./backup.js");
      if (
        backupModule.BackupManager &&
        backupModule.SystemChecker &&
        backupModule.Logger
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
class BackupTestRunner {
  constructor() {
    this.totalPassed = 0;
    this.totalFailed = 0;
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log("\n" + "=".repeat(60));
    TestLogger.test("🧪 Cross-Platform Backup Script Validation Suite");
    console.log("=".repeat(60));

    // Run SystemChecker tests
    console.log("\n📋 SystemChecker Tests");
    console.log("-".repeat(30));
    const systemResults = await SystemCheckerTests.run();
    this.totalPassed += systemResults.passed;
    this.totalFailed += systemResults.failed;

    // Run BackupManager tests
    console.log("\n📋 BackupManager Tests");
    console.log("-".repeat(30));
    const backupResults = await BackupManagerTests.run();
    this.totalPassed += backupResults.passed;
    this.totalFailed += backupResults.failed;

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
    TestLogger.test("📊 Backup Test Results Summary");
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
      console.log("\n🎉 All backup tests passed!");
    } else {
      console.log(`\n⚠️  ${this.totalFailed} backup test(s) failed`);
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
Cross-Platform Backup Script Validation Suite

Usage: node test-backup.js [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Enable verbose logging

Examples:
  node test-backup.js           # Run all validation tests
  node test-backup.js --verbose # Run with verbose output
`);
    process.exit(0);
  }

  if (args.includes("--verbose") || args.includes("-v")) {
    process.env.VERBOSE = "true";
  }

  try {
    const runner = new BackupTestRunner();
    await runner.runAllTests();
  } catch (error) {
    TestLogger.fail(`Backup test runner failed: ${error.message}`);

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

module.exports = { BackupTestRunner, MockBackupEnvironment, TestLogger };
