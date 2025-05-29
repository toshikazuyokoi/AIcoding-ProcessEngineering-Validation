#!/usr/bin/env node

/**
 * Docker Compose Development Environment Test Script
 * TSK-004-ENV-docker-compose-dev テスト実行
 *
 * このスクリプトはdocker-compose.dev.ymlの内容と構成を検証します
 */

const fs = require("fs");
const path = require("path");

// 簡易YAMLパーサー（js-yaml依存を避けるため）
const yaml = {
  load: (content) => {
    try {
      // 基本的なYAML構造の検証
      if (!content.includes("version:") || !content.includes("services:")) {
        return null;
      }

      // 簡易的な構造解析
      const lines = content.split("\n");
      const result = { services: {}, networks: {}, volumes: {} };
      let currentSection = null;
      let currentService = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("services:")) {
          currentSection = "services";
        } else if (trimmed.startsWith("networks:")) {
          currentSection = "networks";
        } else if (trimmed.startsWith("volumes:")) {
          currentSection = "volumes";
        } else if (
          currentSection === "services" &&
          trimmed.endsWith(":") &&
          !trimmed.startsWith("-")
        ) {
          currentService = trimmed.slice(0, -1);
          result.services[currentService] = {};
        }
      }

      return result;
    } catch {
      return null;
    }
  },
};

class DockerComposeDevTest {
  constructor() {
    this.testResults = [];
    this.composeFilePath = path.join(process.cwd(), "docker-compose.dev.yml");
  }

  /**
   * テスト実行メイン関数
   */
  async runTests() {
    console.log("🧪 Docker Compose Development Environment テスト開始");
    console.log("=======================================================");

    try {
      await this.testFileExists();
      await this.testYamlSyntax();
      await this.testServiceConfiguration();
      await this.testNetworkConfiguration();
      await this.testVolumeConfiguration();
      await this.testEnvironmentVariables();
      await this.testPortConfiguration();
      await this.testHealthChecks();
      await this.testDependencies();

      this.printResults();

      return this.testResults.every((result) => result.passed);
    } catch (error) {
      console.error("❌ テスト実行エラー:", error.message);
      return false;
    }
  }

  /**
   * ファイル存在確認
   */
  async testFileExists() {
    const testName = "docker-compose.dev.ymlファイルの存在確認";
    try {
      const exists = fs.existsSync(this.composeFilePath);
      this.addTestResult(
        testName,
        exists,
        exists ? "✅ ファイルが存在します" : "❌ ファイルが存在しません"
      );
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * YAML構文確認
   */
  async testYamlSyntax() {
    const testName = "YAML構文の確認";
    try {
      const content = fs.readFileSync(this.composeFilePath, "utf8");
      const parsed = yaml.load(content);

      const isValid = parsed && typeof parsed === "object";
      this.addTestResult(
        testName,
        isValid,
        isValid ? "✅ YAML構文が正しいです" : "❌ YAML構文エラー"
      );

      if (isValid) {
        this.composeConfig = parsed;
      }
    } catch (error) {
      this.addTestResult(
        testName,
        false,
        `❌ YAML構文エラー: ${error.message}`
      );
    }
  }

  /**
   * サービス設定確認
   */
  async testServiceConfiguration() {
    const testName = "サービス設定の確認";
    try {
      if (!this.composeConfig || !this.composeConfig.services) {
        this.addTestResult(testName, false, "❌ サービス設定が見つかりません");
        return;
      }

      const services = this.composeConfig.services;
      const requiredServices = [
        "postgres",
        "redis",
        "backend",
        "frontend",
        "adminer",
        "redis-commander",
        "mailhog",
      ];

      const missingServices = requiredServices.filter(
        (service) => !services[service]
      );
      const passed = missingServices.length === 0;

      const message = passed
        ? "✅ 必要なサービスがすべて定義されています"
        : `❌ 不足サービス: ${missingServices.join(", ")}`;

      this.addTestResult(testName, passed, message);

      // 各サービスの詳細チェック
      this.testPostgresService(services.postgres);
      this.testRedisService(services.redis);
      this.testBackendService(services.backend);
      this.testFrontendService(services.frontend);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * PostgreSQLサービス確認
   */
  testPostgresService(postgres) {
    const testName = "PostgreSQLサービス設定確認";
    try {
      const checks = [
        {
          condition: postgres?.image === "postgres:16.1-alpine",
          name: "PostgreSQL 16.1イメージ",
        },
        {
          condition: postgres?.environment?.POSTGRES_DB === "taskdb_dev",
          name: "データベース名設定",
        },
        {
          condition: postgres?.ports?.includes("5432:5432"),
          name: "ポート設定",
        },
        {
          condition: postgres?.healthcheck?.test?.includes("pg_isready"),
          name: "ヘルスチェック設定",
        },
      ];

      const failedChecks = checks.filter((check) => !check.condition);
      const passed = failedChecks.length === 0;

      const message = passed
        ? "✅ PostgreSQLサービス設定が正しいです"
        : `❌ 不正設定: ${failedChecks.map((c) => c.name).join(", ")}`;

      this.addTestResult(testName, passed, message);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * Redisサービス確認
   */
  testRedisService(redis) {
    const testName = "Redisサービス設定確認";
    try {
      const checks = [
        {
          condition: redis?.image === "redis:7.2.4-alpine",
          name: "Redis 7.2.4イメージ",
        },
        { condition: redis?.ports?.includes("6379:6379"), name: "ポート設定" },
        {
          condition: redis?.healthcheck?.test?.includes("redis-cli"),
          name: "ヘルスチェック設定",
        },
      ];

      const failedChecks = checks.filter((check) => !check.condition);
      const passed = failedChecks.length === 0;

      const message = passed
        ? "✅ Redisサービス設定が正しいです"
        : `❌ 不正設定: ${failedChecks.map((c) => c.name).join(", ")}`;

      this.addTestResult(testName, passed, message);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * バックエンドサービス確認
   */
  testBackendService(backend) {
    const testName = "バックエンドサービス設定確認";
    try {
      const checks = [
        {
          condition: backend?.environment?.NODE_ENV === "development",
          name: "開発環境設定",
        },
        {
          condition: backend?.environment?.DATABASE_URL?.includes("taskdb_dev"),
          name: "データベース接続設定",
        },
        {
          condition: backend?.ports?.includes("8000:8000"),
          name: "APIポート設定",
        },
        {
          condition: backend?.ports?.includes("9229:9229"),
          name: "デバッガーポート設定",
        },
      ];

      const failedChecks = checks.filter((check) => !check.condition);
      const passed = failedChecks.length === 0;

      const message = passed
        ? "✅ バックエンドサービス設定が正しいです"
        : `❌ 不正設定: ${failedChecks.map((c) => c.name).join(", ")}`;

      this.addTestResult(testName, passed, message);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * フロントエンドサービス確認
   */
  testFrontendService(frontend) {
    const testName = "フロントエンドサービス設定確認";
    try {
      const checks = [
        {
          condition: frontend?.environment?.NODE_ENV === "development",
          name: "開発環境設定",
        },
        {
          condition:
            frontend?.environment?.REACT_APP_API_URL ===
            "http://localhost:8000",
          name: "API URL設定",
        },
        {
          condition: frontend?.ports?.includes("3000:3000"),
          name: "ポート設定",
        },
        {
          condition: frontend?.environment?.FAST_REFRESH === true,
          name: "Fast Refresh設定",
        },
      ];

      const failedChecks = checks.filter((check) => !check.condition);
      const passed = failedChecks.length === 0;

      const message = passed
        ? "✅ フロントエンドサービス設定が正しいです"
        : `❌ 不正設定: ${failedChecks.map((c) => c.name).join(", ")}`;

      this.addTestResult(testName, passed, message);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * ネットワーク設定確認
   */
  async testNetworkConfiguration() {
    const testName = "ネットワーク設定の確認";
    try {
      const networks = this.composeConfig?.networks;
      const checks = [
        {
          condition: networks?.["task-management-dev"]?.driver === "bridge",
          name: "ブリッジネットワーク設定",
        },
        {
          condition:
            networks?.["task-management-dev"]?.ipam?.config?.[0]?.subnet ===
            "172.20.0.0/16",
          name: "サブネット設定",
        },
      ];

      const failedChecks = checks.filter((check) => !check.condition);
      const passed = failedChecks.length === 0;

      const message = passed
        ? "✅ ネットワーク設定が正しいです"
        : `❌ 不正設定: ${failedChecks.map((c) => c.name).join(", ")}`;

      this.addTestResult(testName, passed, message);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * ボリューム設定確認
   */
  async testVolumeConfiguration() {
    const testName = "ボリューム設定の確認";
    try {
      const volumes = this.composeConfig?.volumes;
      const requiredVolumes = [
        "postgres_dev_data",
        "redis_dev_data",
        "node_modules_backend",
        "node_modules_frontend",
      ];

      const missingVolumes = requiredVolumes.filter(
        (volume) => !volumes?.[volume]
      );
      const passed = missingVolumes.length === 0;

      const message = passed
        ? "✅ 必要なボリュームがすべて定義されています"
        : `❌ 不足ボリューム: ${missingVolumes.join(", ")}`;

      this.addTestResult(testName, passed, message);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * 環境変数確認
   */
  async testEnvironmentVariables() {
    const testName = "環境変数設定の確認";
    try {
      const services = this.composeConfig?.services;
      const checks = [
        {
          condition: services?.postgres?.environment?.POSTGRES_DB,
          name: "PostgreSQL DB名",
        },
        {
          condition: services?.backend?.environment?.JWT_SECRET,
          name: "JWT秘密鍵",
        },
        {
          condition: services?.frontend?.environment?.REACT_APP_API_URL,
          name: "フロントエンドAPI URL",
        },
      ];

      const failedChecks = checks.filter((check) => !check.condition);
      const passed = failedChecks.length === 0;

      const message = passed
        ? "✅ 必要な環境変数がすべて設定されています"
        : `❌ 不足環境変数: ${failedChecks.map((c) => c.name).join(", ")}`;

      this.addTestResult(testName, passed, message);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * ポート設定確認
   */
  async testPortConfiguration() {
    const testName = "ポート設定の確認";
    try {
      const services = this.composeConfig?.services;
      const expectedPorts = {
        postgres: "5432:5432",
        redis: "6379:6379",
        backend: "8000:8000",
        frontend: "3000:3000",
        adminer: "8080:8080",
        "redis-commander": "8081:8081",
        mailhog: ["1025:1025", "8025:8025"],
      };

      let allPortsCorrect = true;
      const portIssues = [];

      for (const [serviceName, expectedPort] of Object.entries(expectedPorts)) {
        const service = services?.[serviceName];
        if (Array.isArray(expectedPort)) {
          const hasAllPorts = expectedPort.every((port) =>
            service?.ports?.includes(port)
          );
          if (!hasAllPorts) {
            allPortsCorrect = false;
            portIssues.push(`${serviceName}: ${expectedPort.join(", ")}`);
          }
        } else {
          if (!service?.ports?.includes(expectedPort)) {
            allPortsCorrect = false;
            portIssues.push(`${serviceName}: ${expectedPort}`);
          }
        }
      }

      const message = allPortsCorrect
        ? "✅ ポート設定が正しいです"
        : `❌ 不正ポート設定: ${portIssues.join(", ")}`;

      this.addTestResult(testName, allPortsCorrect, message);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * ヘルスチェック確認
   */
  async testHealthChecks() {
    const testName = "ヘルスチェック設定の確認";
    try {
      const services = this.composeConfig?.services;
      const servicesWithHealthCheck = [
        "postgres",
        "redis",
        "backend",
        "frontend",
      ];

      const missingHealthChecks = servicesWithHealthCheck.filter(
        (serviceName) => !services?.[serviceName]?.healthcheck?.test
      );

      const passed = missingHealthChecks.length === 0;

      const message = passed
        ? "✅ 必要なヘルスチェックがすべて設定されています"
        : `❌ ヘルスチェック未設定: ${missingHealthChecks.join(", ")}`;

      this.addTestResult(testName, passed, message);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * 依存関係確認
   */
  async testDependencies() {
    const testName = "サービス依存関係の確認";
    try {
      const services = this.composeConfig?.services;
      const checks = [
        {
          condition: services?.backend?.depends_on?.postgres,
          name: "バックエンド→PostgreSQL依存",
        },
        {
          condition: services?.backend?.depends_on?.redis,
          name: "バックエンド→Redis依存",
        },
        {
          condition: services?.frontend?.depends_on?.includes?.("backend"),
          name: "フロントエンド→バックエンド依存",
        },
      ];

      const failedChecks = checks.filter((check) => !check.condition);
      const passed = failedChecks.length === 0;

      const message = passed
        ? "✅ サービス依存関係が正しく設定されています"
        : `❌ 依存関係設定不備: ${failedChecks.map((c) => c.name).join(", ")}`;

      this.addTestResult(testName, passed, message);
    } catch (error) {
      this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
    }
  }

  /**
   * テスト結果の追加
   */
  addTestResult(testName, passed, message) {
    this.testResults.push({ testName, passed, message });
    console.log(`${passed ? "✅" : "❌"} ${testName}: ${message}`);
  }

  /**
   * テスト結果の出力
   */
  printResults() {
    console.log("\n=======================================================");
    console.log("📊 テスト結果サマリー");
    console.log("=======================================================");

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(
      (result) => result.passed
    ).length;
    const failedTests = totalTests - passedTests;

    console.log(`総テスト数: ${totalTests}`);
    console.log(`成功: ${passedTests}`);
    console.log(`失敗: ${failedTests}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log("\n❌ 失敗したテスト:");
      this.testResults
        .filter((result) => !result.passed)
        .forEach((result) => {
          console.log(`  - ${result.testName}: ${result.message}`);
        });
    }

    // 設定情報の表示
    console.log("\n📋 Docker Compose設定情報:");
    try {
      const content = fs.readFileSync(this.composeFilePath, "utf8");
      const lines = content.split("\n").length;
      const services = Object.keys(this.composeConfig?.services || {}).length;
      const volumes = Object.keys(this.composeConfig?.volumes || {}).length;
      const networks = Object.keys(this.composeConfig?.networks || {}).length;

      console.log(`  - 総行数: ${lines}`);
      console.log(`  - サービス数: ${services}`);
      console.log(`  - ボリューム数: ${volumes}`);
      console.log(`  - ネットワーク数: ${networks}`);
    } catch (error) {
      console.log("  - 設定情報取得エラー");
    }
  }
}

// テスト実行
if (require.main === module) {
  const test = new DockerComposeDevTest();
  test.runTests().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DockerComposeDevTest;
