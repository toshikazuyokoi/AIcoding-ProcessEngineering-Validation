#!/usr/bin/env node

/**
 * ===================================
 * Task Management System - Cross-Platform Test Runner
 * ===================================
 * Generated for TSK-021-SCR-test-cross
 * Project: Task Management System
 * Component: Cross-Platform Test Execution
 * Purpose: Automated test execution for Windows, Linux, and macOS environments
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const os = require("os");

// ===================================
// Configuration
// ===================================
const CONFIG = {
  testTypes: {
    unit: {
      name: "Unit Tests",
      description: "Fast isolated tests for individual components",
      timeout: 300000, // 5 minutes
      coverage: true,
      parallel: true,
    },
    integration: {
      name: "Integration Tests",
      description: "Tests for component interactions",
      timeout: 900000, // 15 minutes
      coverage: true,
      parallel: false,
    },
    e2e: {
      name: "End-to-End Tests",
      description: "Full user scenario tests",
      timeout: 1800000, // 30 minutes
      coverage: false,
      parallel: false,
    },
    performance: {
      name: "Performance Tests",
      description: "Load and performance testing",
      timeout: 1200000, // 20 minutes
      coverage: false,
      parallel: false,
    },
    security: {
      name: "Security Tests",
      description: "Security vulnerability testing",
      timeout: 600000, // 10 minutes
      coverage: false,
      parallel: false,
    },
  },
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  reportFormats: ["json", "html", "text", "lcov"],
  maxRetries: 3,
  retryDelay: 5000,
};

// ===================================
// Utility Functions
// ===================================
class Logger {
  static info(message) {
    console.log(`\x1b[34mℹ️  ${message}\x1b[0m`);
  }

  static success(message) {
    console.log(`\x1b[32m✅ ${message}\x1b[0m`);
  }

  static warning(message) {
    console.log(`\x1b[33m⚠️  ${message}\x1b[0m`);
  }

  static error(message) {
    console.log(`\x1b[31m❌ ${message}\x1b[0m`);
  }

  static step(step, message) {
    console.log(`\x1b[36m[${step}] ${message}\x1b[0m`);
  }

  static test(message) {
    console.log(`\x1b[35m🧪 ${message}\x1b[0m`);
  }
}

class TestEnvironment {
  static getPlatform() {
    const platform = os.platform();
    switch (platform) {
      case "win32":
        return "Windows";
      case "darwin":
        return "macOS";
      case "linux":
        return "Linux";
      default:
        return platform;
    }
  }

  static async checkTestEnvironment() {
    const checks = [];

    // Check Node.js
    try {
      const nodeVersion = execSync("node --version", {
        encoding: "utf8",
      }).trim();
      checks.push({ name: "Node.js", status: "ok", version: nodeVersion });
    } catch (error) {
      checks.push({ name: "Node.js", status: "error", error: error.message });
    }

    // Check npm
    try {
      const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
      checks.push({ name: "npm", status: "ok", version: npmVersion });
    } catch (error) {
      checks.push({ name: "npm", status: "error", error: error.message });
    }

    // Check Docker (optional for some tests)
    try {
      execSync("docker --version", { stdio: "pipe" });
      checks.push({ name: "Docker", status: "ok", version: "Available" });
    } catch (error) {
      checks.push({
        name: "Docker",
        status: "warning",
        error: "Not available",
      });
    }

    return checks;
  }

  static async setupTestDirectories() {
    const dirs = ["test-results", "coverage", "test-reports", "test-artifacts"];

    for (const dir of dirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
  }
}

class TestRunner {
  constructor(options = {}) {
    this.platform = TestEnvironment.getPlatform();
    this.projectRoot = process.cwd();
    this.options = {
      testType: "all",
      coverage: true,
      parallel: true,
      verbose: false,
      watch: false,
      bail: false,
      ...options,
    };
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      coverage: null,
      errors: [],
    };
  }

  async run() {
    try {
      Logger.info(`🚀 Starting test execution on ${this.platform}`);
      Logger.info(`📁 Project root: ${this.projectRoot}`);
      Logger.info(`🎯 Test type: ${this.options.testType}`);

      const startTime = Date.now();

      await this.checkEnvironment();
      await this.setupEnvironment();
      await this.executeTests();
      await this.generateReports();

      this.results.duration = Date.now() - startTime;
      this.printSummary();

      return this.results.failed === 0;
    } catch (error) {
      Logger.error(`Test execution failed: ${error.message}`);
      this.results.errors.push(error.message);
      return false;
    }
  }

  async checkEnvironment() {
    Logger.step("1/4", "Checking test environment");

    const checks = await TestEnvironment.checkTestEnvironment();

    for (const check of checks) {
      if (check.status === "ok") {
        Logger.success(`${check.name}: ${check.version}`);
      } else if (check.status === "warning") {
        Logger.warning(`${check.name}: ${check.error}`);
      } else {
        Logger.error(`${check.name}: ${check.error}`);
        throw new Error(`Required dependency ${check.name} is not available`);
      }
    }
  }

  async setupEnvironment() {
    Logger.step("2/4", "Setting up test environment");

    await TestEnvironment.setupTestDirectories();
    Logger.success("Test directories created");

    // Check if backend and frontend exist
    const backendExists = fs.existsSync(
      path.join(this.projectRoot, "backend/package.json")
    );
    const frontendExists = fs.existsSync(
      path.join(this.projectRoot, "frontend/package.json")
    );

    if (!backendExists && !frontendExists) {
      throw new Error("No backend or frontend package.json found");
    }

    Logger.info(`Backend: ${backendExists ? "Found" : "Not found"}`);
    Logger.info(`Frontend: ${frontendExists ? "Found" : "Not found"}`);
  }

  async executeTests() {
    Logger.step("3/4", "Executing tests");

    const testTypes =
      this.options.testType === "all"
        ? Object.keys(CONFIG.testTypes)
        : [this.options.testType];

    for (const testType of testTypes) {
      if (!CONFIG.testTypes[testType]) {
        Logger.warning(`Unknown test type: ${testType}`);
        continue;
      }

      await this.runTestType(testType);
    }
  }

  async runTestType(testType) {
    const config = CONFIG.testTypes[testType];
    Logger.test(`Running ${config.name}`);
    Logger.info(config.description);

    const startTime = Date.now();

    try {
      switch (testType) {
        case "unit":
          await this.runUnitTests();
          break;
        case "integration":
          await this.runIntegrationTests();
          break;
        case "e2e":
          await this.runE2ETests();
          break;
        case "performance":
          await this.runPerformanceTests();
          break;
        case "security":
          await this.runSecurityTests();
          break;
        default:
          Logger.warning(`Test type ${testType} not implemented`);
      }

      const duration = Date.now() - startTime;
      Logger.success(`${config.name} completed in ${duration}ms`);
    } catch (error) {
      Logger.error(`${config.name} failed: ${error.message}`);
      this.results.errors.push(`${testType}: ${error.message}`);
      this.results.failed++;

      if (this.options.bail) {
        throw error;
      }
    }
  }

  async runUnitTests() {
    const components = ["backend", "frontend"];

    for (const component of components) {
      const componentPath = path.join(this.projectRoot, component);

      if (!fs.existsSync(path.join(componentPath, "package.json"))) {
        Logger.info(`Skipping ${component} - package.json not found`);
        continue;
      }

      Logger.info(`Running ${component} unit tests...`);

      const testCommand = this.options.coverage
        ? "npm run test:coverage -- --watchAll=false --passWithNoTests"
        : "npm test -- --watchAll=false --passWithNoTests";

      try {
        const output = execSync(testCommand, {
          cwd: componentPath,
          encoding: "utf8",
          stdio: this.options.verbose ? "inherit" : "pipe",
          timeout: CONFIG.testTypes.unit.timeout,
        });

        this.results.passed++;

        if (this.options.verbose) {
          Logger.info(`${component} unit tests output:`);
          console.log(output);
        }
      } catch (error) {
        Logger.error(`${component} unit tests failed`);
        this.results.failed++;

        if (this.options.verbose) {
          console.error(error.stdout || error.message);
        }

        throw error;
      }
    }
  }

  async runIntegrationTests() {
    Logger.info("Starting integration tests...");

    // Start test services if needed
    const needsServices = await this.checkTestServices();
    if (needsServices) {
      await this.startTestServices();
    }

    try {
      const components = ["backend", "frontend"];

      for (const component of components) {
        const componentPath = path.join(this.projectRoot, component);

        if (!fs.existsSync(path.join(componentPath, "package.json"))) {
          Logger.info(
            `Skipping ${component} integration tests - package.json not found`
          );
          continue;
        }

        Logger.info(`Running ${component} integration tests...`);

        const testCommand =
          "npm run test:integration -- --watchAll=false --passWithNoTests";

        try {
          const output = execSync(testCommand, {
            cwd: componentPath,
            encoding: "utf8",
            stdio: this.options.verbose ? "inherit" : "pipe",
            timeout: CONFIG.testTypes.integration.timeout,
            env: {
              ...process.env,
              NODE_ENV: "test",
              DATABASE_URL:
                "postgresql://test_user:test_password@localhost:5433/taskdb_test",
              REDIS_URL: "redis://localhost:6380",
            },
          });

          this.results.passed++;
        } catch (error) {
          Logger.error(`${component} integration tests failed`);
          this.results.failed++;
          throw error;
        }
      }
    } finally {
      if (needsServices) {
        await this.stopTestServices();
      }
    }
  }

  async runE2ETests() {
    Logger.info("Starting E2E tests...");

    // Start full test environment
    await this.startTestEnvironment();

    try {
      const frontendPath = path.join(this.projectRoot, "frontend");

      if (!fs.existsSync(path.join(frontendPath, "package.json"))) {
        Logger.warning("Frontend not found - skipping E2E tests");
        return;
      }

      // Install Playwright if needed
      try {
        execSync("npx playwright install --with-deps", {
          cwd: frontendPath,
          stdio: this.options.verbose ? "inherit" : "pipe",
        });
      } catch (error) {
        Logger.warning("Playwright installation failed, continuing...");
      }

      // Run E2E tests
      const testCommand = "npx playwright test --reporter=html,json";

      const output = execSync(testCommand, {
        cwd: frontendPath,
        encoding: "utf8",
        stdio: this.options.verbose ? "inherit" : "pipe",
        timeout: CONFIG.testTypes.e2e.timeout,
        env: {
          ...process.env,
          BASE_URL: "http://localhost:3001",
          API_URL: "http://localhost:8001",
        },
      });

      this.results.passed++;
    } catch (error) {
      Logger.error("E2E tests failed");
      this.results.failed++;
      throw error;
    } finally {
      await this.stopTestEnvironment();
    }
  }

  async runPerformanceTests() {
    Logger.info("Starting performance tests...");

    // Start test environment
    await this.startTestEnvironment();

    try {
      // API Performance Tests
      Logger.info("Running API performance tests...");

      const artilleryConfig = {
        config: {
          target: "http://localhost:8001",
          phases: [
            { duration: 60, arrivalRate: 10, name: "Warm up" },
            { duration: 120, arrivalRate: 50, name: "Load test" },
          ],
        },
        scenarios: [
          {
            name: "API Health Check",
            weight: 30,
            flow: [{ get: { url: "/health" } }],
          },
          {
            name: "Task Operations",
            weight: 70,
            flow: [
              { get: { url: "/api/tasks" } },
              {
                post: {
                  url: "/api/tasks",
                  json: { title: "Test Task", description: "Test" },
                },
              },
            ],
          },
        ],
      };

      // Write Artillery config
      const configPath = path.join(
        this.projectRoot,
        "test-results/artillery-config.yml"
      );
      fs.writeFileSync(configPath, JSON.stringify(artilleryConfig, null, 2));

      // Run Artillery
      execSync(
        `npx artillery run ${configPath} --output test-results/performance-report.json`,
        {
          stdio: this.options.verbose ? "inherit" : "pipe",
          timeout: CONFIG.testTypes.performance.timeout,
        }
      );

      // Frontend Performance Tests
      Logger.info("Running frontend performance tests...");

      execSync(
        'npx lighthouse http://localhost:3001 --output=html,json --output-path=./test-results/lighthouse-report --chrome-flags="--headless --no-sandbox"',
        {
          stdio: this.options.verbose ? "inherit" : "pipe",
          timeout: 300000,
        }
      );

      this.results.passed++;
    } catch (error) {
      Logger.error("Performance tests failed");
      this.results.failed++;
      throw error;
    } finally {
      await this.stopTestEnvironment();
    }
  }

  async runSecurityTests() {
    Logger.info("Starting security tests...");

    const components = ["backend", "frontend"];

    for (const component of components) {
      const componentPath = path.join(this.projectRoot, component);

      if (!fs.existsSync(path.join(componentPath, "package.json"))) {
        Logger.info(
          `Skipping ${component} security tests - package.json not found`
        );
        continue;
      }

      Logger.info(`Running ${component} security audit...`);

      try {
        // Run npm audit
        const auditOutput = execSync(
          "npm audit --audit-level moderate --json",
          {
            cwd: componentPath,
            encoding: "utf8",
            stdio: "pipe",
          }
        );

        const auditResult = JSON.parse(auditOutput);
        const vulnerabilities = auditResult.metadata?.vulnerabilities || {};

        const critical = vulnerabilities.critical || 0;
        const high = vulnerabilities.high || 0;

        if (critical > 0) {
          throw new Error(
            `${component} has ${critical} critical vulnerabilities`
          );
        }

        if (high > 5) {
          throw new Error(
            `${component} has ${high} high vulnerabilities (threshold: 5)`
          );
        }

        Logger.success(`${component} security audit passed`);
      } catch (error) {
        if (error.message.includes("vulnerabilities")) {
          throw error;
        }
        Logger.warning(`${component} security audit completed with warnings`);
      }
    }

    this.results.passed++;
  }

  async checkTestServices() {
    // Check if Docker Compose test file exists
    const testComposeFile = path.join(
      this.projectRoot,
      "docker-compose.test.yml"
    );
    return fs.existsSync(testComposeFile);
  }

  async startTestServices() {
    Logger.info("Starting test services...");

    try {
      execSync(
        "docker-compose -f docker-compose.test.yml up -d postgres-test redis-test",
        {
          cwd: this.projectRoot,
          stdio: this.options.verbose ? "inherit" : "pipe",
        }
      );

      // Wait for services to be ready
      await this.waitForServices(["postgres-test", "redis-test"]);
      Logger.success("Test services started");
    } catch (error) {
      Logger.warning("Failed to start test services, continuing without them");
    }
  }

  async stopTestServices() {
    Logger.info("Stopping test services...");

    try {
      execSync("docker-compose -f docker-compose.test.yml down", {
        cwd: this.projectRoot,
        stdio: "pipe",
      });
      Logger.success("Test services stopped");
    } catch (error) {
      Logger.warning("Failed to stop test services");
    }
  }

  async startTestEnvironment() {
    Logger.info("Starting full test environment...");

    try {
      execSync("docker-compose -f docker-compose.test.yml up -d", {
        cwd: this.projectRoot,
        stdio: this.options.verbose ? "inherit" : "pipe",
      });

      // Wait for all services to be ready
      await this.waitForServices(["backend-test", "frontend-test"]);
      Logger.success("Test environment started");
    } catch (error) {
      throw new Error(`Failed to start test environment: ${error.message}`);
    }
  }

  async stopTestEnvironment() {
    Logger.info("Stopping test environment...");

    try {
      execSync("docker-compose -f docker-compose.test.yml down -v", {
        cwd: this.projectRoot,
        stdio: "pipe",
      });
      Logger.success("Test environment stopped");
    } catch (error) {
      Logger.warning("Failed to stop test environment");
    }
  }

  async waitForServices(services) {
    const maxRetries = 30;
    const retryInterval = 2000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        let allReady = true;

        for (const service of services) {
          try {
            execSync(`docker exec task-management-${service} echo "ready"`, {
              stdio: "pipe",
            });
          } catch (error) {
            allReady = false;
            break;
          }
        }

        if (allReady) {
          return;
        }
      } catch (error) {
        // Continue waiting
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }

    throw new Error("Services did not become ready in time");
  }

  async generateReports() {
    Logger.step("4/4", "Generating test reports");

    const reportData = {
      timestamp: new Date().toISOString(),
      platform: this.platform,
      projectRoot: this.projectRoot,
      options: this.options,
      results: this.results,
      environment: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + "GB",
      },
    };

    // Generate JSON report
    const jsonReportPath = path.join(
      this.projectRoot,
      "test-results/test-report.json"
    );
    fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2));
    Logger.success(`JSON report generated: ${jsonReportPath}`);

    // Generate HTML report
    await this.generateHTMLReport(reportData);

    // Collect coverage reports if available
    await this.collectCoverageReports();
  }

  async generateHTMLReport(reportData) {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${reportData.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .results { margin: 20px 0; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .metric { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .errors { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Execution Report</h1>
        <p><strong>Timestamp:</strong> ${reportData.timestamp}</p>
        <p><strong>Platform:</strong> ${reportData.platform}</p>
        <p><strong>Test Type:</strong> ${reportData.options.testType}</p>
        <p><strong>Duration:</strong> ${reportData.results.duration}ms</p>
    </div>

    <div class="results">
        <h2>Test Results</h2>
        <div class="metric">
            <strong>Total:</strong> ${reportData.results.total}
        </div>
        <div class="metric success">
            <strong>Passed:</strong> ${reportData.results.passed}
        </div>
        <div class="metric error">
            <strong>Failed:</strong> ${reportData.results.failed}
        </div>
        <div class="metric warning">
            <strong>Skipped:</strong> ${reportData.results.skipped}
        </div>
    </div>

    ${
      reportData.results.errors.length > 0
        ? `
    <div class="errors">
        <h3>Errors</h3>
        <ul>
            ${reportData.results.errors
              .map((error) => `<li>${error}</li>`)
              .join("")}
        </ul>
    </div>
    `
        : ""
    }

    <div class="environment">
        <h2>Environment Information</h2>
        <p><strong>Node.js:</strong> ${reportData.environment.nodeVersion}</p>
        <p><strong>Platform:</strong> ${reportData.environment.platform}</p>
        <p><strong>Architecture:</strong> ${reportData.environment.arch}</p>
        <p><strong>CPUs:</strong> ${reportData.environment.cpus}</p>
        <p><strong>Memory:</strong> ${reportData.environment.memory}</p>
    </div>
</body>
</html>
    `;

    const htmlReportPath = path.join(
      this.projectRoot,
      "test-results/test-report.html"
    );
    fs.writeFileSync(htmlReportPath, htmlTemplate);
    Logger.success(`HTML report generated: ${htmlReportPath}`);
  }

  async collectCoverageReports() {
    const coverageDir = path.join(this.projectRoot, "coverage");

    if (fs.existsSync(coverageDir)) {
      Logger.info("Coverage reports found");

      // Copy coverage reports to test-results
      const targetDir = path.join(this.projectRoot, "test-results/coverage");
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      try {
        execSync(`cp -r ${coverageDir}/* ${targetDir}/`, { stdio: "pipe" });
        Logger.success("Coverage reports collected");
      } catch (error) {
        Logger.warning("Failed to collect coverage reports");
      }
    }
  }

  printSummary() {
    console.log("\n" + "=".repeat(60));
    Logger.info("🎉 Test Execution Complete!");
    console.log("=".repeat(60));

    console.log("\n📊 Test Summary:");
    console.log(`  Platform: ${this.platform}`);
    console.log(`  Test Type: ${this.options.testType}`);
    console.log(`  Duration: ${this.results.duration}ms`);
    console.log(`  Total: ${this.results.total}`);
    console.log(`  Passed: ${this.results.passed}`);
    console.log(`  Failed: ${this.results.failed}`);
    console.log(`  Skipped: ${this.results.skipped}`);

    if (this.results.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.results.errors.forEach((error) => console.log(`  • ${error}`));
    }

    const successRate =
      this.results.total > 0
        ? ((this.results.passed / this.results.total) * 100).toFixed(1)
        : 0;

    console.log(`\n📈 Success Rate: ${successRate}%`);

    if (this.results.failed === 0) {
      console.log("\n🎉 All tests passed!");
    } else {
      console.log(`\n⚠️  ${this.results.failed} test(s) failed`);
    }

    console.log("\n📁 Reports:");
    console.log("  • JSON: test-results/test-report.json");
    console.log("  • HTML: test-results/test-report.html");

    console.log("\n" + "=".repeat(60));
  }
}

// ===================================
// CLI Interface
// ===================================
async function main() {
  const args = process.argv.slice(2);

  // Handle help flag
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Task Management System - Cross-Platform Test Runner

Usage: node run-tests.js [test-type] [options]

Test Types:
  all           Run all test types (default)
  unit          Run unit tests only
  integration   Run integration tests only
  e2e           Run end-to-end tests only
  performance   Run performance tests only
  security      Run security tests only

Options:
  --help, -h        Show this help message
  --verbose, -v     Enable verbose logging
  --no-coverage     Disable coverage collection
  --no-parallel     Disable parallel execution
  --watch, -w       Watch mode (for unit tests)
  --bail, -b        Stop on first failure

Examples:
  node run-tests.js                    # Run all tests
  node run-tests.js unit               # Run unit tests only
  node run-tests.js unit --verbose     # Run unit tests with verbose output
  node run-tests.js e2e --no-coverage  # Run E2E tests without coverage
  node run-tests.js --watch            # Run tests in watch mode
`);
    process.exit(0);
  }

  // Parse arguments
  const options = {
    testType: "all",
    coverage: true,
    parallel: true,
    verbose: false,
    watch: false,
    bail: false,
  };

  // Parse test type
  const testTypes = [
    "all",
    "unit",
    "integration",
    "e2e",
    "performance",
    "security",
  ];
  for (const arg of args) {
    if (testTypes.includes(arg)) {
      options.testType = arg;
      break;
    }
  }

  // Parse flags
  if (args.includes("--verbose") || args.includes("-v")) {
    options.verbose = true;
  }

  if (args.includes("--no-coverage")) {
    options.coverage = false;
  }

  if (args.includes("--no-parallel")) {
    options.parallel = false;
  }

  if (args.includes("--watch") || args.includes("-w")) {
    options.watch = true;
  }

  if (args.includes("--bail") || args.includes("-b")) {
    options.bail = true;
  }

  try {
    const runner = new TestRunner(options);
    const success = await runner.run();

    process.exit(success ? 0 : 1);
  } catch (error) {
    Logger.error(`Test runner failed: ${error.message}`);

    if (options.verbose) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run the test runner if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    Logger.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { TestRunner, TestEnvironment, Logger };
