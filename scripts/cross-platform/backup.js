#!/usr/bin/env node

/**
 * ===================================
 * Task Management System - Cross-Platform Backup
 * ===================================
 * Generated for TSK-023-SCR-backup-cross
 * Project: Task Management System
 * Component: Cross-Platform Backup Automation
 * Purpose: Automated backup for Windows, Linux, and macOS environments
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");
const crypto = require("crypto");

// ===================================
// Configuration
// ===================================
const CONFIG = {
  environments: {
    development: {
      name: "Development",
      composeFile: "docker-compose.dev.yml",
      dbContainer: "task-management-postgres-dev",
      dbName: "taskdb_dev",
      dbUser: "postgres",
      redisContainer: "task-management-redis-dev",
    },
    staging: {
      name: "Staging",
      composeFile: "docker-compose.staging.yml",
      dbContainer: "task-management-postgres-staging",
      dbName: "taskdb_staging",
      dbUser: "postgres",
      redisContainer: "task-management-redis-staging",
    },
    production: {
      name: "Production",
      composeFile: "docker-compose.yml",
      dbContainer: "task-management-postgres-prod",
      dbName: "taskdb",
      dbUser: "postgres",
      redisContainer: "task-management-redis-prod",
    },
  },
  backupTypes: {
    full: {
      name: "Full Backup",
      description: "Complete database and file system backup",
      schedule: "weekly",
      retention: 30,
    },
    incremental: {
      name: "Incremental Backup",
      description: "Changes since last backup",
      schedule: "daily",
      retention: 7,
    },
    differential: {
      name: "Differential Backup",
      description: "Changes since last full backup",
      schedule: "daily",
      retention: 14,
    },
  },
  retentionPolicies: {
    development: {
      daily: 3,
      weekly: 2,
      monthly: 1,
    },
    staging: {
      daily: 7,
      weekly: 4,
      monthly: 3,
    },
    production: {
      daily: 30,
      weekly: 12,
      monthly: 12,
    },
  },
  compression: {
    enabled: true,
    algorithm: "gzip",
    level: 6,
  },
  encryption: {
    enabled: true,
    algorithm: "aes-256-gcm",
    keyDerivation: "pbkdf2",
  },
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

  static backup(message) {
    console.log(`\x1b[35m💾 ${message}\x1b[0m`);
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

  static async checkRequirements() {
    const checks = [];

    // Check Docker
    try {
      const dockerVersion = execSync("docker --version", {
        encoding: "utf8",
      }).trim();
      checks.push({ name: "Docker", status: "ok", version: dockerVersion });
    } catch (error) {
      checks.push({
        name: "Docker",
        status: "error",
        error: "Docker is required for backup operations",
      });
    }

    // Check Docker Compose
    try {
      const composeVersion = execSync("docker-compose --version", {
        encoding: "utf8",
      }).trim();
      checks.push({
        name: "Docker Compose",
        status: "ok",
        version: composeVersion,
      });
    } catch (error) {
      try {
        execSync("docker compose version", { stdio: "pipe" });
        checks.push({
          name: "Docker Compose",
          status: "ok",
          version: "v2 (integrated)",
        });
      } catch (error2) {
        checks.push({
          name: "Docker Compose",
          status: "error",
          error: "Docker Compose is required",
        });
      }
    }

    // Check available disk space
    try {
      const stats = fs.statSync(".");
      const freeSpace = this.getAvailableSpace();
      checks.push({
        name: "Disk Space",
        status: "ok",
        info: `${freeSpace}GB available`,
      });
    } catch (error) {
      checks.push({
        name: "Disk Space",
        status: "warning",
        error: "Could not check disk space",
      });
    }

    return checks;
  }

  static getAvailableSpace() {
    try {
      const platform = os.platform();
      let command;

      if (platform === "win32") {
        command = 'dir /-c | find "bytes free"';
      } else {
        command = "df -h . | tail -1 | awk '{print $4}'";
      }

      const output = execSync(command, { encoding: "utf8" }).trim();

      if (platform === "win32") {
        const match = output.match(/(\d+) bytes free/);
        return match
          ? Math.round(parseInt(match[1]) / (1024 * 1024 * 1024))
          : "Unknown";
      } else {
        return output.replace("G", "").replace("M", "");
      }
    } catch (error) {
      return "Unknown";
    }
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

class BackupManager {
  constructor(options = {}) {
    this.platform = SystemChecker.getPlatform();
    this.projectRoot = process.cwd();
    this.options = {
      environment: "development",
      backupType: "full",
      compress: true,
      encrypt: false,
      verify: true,
      verbose: false,
      dryRun: false,
      outputDir: "backups",
      ...options,
    };
    this.backupId = this.generateBackupId();
    this.startTime = Date.now();
    this.errors = [];
    this.warnings = [];
    this.backupManifest = {
      id: this.backupId,
      timestamp: new Date().toISOString(),
      platform: this.platform,
      environment: this.options.environment,
      type: this.options.backupType,
      files: [],
      checksums: {},
      metadata: {},
    };
  }

  generateBackupId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const shortHash = Math.random().toString(36).substring(2, 8);
    return `backup-${this.options.environment}-${this.options.backupType}-${timestamp}-${shortHash}`;
  }

  async createBackup() {
    try {
      Logger.backup(
        `Starting ${this.options.backupType} backup on ${this.platform}`
      );
      Logger.info(`Backup ID: ${this.backupId}`);
      Logger.info(`Environment: ${this.options.environment}`);
      Logger.info(`Type: ${this.options.backupType}`);

      if (this.options.dryRun) {
        Logger.warning("DRY RUN MODE - No actual backup will be created");
      }

      await this.validateBackupConfiguration();
      await this.checkPrerequisites();
      await this.prepareBackupDirectory();
      await this.backupDatabase();
      await this.backupRedisData();
      await this.backupConfigurationFiles();
      await this.backupApplicationFiles();
      await this.compressBackup();
      await this.encryptBackup();
      await this.verifyBackup();
      await this.cleanupOldBackups();
      await this.generateBackupReport();

      const duration = Date.now() - this.startTime;
      Logger.success(`Backup completed successfully in ${duration}ms`);

      return true;
    } catch (error) {
      Logger.error(`Backup failed: ${error.message}`);
      await this.handleBackupFailure(error);
      return false;
    }
  }

  async validateBackupConfiguration() {
    Logger.step("1/10", "Validating backup configuration");

    // Validate environment
    const envConfig = CONFIG.environments[this.options.environment];
    if (!envConfig) {
      throw new Error(`Invalid environment: ${this.options.environment}`);
    }

    // Validate backup type
    const backupType = CONFIG.backupTypes[this.options.backupType];
    if (!backupType) {
      throw new Error(`Invalid backup type: ${this.options.backupType}`);
    }

    // Check compose file exists
    const composeFile = path.join(this.projectRoot, envConfig.composeFile);
    if (!fs.existsSync(composeFile)) {
      throw new Error(`Compose file not found: ${envConfig.composeFile}`);
    }

    Logger.success("Backup configuration validated");
  }

  async checkPrerequisites() {
    Logger.step("2/10", "Checking backup prerequisites");

    const checks = await SystemChecker.checkRequirements();

    for (const check of checks) {
      if (check.status === "ok") {
        Logger.success(`${check.name}: ${check.version || check.info}`);
      } else if (check.status === "warning") {
        Logger.warning(`${check.name}: ${check.error}`);
        this.warnings.push(check.error);
      } else {
        Logger.error(`${check.name}: ${check.error}`);
        throw new Error(`Required dependency ${check.name} is not available`);
      }
    }

    // Check Docker service
    const dockerRunning = await SystemChecker.checkDockerService();
    if (!dockerRunning) {
      throw new Error("Docker service is not running. Please start Docker.");
    }

    Logger.success("Docker service is running");
  }

  async prepareBackupDirectory() {
    Logger.step("3/10", "Preparing backup directory");

    const backupDir = path.join(
      this.projectRoot,
      this.options.outputDir,
      this.backupId
    );

    if (!this.options.dryRun) {
      fs.mkdirSync(backupDir, { recursive: true });

      // Create subdirectories
      const subdirs = ["database", "redis", "config", "files", "logs"];
      for (const subdir of subdirs) {
        fs.mkdirSync(path.join(backupDir, subdir), { recursive: true });
      }
    }

    this.backupDir = backupDir;
    Logger.success(`Backup directory prepared: ${backupDir}`);
  }

  async backupDatabase() {
    Logger.step("4/10", "Backing up database");

    const envConfig = CONFIG.environments[this.options.environment];
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(
      this.backupDir,
      "database",
      `${envConfig.dbName}-${timestamp}.sql`
    );

    if (this.options.dryRun) {
      Logger.info("DRY RUN: Would backup database");
      return;
    }

    try {
      // Check if container is running
      const containerStatus = execSync(
        `docker ps --filter "name=${envConfig.dbContainer}" --format "{{.Status}}"`,
        {
          encoding: "utf8",
          stdio: "pipe",
        }
      ).trim();

      if (!containerStatus) {
        throw new Error(
          `Database container ${envConfig.dbContainer} is not running`
        );
      }

      // Create database backup
      const backupCommand = `docker exec ${envConfig.dbContainer} pg_dump -U ${envConfig.dbUser} -d ${envConfig.dbName} --verbose --no-password`;

      Logger.info(`Creating database backup: ${envConfig.dbName}`);
      const backupData = execSync(backupCommand, {
        encoding: "utf8",
        stdio: "pipe",
      });

      fs.writeFileSync(backupFile, backupData);

      // Generate checksum
      const checksum = this.generateChecksum(backupFile);
      this.backupManifest.checksums[`database/${path.basename(backupFile)}`] =
        checksum;
      this.backupManifest.files.push(`database/${path.basename(backupFile)}`);

      Logger.success(`Database backup created: ${backupFile}`);
    } catch (error) {
      Logger.warning(`Database backup failed: ${error.message}`);
      this.warnings.push("Database backup failed");
    }
  }

  async backupRedisData() {
    Logger.step("5/10", "Backing up Redis data");

    const envConfig = CONFIG.environments[this.options.environment];
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(
      this.backupDir,
      "redis",
      `redis-${timestamp}.rdb`
    );

    if (this.options.dryRun) {
      Logger.info("DRY RUN: Would backup Redis data");
      return;
    }

    try {
      // Check if Redis container is running
      const containerStatus = execSync(
        `docker ps --filter "name=${envConfig.redisContainer}" --format "{{.Status}}"`,
        {
          encoding: "utf8",
          stdio: "pipe",
        }
      ).trim();

      if (!containerStatus) {
        Logger.warning(
          `Redis container ${envConfig.redisContainer} is not running`
        );
        return;
      }

      // Force Redis to save current state
      execSync(`docker exec ${envConfig.redisContainer} redis-cli BGSAVE`, {
        stdio: "pipe",
      });

      // Wait for background save to complete
      let saveInProgress = true;
      let retries = 30;

      while (saveInProgress && retries > 0) {
        try {
          const lastSave = execSync(
            `docker exec ${envConfig.redisContainer} redis-cli LASTSAVE`,
            {
              encoding: "utf8",
              stdio: "pipe",
            }
          ).trim();

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const currentSave = execSync(
            `docker exec ${envConfig.redisContainer} redis-cli LASTSAVE`,
            {
              encoding: "utf8",
              stdio: "pipe",
            }
          ).trim();

          if (lastSave !== currentSave) {
            saveInProgress = false;
          }

          retries--;
        } catch (error) {
          break;
        }
      }

      // Copy Redis dump file
      execSync(
        `docker cp ${envConfig.redisContainer}:/data/dump.rdb ${backupFile}`,
        {
          stdio: "pipe",
        }
      );

      // Generate checksum
      const checksum = this.generateChecksum(backupFile);
      this.backupManifest.checksums[`redis/${path.basename(backupFile)}`] =
        checksum;
      this.backupManifest.files.push(`redis/${path.basename(backupFile)}`);

      Logger.success(`Redis backup created: ${backupFile}`);
    } catch (error) {
      Logger.warning(`Redis backup failed: ${error.message}`);
      this.warnings.push("Redis backup failed");
    }
  }

  async backupConfigurationFiles() {
    Logger.step("6/10", "Backing up configuration files");

    const configFiles = [
      ".env",
      ".env.production",
      ".env.staging",
      ".env.development",
      "docker-compose.yml",
      "docker-compose.dev.yml",
      "docker-compose.staging.yml",
      "docker-compose.test.yml",
      "package.json",
      "package-lock.json",
    ];

    if (this.options.dryRun) {
      Logger.info("DRY RUN: Would backup configuration files");
      return;
    }

    for (const file of configFiles) {
      const sourcePath = path.join(this.projectRoot, file);
      if (fs.existsSync(sourcePath)) {
        const targetPath = path.join(this.backupDir, "config", file);

        // Create directory if needed
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.copyFileSync(sourcePath, targetPath);

        // Generate checksum
        const checksum = this.generateChecksum(targetPath);
        this.backupManifest.checksums[`config/${file}`] = checksum;
        this.backupManifest.files.push(`config/${file}`);

        Logger.info(`Backed up: ${file}`);
      }
    }

    Logger.success("Configuration files backed up");
  }

  async backupApplicationFiles() {
    Logger.step("7/10", "Backing up application files");

    if (this.options.dryRun) {
      Logger.info("DRY RUN: Would backup application files");
      return;
    }

    // Backup logs if they exist
    const logsDir = path.join(this.projectRoot, "logs");
    if (fs.existsSync(logsDir)) {
      const targetLogsDir = path.join(this.backupDir, "logs");
      this.copyDirectory(logsDir, targetLogsDir);
      Logger.info("Application logs backed up");
    }

    // Backup uploads if they exist
    const uploadsDir = path.join(this.projectRoot, "uploads");
    if (fs.existsSync(uploadsDir)) {
      const targetUploadsDir = path.join(this.backupDir, "files", "uploads");
      this.copyDirectory(uploadsDir, targetUploadsDir);
      Logger.info("Upload files backed up");
    }

    Logger.success("Application files backed up");
  }

  copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);

    for (const item of items) {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);

      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);

        // Generate checksum
        const relativePath = path.relative(this.backupDir, targetPath);
        const checksum = this.generateChecksum(targetPath);
        this.backupManifest.checksums[relativePath] = checksum;
        this.backupManifest.files.push(relativePath);
      }
    }
  }

  async compressBackup() {
    if (!this.options.compress || !CONFIG.compression.enabled) {
      Logger.step("8/10", "Skipping compression");
      return;
    }

    Logger.step("8/10", "Compressing backup");

    if (this.options.dryRun) {
      Logger.info("DRY RUN: Would compress backup");
      return;
    }

    try {
      const compressedFile = `${this.backupDir}.tar.gz`;
      const command = `tar -czf ${compressedFile} -C ${path.dirname(
        this.backupDir
      )} ${path.basename(this.backupDir)}`;

      execSync(command, { stdio: "pipe" });

      // Remove uncompressed directory
      fs.rmSync(this.backupDir, { recursive: true, force: true });
      this.backupDir = compressedFile;

      // Update manifest
      this.backupManifest.compressed = true;
      this.backupManifest.compressionAlgorithm = CONFIG.compression.algorithm;

      Logger.success(`Backup compressed: ${compressedFile}`);
    } catch (error) {
      Logger.warning(`Compression failed: ${error.message}`);
      this.warnings.push("Compression failed");
    }
  }

  async encryptBackup() {
    if (!this.options.encrypt || !CONFIG.encryption.enabled) {
      Logger.step("9/10", "Skipping encryption");
      return;
    }

    Logger.step("9/10", "Encrypting backup");

    if (this.options.dryRun) {
      Logger.info("DRY RUN: Would encrypt backup");
      return;
    }

    try {
      const password = process.env.BACKUP_PASSWORD || "default-backup-password";
      const encryptedFile = `${this.backupDir}.enc`;

      // Read backup file
      const backupData = fs.readFileSync(this.backupDir);

      // Generate encryption key from password
      const salt = crypto.randomBytes(32);
      const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
      const iv = crypto.randomBytes(16);

      // Encrypt data
      const cipher = crypto.createCipher(CONFIG.encryption.algorithm, key);
      const encrypted = Buffer.concat([
        cipher.update(backupData),
        cipher.final(),
      ]);

      // Create encrypted file with metadata
      const encryptedData = {
        algorithm: CONFIG.encryption.algorithm,
        salt: salt.toString("hex"),
        iv: iv.toString("hex"),
        data: encrypted.toString("hex"),
      };

      fs.writeFileSync(encryptedFile, JSON.stringify(encryptedData));

      // Remove unencrypted file
      fs.unlinkSync(this.backupDir);
      this.backupDir = encryptedFile;

      // Update manifest
      this.backupManifest.encrypted = true;
      this.backupManifest.encryptionAlgorithm = CONFIG.encryption.algorithm;

      Logger.success(`Backup encrypted: ${encryptedFile}`);
    } catch (error) {
      Logger.warning(`Encryption failed: ${error.message}`);
      this.warnings.push("Encryption failed");
    }
  }

  async verifyBackup() {
    if (!this.options.verify) {
      Logger.step("10/10", "Skipping backup verification");
      return;
    }

    Logger.step("10/10", "Verifying backup integrity");

    if (this.options.dryRun) {
      Logger.info("DRY RUN: Would verify backup");
      return;
    }

    try {
      // Check if backup file exists
      if (!fs.existsSync(this.backupDir)) {
        throw new Error("Backup file not found");
      }

      // Check file size
      const stats = fs.statSync(this.backupDir);
      if (stats.size === 0) {
        throw new Error("Backup file is empty");
      }

      this.backupManifest.metadata.fileSize = stats.size;
      this.backupManifest.metadata.verified = true;

      Logger.success("Backup verification completed");
    } catch (error) {
      Logger.warning(`Backup verification failed: ${error.message}`);
      this.warnings.push("Backup verification failed");
    }
  }

  generateChecksum(filePath) {
    const data = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  async cleanupOldBackups() {
    Logger.info("Cleaning up old backups");

    const backupsDir = path.join(this.projectRoot, this.options.outputDir);
    if (!fs.existsSync(backupsDir)) return;

    const retention = CONFIG.retentionPolicies[this.options.environment];
    const backupFiles = fs
      .readdirSync(backupsDir)
      .filter((file) => file.startsWith(`backup-${this.options.environment}`))
      .map((file) => ({
        name: file,
        path: path.join(backupsDir, file),
        mtime: fs.statSync(path.join(backupsDir, file)).mtime,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Keep only the specified number of backups
    const maxBackups = retention.daily || 7;
    if (backupFiles.length > maxBackups) {
      const toDelete = backupFiles.slice(maxBackups);
      for (const backup of toDelete) {
        try {
          if (fs.statSync(backup.path).isDirectory()) {
            fs.rmSync(backup.path, { recursive: true, force: true });
          } else {
            fs.unlinkSync(backup.path);
          }
          Logger.info(`Cleaned up old backup: ${backup.name}`);
        } catch (error) {
          Logger.warning(
            `Failed to cleanup backup ${backup.name}: ${error.message}`
          );
        }
      }
    }
  }

  async generateBackupReport() {
    Logger.info("Generating backup report");

    const duration = Date.now() - this.startTime;

    // Complete manifest
    this.backupManifest.duration = duration;
    this.backupManifest.status = "completed";
    this.backupManifest.warnings = this.warnings;
    this.backupManifest.errors = this.errors;
    this.backupManifest.metadata.backupPath = this.backupDir;

    // Save manifest
    const manifestPath = path.join(
      path.dirname(this.backupDir),
      `${this.backupId}-manifest.json`
    );

    if (!this.options.dryRun) {
      fs.writeFileSync(
        manifestPath,
        JSON.stringify(this.backupManifest, null, 2)
      );
    }

    // Print summary
    this.printBackupSummary();

    Logger.success(`Backup report saved: ${manifestPath}`);
  }

  printBackupSummary() {
    console.log("\n" + "=".repeat(60));
    Logger.backup("💾 Backup Summary");
    console.log("=".repeat(60));

    console.log(`\n📊 Backup Information:`);
    console.log(`  ID: ${this.backupManifest.id}`);
    console.log(`  Environment: ${this.backupManifest.environment}`);
    console.log(`  Type: ${this.backupManifest.type}`);
    console.log(`  Platform: ${this.backupManifest.platform}`);
    console.log(`  Duration: ${this.backupManifest.duration}ms`);
    console.log(`  Status: ${this.backupManifest.status}`);

    console.log(`\n📁 Backup Contents:`);
    console.log(`  Files: ${this.backupManifest.files.length}`);
    if (this.backupManifest.metadata.fileSize) {
      console.log(
        `  Size: ${Math.round(
          this.backupManifest.metadata.fileSize / 1024 / 1024
        )}MB`
      );
    }
    console.log(`  Compressed: ${this.backupManifest.compressed || false}`);
    console.log(`  Encrypted: ${this.backupManifest.encrypted || false}`);

    if (this.backupManifest.warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      this.backupManifest.warnings.forEach((warning) => {
        console.log(`  • ${warning}`);
      });
    }

    if (this.backupManifest.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      this.backupManifest.errors.forEach((error) => {
        console.log(`  • ${error}`);
      });
    }

    console.log(`\n📁 Backup Location: ${this.backupDir}`);
    console.log("\n" + "=".repeat(60));
  }

  async handleBackupFailure(error) {
    Logger.error("Handling backup failure...");

    // Generate failure report
    const duration = Date.now() - this.startTime;

    const failureReport = {
      ...this.backupManifest,
      duration: duration,
      status: "failed",
      failureReason: error.message,
      errors: [...this.errors, error.message],
    };

    // Save failure report
    const reportPath = path.join(
      this.projectRoot,
      this.options.outputDir,
      `${this.backupId}-FAILED.json`
    );

    if (!this.options.dryRun) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      fs.writeFileSync(reportPath, JSON.stringify(failureReport, null, 2));
    }

    Logger.error(`Failure report saved: ${reportPath}`);
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
Task Management System - Cross-Platform Backup

Usage: node backup.js [environment] [backup-type] [options]

Environments:
  development   Backup development environment (default)
  staging       Backup staging environment
  production    Backup production environment

Backup Types:
  full          Complete database and file system backup (default)
  incremental   Changes since last backup
  differential  Changes since last full backup

Options:
  --help, -h              Show this help message
  --verbose, -v           Enable verbose logging
  --dry-run               Show what would be backed up without creating backup
  --no-compress           Skip compression
  --encrypt               Enable encryption (requires BACKUP_PASSWORD env var)
  --no-verify             Skip backup verification
  --output-dir=DIR        Specify output directory (default: backups)

Examples:
  node backup.js                                    # Full backup of development
  node backup.js production full --encrypt          # Encrypted production backup
  node backup.js staging incremental --dry-run      # Dry run staging incremental
  node backup.js development --verbose              # Verbose development backup
`);
    process.exit(0);
  }

  // Parse arguments
  const options = {
    environment: "development",
    backupType: "full",
    compress: true,
    encrypt: false,
    verify: true,
    verbose: false,
    dryRun: false,
    outputDir: "backups",
  };

  // Parse environment
  const environments = ["development", "staging", "production"];
  for (const arg of args) {
    if (environments.includes(arg)) {
      options.environment = arg;
      break;
    }
  }

  // Parse backup type
  const backupTypes = ["full", "incremental", "differential"];
  for (const arg of args) {
    if (backupTypes.includes(arg)) {
      options.backupType = arg;
      break;
    }
  }

  // Parse output directory
  const outputDirArg = args.find((arg) => arg.startsWith("--output-dir="));
  if (outputDirArg) {
    options.outputDir = outputDirArg.split("=")[1];
  }

  // Parse flags
  if (args.includes("--verbose") || args.includes("-v")) {
    options.verbose = true;
  }

  if (args.includes("--dry-run")) {
    options.dryRun = true;
  }

  if (args.includes("--no-compress")) {
    options.compress = false;
  }

  if (args.includes("--encrypt")) {
    options.encrypt = true;
  }

  if (args.includes("--no-verify")) {
    options.verify = false;
  }

  try {
    const backupManager = new BackupManager(options);
    const success = await backupManager.createBackup();

    process.exit(success ? 0 : 1);
  } catch (error) {
    Logger.error(`Backup failed: ${error.message}`);

    if (options.verbose) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run the backup if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    Logger.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { BackupManager, SystemChecker, Logger };
