#!/usr/bin/env node

/**
 * PostgreSQL Dockerfile Test Script
 * TSK-012-INF-postgres-dockerfile テスト実行
 * 
 * このスクリプトはinfrastructure/docker/postgres/Dockerfileの内容と構成を検証します
 */

const fs = require('fs');
const path = require('path');

class PostgresDockerfileTest {
    constructor() {
        this.testResults = [];
        this.dockerfilePath = path.join(process.cwd(), 'infrastructure/docker/postgres/Dockerfile');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 PostgreSQL Dockerfile テスト開始');
        console.log('==========================================');

        try {
            await this.testFileExists();
            await this.testDockerfileStructure();
            await this.testBaseConfiguration();
            await this.testMultiStageBuilds();
            await this.testDevelopmentStage();
            await this.testTestStage();
            await this.testProductionStage();
            await this.testBackupStage();
            await this.testMonitoringStage();
            await this.testSecurityConfiguration();
            await this.testHealthChecks();
            await this.testPerformanceOptimization();
            
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
        const testName = 'Dockerfileファイルの存在確認';
        try {
            const exists = fs.existsSync(this.dockerfilePath);
            this.addTestResult(testName, exists, exists ? '✅ ファイルが存在します' : '❌ ファイルが存在しません');
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Dockerfile構造確認
     */
    async testDockerfileStructure() {
        const testName = 'Dockerfile構造の確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('FROM postgres:16.1-alpine AS base'), name: 'PostgreSQL 16.1 Alpine基盤' },
                { condition: content.includes('AS development'), name: 'development ステージ' },
                { condition: content.includes('AS test'), name: 'test ステージ' },
                { condition: content.includes('AS production'), name: 'production ステージ' },
                { condition: content.includes('AS backup'), name: 'backup ステージ' },
                { condition: content.includes('AS monitoring'), name: 'monitoring ステージ' },
                { condition: content.includes('LABEL maintainer'), name: 'メタデータ設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Dockerfile構造が正しいです'
                : `❌ 不正構造: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * ベース設定確認
     */
    async testBaseConfiguration() {
        const testName = 'ベース設定の確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('apk add --no-cache'), name: 'Alpine パッケージ管理' },
                { condition: content.includes('curl'), name: 'curl インストール' },
                { condition: content.includes('ca-certificates'), name: 'CA証明書' },
                { condition: content.includes('postgresql-contrib'), name: 'PostgreSQL拡張' },
                { condition: content.includes('pg_stat_statements'), name: 'パフォーマンス監視拡張' },
                { condition: content.includes('rm -rf /var/cache/apk/*'), name: 'キャッシュクリーンアップ' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ ベース設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * マルチステージビルド確認
     */
    async testMultiStageBuilds() {
        const testName = 'マルチステージビルドの確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const stages = (content.match(/FROM.*AS \w+/g) || []).length;
            const expectedStages = 6; // base, development, test, production, backup, monitoring
            
            const passed = stages >= expectedStages;
            
            const message = passed 
                ? `✅ マルチステージビルドが正しく設定されています (${stages}ステージ)`
                : `❌ ステージ数不足: ${stages}/${expectedStages}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 開発ステージ確認
     */
    async testDevelopmentStage() {
        const testName = '開発ステージの確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('ENV POSTGRES_DB=taskdb_dev'), name: '開発DB名設定' },
                { condition: content.includes('ENV TZ=Asia/Tokyo'), name: '開発タイムゾーン設定' },
                { condition: content.includes('postgresql-dev.conf'), name: '開発用設定ファイル' },
                { condition: content.includes('init-dev.sql'), name: '開発用初期化スクリプト' },
                { condition: content.includes('postgresql-dev'), name: '開発ツール' },
                { condition: content.includes('--interval=10s'), name: '開発用ヘルスチェック' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 開発ステージが正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * テストステージ確認
     */
    async testTestStage() {
        const testName = 'テストステージの確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('ENV POSTGRES_DB=taskdb_test'), name: 'テストDB名設定' },
                { condition: content.includes('ENV POSTGRES_USER=test_user'), name: 'テストユーザー設定' },
                { condition: content.includes('fsync = off'), name: 'テスト用パフォーマンス最適化' },
                { condition: content.includes('test-data.sql'), name: 'テストデータ初期化' },
                { condition: content.includes('--interval=5s'), name: 'テスト用高速ヘルスチェック' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ テストステージが正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 本番ステージ確認
     */
    async testProductionStage() {
        const testName = '本番ステージの確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('ENV POSTGRES_DB=taskdb'), name: '本番DB名設定' },
                { condition: content.includes('ENV TZ=UTC'), name: 'UTC タイムゾーン設定' },
                { condition: content.includes('postgresql-prod.conf'), name: '本番用設定ファイル' },
                { condition: content.includes('logrotate'), name: 'ログローテーション' },
                { condition: content.includes('backup.sh'), name: 'バックアップスクリプト' },
                { condition: content.includes('monitoring.sh'), name: '監視スクリプト' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 本番ステージが正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * バックアップステージ確認
     */
    async testBackupStage() {
        const testName = 'バックアップステージの確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('ENV BACKUP_SCHEDULE'), name: 'バックアップスケジュール設定' },
                { condition: content.includes('ENV BACKUP_RETENTION_DAYS'), name: 'バックアップ保持期間設定' },
                { condition: content.includes('cron'), name: 'cron インストール' },
                { condition: content.includes('aws-cli'), name: 'AWS CLI インストール' },
                { condition: content.includes('backup-cron.sh'), name: 'バックアップcronスクリプト' },
                { condition: content.includes('/etc/crontabs/postgres'), name: 'cron設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ バックアップステージが正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 監視ステージ確認
     */
    async testMonitoringStage() {
        const testName = '監視ステージの確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('ENV MONITORING_ENABLED'), name: '監視有効化設定' },
                { condition: content.includes('ENV METRICS_PORT=9187'), name: 'メトリクスポート設定' },
                { condition: content.includes('prometheus-postgres-exporter'), name: 'Prometheus Exporter' },
                { condition: content.includes('postgres-exporter.yml'), name: 'Exporter設定ファイル' },
                { condition: content.includes('EXPOSE 9187'), name: '監視ポート公開' },
                { condition: content.includes('metrics-collector.sh'), name: 'メトリクス収集スクリプト' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 監視ステージが正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('chown -R postgres:postgres'), name: 'ファイル所有権設定' },
                { condition: content.includes('chmod 600'), name: 'ファイル権限設定' },
                { condition: content.includes('.pgpass'), name: 'PostgreSQL認証ファイル' },
                { condition: content.includes('pg_hba'), name: 'ホストベース認証設定' },
                { condition: content.includes('chmod +x'), name: 'スクリプト実行権限' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ セキュリティ設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * ヘルスチェック確認
     */
    async testHealthChecks() {
        const testName = 'ヘルスチェック設定の確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const healthChecks = (content.match(/HEALTHCHECK/g) || []).length;
            const expectedHealthChecks = 6; // 各ステージに1つずつ
            
            const checks = [
                { condition: healthChecks >= expectedHealthChecks, name: 'ヘルスチェック数' },
                { condition: content.includes('pg_isready'), name: 'PostgreSQL準備確認' },
                { condition: content.includes('--interval='), name: 'ヘルスチェック間隔設定' },
                { condition: content.includes('--timeout='), name: 'ヘルスチェックタイムアウト設定' },
                { condition: content.includes('--retries='), name: 'ヘルスチェックリトライ設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? `✅ ヘルスチェック設定が正しいです (${healthChecks}個)`
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * パフォーマンス最適化確認
     */
    async testPerformanceOptimization() {
        const testName = 'パフォーマンス最適化の確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('pg_stat_statements'), name: 'クエリ統計拡張' },
                { condition: content.includes('postgresql-contrib'), name: 'PostgreSQL拡張モジュール' },
                { condition: content.includes('fsync = off'), name: 'テスト用高速化設定' },
                { condition: content.includes('synchronous_commit = off'), name: 'テスト用同期無効化' },
                { condition: content.includes('archive'), name: 'WALアーカイブ設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ パフォーマンス最適化が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
        console.log('\n==========================================');
        console.log('📊 テスト結果サマリー');
        console.log('==========================================');
        
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
        console.log('\n📋 PostgreSQL Dockerfile設定情報:');
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            const lines = content.split('\n');
            const stages = (content.match(/FROM.*AS \w+/g) || []).length;
            const healthChecks = (content.match(/HEALTHCHECK/g) || []).length;
            const exposes = (content.match(/EXPOSE/g) || []).length;
            
            console.log(`  - 総行数: ${lines.length}`);
            console.log(`  - ステージ数: ${stages}`);
            console.log(`  - ヘルスチェック数: ${healthChecks}`);
            console.log(`  - 公開ポート数: ${exposes}`);
            console.log(`  - ファイルサイズ: ${Buffer.byteLength(content, 'utf8')} bytes`);
        } catch (error) {
            console.log('  - 設定情報取得エラー');
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new PostgresDockerfileTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = PostgresDockerfileTest;
