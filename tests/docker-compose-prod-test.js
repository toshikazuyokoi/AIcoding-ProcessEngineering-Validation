#!/usr/bin/env node

/**
 * Docker Compose Production Environment Test Script
 * TSK-006-ENV-docker-compose テスト実行
 * 
 * このスクリプトはdocker-compose.ymlの内容と構成を検証します
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

class DockerComposeProdTest {
    constructor() {
        this.testResults = [];
        this.composeFilePath = path.join(process.cwd(), 'docker-compose.yml');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 Docker Compose Production Environment テスト開始');
        console.log('======================================================');

        try {
            await this.testFileExists();
            await this.testYamlSyntax();
            await this.testProductionServiceConfiguration();
            await this.testProductionNetworkConfiguration();
            await this.testProductionVolumeConfiguration();
            await this.testSecurityConfiguration();
            await this.testMonitoringConfiguration();
            await this.testBackupConfiguration();
            await this.testScalabilityConfiguration();
            await this.testEnvironmentVariables();
            
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
        const testName = 'docker-compose.ymlファイルの存在確認';
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
     * 本番サービス設定確認
     */
    async testProductionServiceConfiguration() {
        const testName = '本番サービス設定の確認';
        try {
            if (!this.composeConfig || !this.composeConfig.services) {
                this.addTestResult(testName, false, '❌ サービス設定が見つかりません');
                return;
            }

            const services = this.composeConfig.services;
            const requiredProdServices = [
                'nginx',
                'postgres',
                'redis', 
                'backend',
                'frontend',
                'prometheus',
                'grafana',
                'backup',
                'fluentd',
                'healthcheck'
            ];

            const missingServices = requiredProdServices.filter(service => !services[service]);
            const passed = missingServices.length === 0;
            
            const message = passed 
                ? '✅ 必要な本番サービスがすべて定義されています'
                : `❌ 不足本番サービス: ${missingServices.join(', ')}`;
                
            this.addTestResult(testName, passed, message);

            // 各本番サービスの詳細チェック
            this.testNginxService(services.nginx);
            this.testPostgresService(services.postgres);
            this.testRedisService(services.redis);
            this.testBackendService(services.backend);
            this.testFrontendService(services.frontend);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Nginxサービス確認
     */
    testNginxService(nginx) {
        const testName = 'Nginxリバースプロキシ設定確認';
        try {
            const checks = [
                { condition: nginx?.image?.includes('nginx:1.25'), name: 'Nginx 1.25イメージ' },
                { condition: nginx?.ports?.includes('80:80'), name: 'HTTP ポート設定' },
                { condition: nginx?.ports?.includes('443:443'), name: 'HTTPS ポート設定' },
                { condition: nginx?.restart === 'always', name: '本番用restart設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Nginxサービス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * PostgreSQL本番サービス確認
     */
    testPostgresService(postgres) {
        const testName = 'PostgreSQL本番サービス設定確認';
        try {
            const checks = [
                { condition: postgres?.image === 'postgres:16.1-alpine', name: 'PostgreSQL 16.1イメージ' },
                { condition: postgres?.restart === 'always', name: '本番用restart設定' },
                { condition: postgres?.security_opt?.includes('no-new-privileges:true'), name: 'セキュリティ設定' },
                { condition: postgres?.read_only === true, name: 'Read-only設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ PostgreSQL本番サービス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Redis本番サービス確認
     */
    testRedisService(redis) {
        const testName = 'Redis本番サービス設定確認';
        try {
            const checks = [
                { condition: redis?.image === 'redis:7.2.4-alpine', name: 'Redis 7.2.4イメージ' },
                { condition: redis?.restart === 'always', name: '本番用restart設定' },
                { condition: redis?.security_opt?.includes('no-new-privileges:true'), name: 'セキュリティ設定' },
                { condition: redis?.read_only === true, name: 'Read-only設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Redis本番サービス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * バックエンド本番サービス確認
     */
    testBackendService(backend) {
        const testName = 'バックエンド本番サービス設定確認';
        try {
            const checks = [
                { condition: backend?.environment?.NODE_ENV === 'production', name: '本番環境設定' },
                { condition: backend?.restart === 'always', name: '本番用restart設定' },
                { condition: backend?.security_opt?.includes('no-new-privileges:true'), name: 'セキュリティ設定' },
                { condition: backend?.read_only === true, name: 'Read-only設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ バックエンド本番サービス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * フロントエンド本番サービス確認
     */
    testFrontendService(frontend) {
        const testName = 'フロントエンド本番サービス設定確認';
        try {
            const checks = [
                { condition: frontend?.environment?.NODE_ENV === 'production', name: '本番環境設定' },
                { condition: frontend?.restart === 'always', name: '本番用restart設定' },
                { condition: frontend?.security_opt?.includes('no-new-privileges:true'), name: 'セキュリティ設定' },
                { condition: frontend?.read_only === true, name: 'Read-only設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ フロントエンド本番サービス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 本番ネットワーク設定確認
     */
    async testProductionNetworkConfiguration() {
        const testName = '本番ネットワーク設定の確認';
        try {
            const networks = this.composeConfig?.networks;
            const checks = [
                { condition: networks?.['task-management-prod']?.driver === 'bridge', name: '本番用ブリッジネットワーク設定' },
                { condition: networks?.['task-management-internal']?.internal === true, name: '内部ネットワーク分離設定' },
                { condition: networks?.['task-management-prod']?.ipam?.config?.[0]?.subnet === '172.22.0.0/16', name: '本番用サブネット設定' },
                { condition: networks?.['task-management-internal']?.ipam?.config?.[0]?.subnet === '172.23.0.0/16', name: '内部サブネット設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 本番ネットワーク設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 本番ボリューム設定確認
     */
    async testProductionVolumeConfiguration() {
        const testName = '本番ボリューム設定の確認';
        try {
            const volumes = this.composeConfig?.volumes;
            const requiredProdVolumes = [
                'postgres_prod_data',
                'redis_prod_data',
                'nginx_ssl_certs',
                'app_logs',
                'backup_data',
                'monitoring_data'
            ];

            const missingVolumes = requiredProdVolumes.filter(volume => !volumes?.[volume]);
            const passed = missingVolumes.length === 0;
            
            const message = passed 
                ? '✅ 必要な本番ボリュームがすべて定義されています'
                : `❌ 不足本番ボリューム: ${missingVolumes.join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * セキュリティ設定確認
     */
    async testSecurityConfiguration() {
        const testName = 'セキュリティ設定の確認';
        try {
            const content = fs.readFileSync(this.composeFilePath, 'utf8');
            const checks = [
                { condition: content.includes('no-new-privileges:true'), name: 'no-new-privileges設定' },
                { condition: content.includes('read_only: true'), name: 'Read-only設定' },
                { condition: content.includes('internal: true'), name: '内部ネットワーク分離' },
                { condition: content.includes('${POSTGRES_PASSWORD}'), name: 'パスワード環境変数化' },
                { condition: content.includes('${JWT_SECRET}'), name: 'JWT秘密鍵環境変数化' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ セキュリティ設定が正しいです'
                : `❌ セキュリティ設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 監視設定確認
     */
    async testMonitoringConfiguration() {
        const testName = '監視設定の確認';
        try {
            const services = this.composeConfig?.services;
            const checks = [
                { condition: services?.prometheus?.image?.includes('prom/prometheus'), name: 'Prometheus監視' },
                { condition: services?.grafana?.image?.includes('grafana/grafana'), name: 'Grafana可視化' },
                { condition: services?.fluentd?.image?.includes('fluent/fluentd'), name: 'Fluentdログ集約' },
                { condition: services?.healthcheck?.image?.includes('alpine'), name: 'ヘルスチェック' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 監視設定が正しいです'
                : `❌ 監視設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * バックアップ設定確認
     */
    async testBackupConfiguration() {
        const testName = 'バックアップ設定の確認';
        try {
            const services = this.composeConfig?.services;
            const checks = [
                { condition: services?.backup?.image?.includes('postgres'), name: 'バックアップサービス' },
                { condition: services?.backup?.restart === 'no', name: 'バックアップ用restart設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ バックアップ設定が正しいです'
                : `❌ バックアップ設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * スケーラビリティ設定確認
     */
    async testScalabilityConfiguration() {
        const testName = 'スケーラビリティ設定の確認';
        try {
            const content = fs.readFileSync(this.composeFilePath, 'utf8');
            const checks = [
                { condition: content.includes('deploy:'), name: 'デプロイ設定' },
                { condition: content.includes('resources:'), name: 'リソース制限' },
                { condition: content.includes('limits:'), name: 'リソース上限' },
                { condition: content.includes('reservations:'), name: 'リソース予約' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ スケーラビリティ設定が正しいです'
                : `❌ スケーラビリティ設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 環境変数確認
     */
    async testEnvironmentVariables() {
        const testName = '環境変数設定の確認';
        try {
            const content = fs.readFileSync(this.composeFilePath, 'utf8');
            const checks = [
                { condition: content.includes('${POSTGRES_PASSWORD}'), name: 'PostgreSQLパスワード' },
                { condition: content.includes('${JWT_SECRET}'), name: 'JWT秘密鍵' },
                { condition: content.includes('${REDIS_PASSWORD}'), name: 'Redisパスワード' },
                { condition: content.includes('${GRAFANA_ADMIN_PASSWORD}'), name: 'Grafana管理者パスワード' },
                { condition: content.includes('TZ: UTC'), name: 'UTC時刻設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 必要な環境変数がすべて設定されています'
                : `❌ 不足環境変数: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
        console.log('\n======================================================');
        console.log('📊 テスト結果サマリー');
        console.log('======================================================');
        
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
        console.log('\n📋 Docker Compose Production設定情報:');
        try {
            const content = fs.readFileSync(this.composeFilePath, 'utf8');
            const lines = content.split('\n').length;
            const services = Object.keys(this.composeConfig?.services || {}).length;
            const volumes = Object.keys(this.composeConfig?.volumes || {}).length;
            const networks = Object.keys(this.composeConfig?.networks || {}).length;
            
            console.log(`  - 総行数: ${lines}`);
            console.log(`  - 本番サービス数: ${services}`);
            console.log(`  - 本番ボリューム数: ${volumes}`);
            console.log(`  - 本番ネットワーク数: ${networks}`);
        } catch (error) {
            console.log('  - 設定情報取得エラー');
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new DockerComposeProdTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = DockerComposeProdTest;
