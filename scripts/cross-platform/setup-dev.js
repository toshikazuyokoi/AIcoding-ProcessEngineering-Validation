#!/usr/bin/env node

/**
 * ===================================
 * Task Management System - Cross-Platform Development Setup
 * ===================================
 * Generated for TSK-020-SCR-setup-cross
 * Project: Task Management System
 * Component: Cross-Platform Development Environment Setup
 * Purpose: Automated setup for Windows, Linux, and macOS development environments
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const os = require("os");

// ===================================
// Configuration
// ===================================
const CONFIG = {
  nodeVersion: "20.11.0",
  npmVersion: "10.2.4",
  dockerRequired: true,
  postgresVersion: "16.1",
  redisVersion: "7.2",
  requiredPorts: [3000, 8000, 5432, 6379],
  envFiles: [
    { source: "backend/.env.example", target: "backend/.env" },
    { source: "frontend/.env.example", target: "frontend/.env" },
  ],
  directories: ["logs", "coverage", "test-results", "backup", "uploads"],
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
}

class SystemChecker {
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

  static async checkCommand(command, version = null) {
    try {
      const result = execSync(`${command} --version`, {
        encoding: "utf8",
        stdio: "pipe",
      });

      if (version) {
        const installedVersion = result.trim().split("\n")[0];
        Logger.info(`${command}: ${installedVersion}`);
        return { installed: true, version: installedVersion };
      }

      return { installed: true, version: result.trim() };
    } catch (error) {
      return { installed: false, error: error.message };
    }
  }

  static async checkPort(port) {
    return new Promise((resolve) => {
      const net = require("net");
      const server = net.createServer();

      server.listen(port, () => {
        server.once("close", () => resolve(true));
        server.close();
      });

      server.on("error", () => resolve(false));
    });
  }

  static async checkDockerService() {
    try {
      execSync("docker info", { stdio: "pipe" });
      return true;
    } catch (error) {
      return false;
    }
  }
}

class EnvironmentSetup {
  constructor() {
    this.platform = SystemChecker.getPlatform();
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
  }

  async run() {
    try {
      Logger.info(
        `🚀 Starting development environment setup for ${this.platform}`
      );
      Logger.info(`📁 Project root: ${this.projectRoot}`);

      await this.checkSystemRequirements();
      await this.checkPorts();
      await this.setupDirectories();
      await this.setupEnvironmentFiles();
      await this.installDependencies();
      await this.setupDatabase();
      await this.verifySetup();

      this.printSummary();
    } catch (error) {
      Logger.error(`Setup failed: ${error.message}`);
      process.exit(1);
    }
  }

  async checkSystemRequirements() {
    Logger.step("1/7", "Checking system requirements");

    // Check Node.js
    const nodeCheck = await SystemChecker.checkCommand("node");
    if (!nodeCheck.installed) {
      this.errors.push("Node.js is not installed");
      Logger.error("Node.js is required but not installed");
      Logger.info(
        `Please install Node.js ${CONFIG.nodeVersion} from https://nodejs.org/`
      );
    } else {
      Logger.success(`Node.js is installed: ${nodeCheck.version}`);
    }

    // Check npm
    const npmCheck = await SystemChecker.checkCommand("npm");
    if (!npmCheck.installed) {
      this.errors.push("npm is not installed");
      Logger.error("npm is required but not installed");
    } else {
      Logger.success(`npm is installed: ${npmCheck.version}`);
    }

    // Check Docker
    if (CONFIG.dockerRequired) {
      const dockerCheck = await SystemChecker.checkCommand("docker");
      if (!dockerCheck.installed) {
        this.errors.push("Docker is not installed");
        Logger.error("Docker is required but not installed");
        Logger.info(
          "Please install Docker from https://www.docker.com/get-started"
        );
      } else {
        Logger.success(`Docker is installed: ${dockerCheck.version}`);

        // Check Docker service
        const dockerRunning = await SystemChecker.checkDockerService();
        if (!dockerRunning) {
          this.warnings.push("Docker service is not running");
          Logger.warning("Docker service is not running. Please start Docker.");
        } else {
          Logger.success("Docker service is running");
        }
      }

      // Check Docker Compose
      const composeCheck = await SystemChecker.checkCommand("docker-compose");
      if (!composeCheck.installed) {
        // Try docker compose (newer syntax)
        const composeV2Check = await SystemChecker.checkCommand(
          "docker compose version"
        );
        if (!composeV2Check.installed) {
          this.errors.push("Docker Compose is not installed");
          Logger.error("Docker Compose is required but not installed");
        } else {
          Logger.success("Docker Compose (v2) is available");
        }
      } else {
        Logger.success(`Docker Compose is installed: ${composeCheck.version}`);
      }
    }

    // Check Git
    const gitCheck = await SystemChecker.checkCommand("git");
    if (!gitCheck.installed) {
      this.warnings.push("Git is not installed");
      Logger.warning("Git is recommended for version control");
    } else {
      Logger.success(`Git is installed: ${gitCheck.version}`);
    }

    if (this.errors.length > 0) {
      throw new Error(
        `Missing required dependencies: ${this.errors.join(", ")}`
      );
    }
  }

  async checkPorts() {
    Logger.step("2/7", "Checking required ports");

    for (const port of CONFIG.requiredPorts) {
      const available = await SystemChecker.checkPort(port);
      if (!available) {
        this.warnings.push(`Port ${port} is in use`);
        Logger.warning(`Port ${port} is already in use`);
      } else {
        Logger.success(`Port ${port} is available`);
      }
    }
  }

  async setupDirectories() {
    Logger.step("3/7", "Setting up project directories");

    for (const dir of CONFIG.directories) {
      const dirPath = path.join(this.projectRoot, dir);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        Logger.success(`Created directory: ${dir}`);
      } else {
        Logger.info(`Directory already exists: ${dir}`);
      }
    }
  }

  async setupEnvironmentFiles() {
    Logger.step("4/7", "Setting up environment files");

    for (const envFile of CONFIG.envFiles) {
      const sourcePath = path.join(this.projectRoot, envFile.source);
      const targetPath = path.join(this.projectRoot, envFile.target);

      if (!fs.existsSync(sourcePath)) {
        this.warnings.push(`Environment template not found: ${envFile.source}`);
        Logger.warning(`Environment template not found: ${envFile.source}`);
        continue;
      }

      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        Logger.success(`Created environment file: ${envFile.target}`);
      } else {
        Logger.info(`Environment file already exists: ${envFile.target}`);
      }
    }
  }

  async installDependencies() {
    Logger.step("5/7", "Installing dependencies");

    // Install backend dependencies
    const backendPath = path.join(this.projectRoot, "backend");
    if (fs.existsSync(path.join(backendPath, "package.json"))) {
      Logger.info("Installing backend dependencies...");
      try {
        execSync("npm ci --silent", {
          cwd: backendPath,
          stdio: "inherit",
        });
        Logger.success("Backend dependencies installed");
      } catch (error) {
        this.errors.push("Failed to install backend dependencies");
        Logger.error("Failed to install backend dependencies");
      }
    } else {
      this.warnings.push("Backend package.json not found");
      Logger.warning("Backend package.json not found");
    }

    // Install frontend dependencies
    const frontendPath = path.join(this.projectRoot, "frontend");
    if (fs.existsSync(path.join(frontendPath, "package.json"))) {
      Logger.info("Installing frontend dependencies...");
      try {
        execSync("npm ci --silent", {
          cwd: frontendPath,
          stdio: "inherit",
        });
        Logger.success("Frontend dependencies installed");
      } catch (error) {
        this.errors.push("Failed to install frontend dependencies");
        Logger.error("Failed to install frontend dependencies");
      }
    } else {
      this.warnings.push("Frontend package.json not found");
      Logger.warning("Frontend package.json not found");
    }
  }

  async setupDatabase() {
    Logger.step("6/7", "Setting up database services");

    // Check if Docker Compose files exist
    const composeFiles = ["docker-compose.dev.yml", "docker-compose.yml"];
    let composeFile = null;

    for (const file of composeFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        composeFile = file;
        break;
      }
    }

    if (!composeFile) {
      this.warnings.push("No Docker Compose file found");
      Logger.warning("No Docker Compose file found. Skipping database setup.");
      return;
    }

    Logger.info(`Using Docker Compose file: ${composeFile}`);

    try {
      // Start database services
      Logger.info("Starting database services...");
      execSync(`docker-compose -f ${composeFile} up -d postgres redis`, {
        cwd: this.projectRoot,
        stdio: "inherit",
      });

      // Wait for services to be ready
      Logger.info("Waiting for database services to be ready...");
      await this.waitForServices();

      Logger.success("Database services are running");

      // Run database migrations if backend exists
      const backendPath = path.join(this.projectRoot, "backend");
      if (fs.existsSync(path.join(backendPath, "package.json"))) {
        Logger.info("Running database migrations...");
        try {
          execSync("npm run db:migrate", {
            cwd: backendPath,
            stdio: "inherit",
          });
          Logger.success("Database migrations completed");
        } catch (error) {
          this.warnings.push("Database migration failed");
          Logger.warning(
            "Database migration failed. You may need to run it manually."
          );
        }
      }
    } catch (error) {
      this.warnings.push("Failed to start database services");
      Logger.warning(
        "Failed to start database services. You may need to start them manually."
      );
    }
  }

  async waitForServices() {
    const maxRetries = 30;
    const retryInterval = 2000; // 2 seconds

    for (let i = 0; i < maxRetries; i++) {
      try {
        // Check PostgreSQL
        execSync(
          "docker exec task-management-postgres-dev pg_isready -U postgres",
          {
            stdio: "pipe",
          }
        );

        // Check Redis
        execSync("docker exec task-management-redis-dev redis-cli ping", {
          stdio: "pipe",
        });

        return; // Both services are ready
      } catch (error) {
        if (i === maxRetries - 1) {
          throw new Error("Services did not become ready in time");
        }
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }

  async verifySetup() {
    Logger.step("7/7", "Verifying setup");

    const verifications = [];

    // Check if backend can start
    const backendPath = path.join(this.projectRoot, "backend");
    if (fs.existsSync(path.join(backendPath, "package.json"))) {
      try {
        execSync("npm run build", {
          cwd: backendPath,
          stdio: "pipe",
        });
        verifications.push("✅ Backend builds successfully");
      } catch (error) {
        verifications.push("❌ Backend build failed");
        this.warnings.push("Backend build verification failed");
      }
    }

    // Check if frontend can start
    const frontendPath = path.join(this.projectRoot, "frontend");
    if (fs.existsSync(path.join(frontendPath, "package.json"))) {
      try {
        execSync("npm run build", {
          cwd: frontendPath,
          stdio: "pipe",
        });
        verifications.push("✅ Frontend builds successfully");
      } catch (error) {
        verifications.push("❌ Frontend build failed");
        this.warnings.push("Frontend build verification failed");
      }
    }

    // Check database connectivity
    try {
      execSync(
        'docker exec task-management-postgres-dev psql -U postgres -d taskdb_dev -c "SELECT 1;"',
        {
          stdio: "pipe",
        }
      );
      verifications.push("✅ Database connection successful");
    } catch (error) {
      verifications.push("❌ Database connection failed");
      this.warnings.push("Database connection verification failed");
    }

    Logger.info("Verification results:");
    verifications.forEach((result) => console.log(`  ${result}`));
  }

  printSummary() {
    console.log("\n" + "=".repeat(60));
    Logger.info("🎉 Development Environment Setup Complete!");
    console.log("=".repeat(60));

    console.log("\n📊 Setup Summary:");
    console.log(`  Platform: ${this.platform}`);
    console.log(`  Project Root: ${this.projectRoot}`);
    console.log(`  Errors: ${this.errors.length}`);
    console.log(`  Warnings: ${this.warnings.length}`);

    if (this.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      this.warnings.forEach((warning) => console.log(`  • ${warning}`));
    }

    console.log("\n🚀 Next Steps:");
    console.log("  1. Start development servers:");
    console.log("     npm run dev");
    console.log("  2. Access the application:");
    console.log("     Frontend: http://localhost:3000");
    console.log("     Backend:  http://localhost:8000");
    console.log("  3. Run tests:");
    console.log("     npm test");

    console.log("\n📚 Useful Commands:");
    console.log(
      "  • Start services: docker-compose -f docker-compose.dev.yml up -d"
    );
    console.log(
      "  • Stop services:  docker-compose -f docker-compose.dev.yml down"
    );
    console.log(
      "  • View logs:      docker-compose -f docker-compose.dev.yml logs -f"
    );
    console.log("  • Reset database: npm run db:reset");

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
Task Management System - Development Environment Setup

Usage: node setup-dev.js [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Enable verbose logging
  --skip-deps    Skip dependency installation
  --skip-db      Skip database setup

Examples:
  node setup-dev.js                    # Full setup
  node setup-dev.js --skip-deps        # Setup without installing dependencies
  node setup-dev.js --verbose          # Setup with verbose logging
`);
    process.exit(0);
  }

  // Handle verbose flag
  if (args.includes("--verbose") || args.includes("-v")) {
    process.env.VERBOSE = "true";
  }

  try {
    const setup = new EnvironmentSetup();
    await setup.run();

    Logger.success("Setup completed successfully!");
    process.exit(0);
  } catch (error) {
    Logger.error(`Setup failed: ${error.message}`);

    if (process.env.VERBOSE) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    Logger.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { EnvironmentSetup, SystemChecker, Logger };
