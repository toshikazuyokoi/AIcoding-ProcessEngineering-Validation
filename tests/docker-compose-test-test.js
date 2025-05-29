#!/usr/bin/env node

/**
 * Docker Compose Test Environment Test Script
 * TSK-005-ENV-docker-compose-test テスト実行
 * 
 * このスクリプトはdocker-compose.test.ymlの内容と構成を検証します
 */

const fs = require('fs');
const path = require('path');

// 簡易YAMLパーサー（js-yaml依存を避けるため）
const yaml = {
    load: (content) => {
        try {
            // 基本的なYAML構造の検証
            if (!content.includes('version:') || !content.includes('services:')) {
                return null;
            }
            
            // 簡易的な構造解析
            const lines = content.split('\n');
            const result = { services: {}, networks: {}, volumes: {} };
            let currentSection = null;
            let currentService = null;
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('services:')) {
                    currentSection = 'services';
                } else if (trimmed.startsWith('networks:')) {
                    currentSection = 'networks';
                } else if (trimmed.startsWith('volumes:')) {
                    currentSection = 'volumes';
                } else if (currentSection === 'services' && trimmed.endsWith(':') && !trimmed.startsWith('-')) {
                    currentService = trimmed.slice(0, -1);
                    result.services[currentService] = {};
                }
            }
            
            return result;
        } catch {
            return null;
        }
    }
};

class DockerComposeTestTest {
    constructor() {
        this.testResults = [];
        this.composeFilePath = path.join(process.cwd(), 'docker-compose.test.yml');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 Docker Compose Test Environment テスト開始');
        console.log('====================================================');

        try {
            await this.testFileExists();
            await this.testYamlSyntax();
            await this.testTestServiceConfiguration();
            await this.testTestNetworkConfiguration();
            await this.testTestVolumeConfiguration();
            await this.testTestEnvironmentVariables();
            await this.testTestPortConfiguration();
            await this.testTestHealthChecks();
            await this.testTestDependencies();
            await this.testCIConfiguration();
            
            this.printResults();
            
            return this.testResults.every(result => result.passed);
        } catch (error) {
            console.error('❌ テスト実行エラー:', error.message);
            return false;
        }
    }

    /**
     * ファイル存在確認
     */
    async testFileExists() {
        const testName = 'docker-compose.test.ymlファイルの存在確認';
        try {
            const exists = fs.existsSync(this.composeFilePath);
            this.addTestResult(testName, exists, exists ? '✅ ファイルが存在します' : '❌ ファイルが存在しません');
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * YAML構文確認
     */
    async testYamlSyntax() {
        const testName = 'YAML構文の確認';
        try {
            const content = fs.readFileSync(this.composeFilePath, 'utf8');
            const parsed = yaml.load(content);
            
            const isValid = parsed && typeof parsed === 'object';
            this.addTestResult(testName, isValid, isValid ? '✅ YAML構文が正しいです' : '❌ YAML構文エラー');
            
            if (isValid) {
                this.composeConfig = parsed;
            }
        } catch (error) {
            this.addTestResult(testName, false, `❌ YAML構文エラー: ${error.message}`);
        }
    }

    /**
     * テストサービス設定確認
     */
    async testTestServiceConfiguration() {
        const testName = 'テストサービス設定の確認';
        try {
            if (!this.composeConfig || !this.composeConfig.services) {
                this.addTestResult(testName, false, '❌ サービス設定が見つかりません');
                return;
            }

            const services = this.composeConfig.services;
            const requiredTestServices = [
                'postgres-test',
                'redis-test', 
                'backend-test',
                'frontend-test',
                'e2e-test',
                'test-reporter',
                'test-seeder'
            ];

            const missingServices = requiredTestServices.filter(service => !services[service]);
            const passed = missingServices.length === 0;
            
            const message = passed 
                ? '✅ 必要なテストサービスがすべて定義されています'
                : `❌ 不足テストサービス: ${missingServices.join(', ')}`;
                
            this.addTestResult(testName, passed, message);

            // 各テストサービスの詳細チェック
            this.testPostgresTestService(services['postgres-test']);
            this.testRedisTestService(services['redis-test']);
            this.testBackendTestService(services['backend-test']);
            this.testFrontendTestService(services['frontend-test']);
            this.testE2ETestService(services['e2e-test']);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * PostgreSQLテストサービス確認
     */
    testPostgresTestService(postgres) {
        const testName = 'PostgreSQLテストサービス設定確認';
        try {
            const checks = [
                { condition: postgres?.image === 'postgres:16.1-alpine', name: 'PostgreSQL 16.1イメージ' },
                { condition: postgres?.environment?.POSTGRES_DB === 'taskdb_test', name: 'テストデータベース名設定' },
                { condition: postgres?.ports?.includes('5433:5432'), name: 'テスト用ポート設定' },
                { condition: postgres?.restart === 'no', name: 'テスト用restart設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ PostgreSQLテストサービス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Redisテストサービス確認
     */
    testRedisTestService(redis) {
        const testName = 'Redisテストサービス設定確認';
        try {
            const checks = [
                { condition: redis?.image === 'redis:7.2.4-alpine', name: 'Redis 7.2.4イメージ' },
                { condition: redis?.ports?.includes('6380:6379'), name: 'テスト用ポート設定' },
                { condition: redis?.restart === 'no', name: 'テスト用restart設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Redisテストサービス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * バックエンドテストサービス確認
     */
    testBackendTestService(backend) {
        const testName = 'バックエンドテストサービス設定確認';
        try {
            const checks = [
                { condition: backend?.environment?.NODE_ENV === 'test', name: 'テスト環境設定' },
                { condition: backend?.environment?.DATABASE_URL?.includes('taskdb_test'), name: 'テストデータベース接続設定' },
                { condition: backend?.environment?.COVERAGE_THRESHOLD === '90', name: 'カバレッジ閾値設定' },
                { condition: backend?.restart === 'no', name: 'テスト用restart設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ バックエンドテストサービス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * フロントエンドテストサービス確認
     */
    testFrontendTestService(frontend) {
        const testName = 'フロントエンドテストサービス設定確認';
        try {
            const checks = [
                { condition: frontend?.environment?.NODE_ENV === 'test', name: 'テスト環境設定' },
                { condition: frontend?.environment?.CI === 'true', name: 'CI環境設定' },
                { condition: frontend?.environment?.COVERAGE_THRESHOLD === '90', name: 'カバレッジ閾値設定' },
                { condition: frontend?.restart === 'no', name: 'テスト用restart設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ フロントエンドテストサービス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * E2Eテストサービス確認
     */
    testE2ETestService(e2e) {
        const testName = 'E2Eテストサービス設定確認';
        try {
            const checks = [
                { condition: e2e?.environment?.NODE_ENV === 'test', name: 'テスト環境設定' },
                { condition: e2e?.environment?.HEADLESS === 'true', name: 'ヘッドレス設定' },
                { condition: e2e?.environment?.TIMEOUT === '60000', name: 'タイムアウト設定' },
                { condition: e2e?.restart === 'no', name: 'テスト用restart設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ E2Eテストサービス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * テストネットワーク設定確認
     */
    async testTestNetworkConfiguration() {
        const testName = 'テストネットワーク設定の確認';
        try {
            const networks = this.composeConfig?.networks;
            const checks = [
                { condition: networks?.['task-management-test']?.driver === 'bridge', name: 'テスト用ブリッジネットワーク設定' },
                { condition: networks?.['task-management-test']?.ipam?.config?.[0]?.subnet === '172.21.0.0/16', name: 'テスト用サブネット設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ テストネットワーク設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * テストボリューム設定確認
     */
    async testTestVolumeConfiguration() {
        const testName = 'テストボリューム設定の確認';
        try {
            const volumes = this.composeConfig?.volumes;
            const requiredTestVolumes = [
                'postgres_test_data',
                'redis_test_data',
                'test_coverage_reports',
                'test_artifacts'
            ];

            const missingVolumes = requiredTestVolumes.filter(volume => !volumes?.[volume]);
            const passed = missingVolumes.length === 0;
            
            const message = passed 
                ? '✅ 必要なテストボリュームがすべて定義されています'
                : `❌ 不足テストボリューム: ${missingVolumes.join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * テスト環境変数確認
     */
    async testTestEnvironmentVariables() {
        const testName = 'テスト環境変数設定の確認';
        try {
            const services = this.composeConfig?.services;
            const checks = [
                { condition: services?.['postgres-test']?.environment?.POSTGRES_DB === 'taskdb_test', name: 'テストDB名' },
                { condition: services?.['backend-test']?.environment?.NODE_ENV === 'test', name: 'バックエンドテスト環境' },
                { condition: services?.['frontend-test']?.environment?.CI === 'true', name: 'フロントエンドCI設定' },
                { condition: services?.['e2e-test']?.environment?.HEADLESS === 'true', name: 'E2Eヘッドレス設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 必要なテスト環境変数がすべて設定されています'
                : `❌ 不足テスト環境変数: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * テストポート設定確認
     */
    async testTestPortConfiguration() {
        const testName = 'テストポート設定の確認';
        try {
            const services = this.composeConfig?.services;
            const expectedTestPorts = {
                'postgres-test': '5433:5432',
                'redis-test': '6380:6379'
            };

            let allPortsCorrect = true;
            const portIssues = [];

            for (const [serviceName, expectedPort] of Object.entries(expectedTestPorts)) {
                const service = services?.[serviceName];
                if (!service?.ports?.includes(expectedPort)) {
                    allPortsCorrect = false;
                    portIssues.push(`${serviceName}: ${expectedPort}`);
                }
            }
            
            const message = allPortsCorrect 
                ? '✅ テストポート設定が正しいです'
                : `❌ 不正テストポート設定: ${portIssues.join(', ')}`;
                
            this.addTestResult(testName, allPortsCorrect, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * テストヘルスチェック確認
     */
    async testTestHealthChecks() {
        const testName = 'テストヘルスチェック設定の確認';
        try {
            const services = this.composeConfig?.services;
            const servicesWithHealthCheck = ['postgres-test', 'redis-test', 'backend-test'];
            
            const missingHealthChecks = servicesWithHealthCheck.filter(serviceName => 
                !services?.[serviceName]?.healthcheck?.test
            );
            
            const passed = missingHealthChecks.length === 0;
            
            const message = passed 
                ? '✅ 必要なテストヘルスチェックがすべて設定されています'
                : `❌ テストヘルスチェック未設定: ${missingHealthChecks.join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * テスト依存関係確認
     */
    async testTestDependencies() {
        const testName = 'テストサービス依存関係の確認';
        try {
            const services = this.composeConfig?.services;
            const checks = [
                { condition: services?.['backend-test']?.depends_on?.['postgres-test'], name: 'バックエンドテスト→PostgreSQLテスト依存' },
                { condition: services?.['backend-test']?.depends_on?.['redis-test'], name: 'バックエンドテスト→Redisテスト依存' },
                { condition: services?.['frontend-test']?.depends_on?.includes?.('backend-test'), name: 'フロントエンドテスト→バックエンドテスト依存' },
                { condition: services?.['e2e-test']?.depends_on?.includes?.('frontend-test'), name: 'E2Eテスト→フロントエンドテスト依存' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ テストサービス依存関係が正しく設定されています'
                : `❌ テスト依存関係設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * CI設定確認
     */
    async testCIConfiguration() {
        const testName = 'CI/CD統合設定の確認';
        try {
            const content = fs.readFileSync(this.composeFilePath, 'utf8');
            const checks = [
                { condition: content.includes('restart: "no"'), name: 'CI用restart設定' },
                { condition: content.includes('TZ: UTC'), name: 'UTC時刻設定' },
                { condition: content.includes('test:ci'), name: 'CI用テストコマンド' },
                { condition: content.includes('COVERAGE_THRESHOLD'), name: 'カバレッジ閾値設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ CI/CD統合設定が正しいです'
                : `❌ CI設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
        console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
    }

    /**
     * テスト結果の出力
     */
    printResults() {
        console.log('\n====================================================');
        console.log('📊 テスト結果サマリー');
        console.log('====================================================');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`総テスト数: ${totalTests}`);
        console.log(`成功: ${passedTests}`);
        console.log(`失敗: ${failedTests}`);
        console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (failedTests > 0) {
            console.log('\n❌ 失敗したテスト:');
            this.testResults.filter(result => !result.passed).forEach(result => {
                console.log(`  - ${result.testName}: ${result.message}`);
            });
        }

        // 設定情報の表示
        console.log('\n📋 Docker Compose Test設定情報:');
        try {
            const content = fs.readFileSync(this.composeFilePath, 'utf8');
            const lines = content.split('\n').length;
            const services = Object.keys(this.composeConfig?.services || {}).length;
            const volumes = Object.keys(this.composeConfig?.volumes || {}).length;
            const networks = Object.keys(this.composeConfig?.networks || {}).length;
            
            console.log(`  - 総行数: ${lines}`);
            console.log(`  - テストサービス数: ${services}`);
            console.log(`  - テストボリューム数: ${volumes}`);
            console.log(`  - テストネットワーク数: ${networks}`);
        } catch (error) {
            console.log('  - 設定情報取得エラー');
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new DockerComposeTestTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = DockerComposeTestTest;
