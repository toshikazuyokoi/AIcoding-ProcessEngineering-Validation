#!/usr/bin/env node

/**
 * PostgreSQL Init SQL Test Script
 * TSK-013-INF-postgres-init テスト実行
 * 
 * このスクリプトはinfrastructure/docker/postgres/init.sqlの内容と構成を検証します
 */

const fs = require('fs');
const path = require('path');

class PostgresInitTest {
    constructor() {
        this.testResults = [];
        this.initSqlPath = path.join(process.cwd(), 'infrastructure/docker/postgres/init.sql');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 PostgreSQL Init SQL テスト開始');
        console.log('==========================================');

        try {
            await this.testFileExists();
            await this.testSqlStructure();
            await this.testExtensionsInstallation();
            await this.testDatabaseConfiguration();
            await this.testUserCreation();
            await this.testPermissionsSetup();
            await this.testSchemaCreation();
            await this.testFunctionCreation();
            await this.testMonitoringTables();
            await this.testIndexCreation();
            await this.testSecuritySettings();
            await this.testDevelopmentFeatures();
            
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
        const testName = 'init.sqlファイルの存在確認';
        try {
            const exists = fs.existsSync(this.initSqlPath);
            this.addTestResult(testName, exists, exists ? '✅ ファイルが存在します' : '❌ ファイルが存在しません');
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * SQL構造確認
     */
    async testSqlStructure() {
        const testName = 'SQL構造の確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes('-- ==================================='), name: 'セクション分割コメント' },
                { condition: content.includes('\\echo'), name: 'PostgreSQL echo コマンド' },
                { condition: content.includes('CREATE EXTENSION'), name: '拡張機能作成' },
                { condition: content.includes('CREATE ROLE'), name: 'ロール作成' },
                { condition: content.includes('GRANT'), name: '権限付与' },
                { condition: content.includes('CREATE SCHEMA'), name: 'スキーマ作成' },
                { condition: content.includes('CREATE TABLE'), name: 'テーブル作成' },
                { condition: content.includes('CREATE INDEX'), name: 'インデックス作成' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ SQL構造が正しいです'
                : `❌ 不正構造: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 拡張機能インストール確認
     */
    async testExtensionsInstallation() {
        const testName = '拡張機能インストールの確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'), name: 'UUID拡張' },
                { condition: content.includes('CREATE EXTENSION IF NOT EXISTS pg_stat_statements'), name: 'パフォーマンス監視拡張' },
                { condition: content.includes('CREATE EXTENSION IF NOT EXISTS pg_trgm'), name: '全文検索拡張' },
                { condition: content.includes('CREATE EXTENSION IF NOT EXISTS pgcrypto'), name: '暗号化拡張' },
                { condition: content.includes('CREATE EXTENSION IF NOT EXISTS btree_gin'), name: 'btree_gin拡張' },
                { condition: content.includes('CREATE EXTENSION IF NOT EXISTS btree_gist'), name: 'btree_gist拡張' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 拡張機能インストールが正しいです'
                : `❌ 不正拡張機能: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * データベース設定確認
     */
    async testDatabaseConfiguration() {
        const testName = 'データベース設定の確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes("SET timezone = 'Asia/Tokyo'"), name: 'タイムゾーン設定' },
                { condition: content.includes("ALTER SYSTEM SET log_statement = 'all'"), name: 'ログ設定' },
                { condition: content.includes('ALTER SYSTEM SET shared_preload_libraries'), name: '共有ライブラリ設定' },
                { condition: content.includes('SELECT pg_reload_conf()'), name: '設定リロード' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ データベース設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * ユーザー作成確認
     */
    async testUserCreation() {
        const testName = 'ユーザー作成の確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes("rolname = 'taskapp_dev'"), name: 'アプリケーションユーザー' },
                { condition: content.includes("rolname = 'taskapp_readonly_dev'"), name: '読み取り専用ユーザー' },
                { condition: content.includes("rolname = 'taskapp_backup_dev'"), name: 'バックアップユーザー' },
                { condition: content.includes('CONNECTION LIMIT'), name: '接続制限設定' },
                { condition: content.includes('NOSUPERUSER'), name: 'セキュリティ設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ ユーザー作成が正しいです'
                : `❌ 不正ユーザー設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 権限設定確認
     */
    async testPermissionsSetup() {
        const testName = '権限設定の確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes('GRANT CONNECT ON DATABASE'), name: 'データベース接続権限' },
                { condition: content.includes('GRANT USAGE ON SCHEMA'), name: 'スキーマ使用権限' },
                { condition: content.includes('GRANT CREATE ON SCHEMA'), name: 'スキーマ作成権限' },
                { condition: content.includes('TO taskapp_dev'), name: 'アプリユーザー権限' },
                { condition: content.includes('TO taskapp_readonly_dev'), name: '読み取り専用権限' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 権限設定が正しいです'
                : `❌ 不正権限設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * スキーマ作成確認
     */
    async testSchemaCreation() {
        const testName = 'スキーマ作成の確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes('CREATE SCHEMA IF NOT EXISTS audit'), name: '監査スキーマ' },
                { condition: content.includes('CREATE SCHEMA IF NOT EXISTS monitoring'), name: '監視スキーマ' },
                { condition: content.includes('CREATE SCHEMA IF NOT EXISTS backup'), name: 'バックアップスキーマ' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ スキーマ作成が正しいです'
                : `❌ 不正スキーマ: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 関数作成確認
     */
    async testFunctionCreation() {
        const testName = '関数作成の確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes('CREATE OR REPLACE FUNCTION public.uuid_generate_v4()'), name: 'UUID生成関数' },
                { condition: content.includes('CREATE OR REPLACE FUNCTION public.update_updated_at_column()'), name: 'タイムスタンプ更新関数' },
                { condition: content.includes('CREATE OR REPLACE FUNCTION monitoring.log_query_performance'), name: 'パフォーマンスログ関数' },
                { condition: content.includes('LANGUAGE plpgsql'), name: 'PL/pgSQL言語' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 関数作成が正しいです'
                : `❌ 不正関数: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 監視テーブル確認
     */
    async testMonitoringTables() {
        const testName = '監視テーブルの確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes('CREATE TABLE IF NOT EXISTS monitoring.query_log'), name: 'クエリログテーブル' },
                { condition: content.includes('CREATE TABLE IF NOT EXISTS monitoring.app_metrics'), name: 'アプリメトリクステーブル' },
                { condition: content.includes('CREATE TABLE IF NOT EXISTS monitoring.error_log'), name: 'エラーログテーブル' },
                { condition: content.includes('TIMESTAMP WITH TIME ZONE'), name: 'タイムゾーン付きタイムスタンプ' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 監視テーブルが正しいです'
                : `❌ 不正テーブル: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * インデックス作成確認
     */
    async testIndexCreation() {
        const testName = 'インデックス作成の確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes('CREATE INDEX IF NOT EXISTS idx_query_log_logged_at'), name: 'クエリログ時刻インデックス' },
                { condition: content.includes('CREATE INDEX IF NOT EXISTS idx_app_metrics_metric_name'), name: 'メトリクス名インデックス' },
                { condition: content.includes('CREATE INDEX IF NOT EXISTS idx_error_log_error_type'), name: 'エラータイプインデックス' },
                { condition: content.includes('CREATE INDEX IF NOT EXISTS idx_error_log_user_id'), name: 'ユーザーIDインデックス' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ インデックス作成が正しいです'
                : `❌ 不正インデックス: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * セキュリティ設定確認
     */
    async testSecuritySettings() {
        const testName = 'セキュリティ設定の確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes('NOSUPERUSER'), name: 'スーパーユーザー無効化' },
                { condition: content.includes('NOCREATEDB'), name: 'DB作成権限無効化' },
                { condition: content.includes('NOCREATEROLE'), name: 'ロール作成権限無効化' },
                { condition: content.includes('CONNECTION LIMIT'), name: '接続数制限' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ セキュリティ設定が正しいです'
                : `❌ 不正セキュリティ設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 開発環境機能確認
     */
    async testDevelopmentFeatures() {
        const testName = '開発環境機能の確認';
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            
            const checks = [
                { condition: content.includes('taskdb_dev'), name: '開発データベース名' },
                { condition: content.includes('dev_password'), name: '開発用パスワード' },
                { condition: content.includes('CREATE SEQUENCE'), name: 'シーケンス作成' },
                { condition: content.includes('Development'), name: '開発環境コメント' },
                { condition: content.includes('Ready for Prisma migration'), name: 'Prisma準備完了メッセージ' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 開発環境機能が正しいです'
                : `❌ 不正開発機能: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
        console.log('\n📋 PostgreSQL Init SQL設定情報:');
        try {
            const content = fs.readFileSync(this.initSqlPath, 'utf8');
            const lines = content.split('\n');
            const extensions = (content.match(/CREATE EXTENSION/g) || []).length;
            const users = (content.match(/CREATE ROLE/g) || []).length;
            const schemas = (content.match(/CREATE SCHEMA/g) || []).length;
            const functions = (content.match(/CREATE OR REPLACE FUNCTION/g) || []).length;
            const tables = (content.match(/CREATE TABLE/g) || []).length;
            const indexes = (content.match(/CREATE INDEX/g) || []).length;
            
            console.log(`  - 総行数: ${lines.length}`);
            console.log(`  - 拡張機能数: ${extensions}`);
            console.log(`  - ユーザー数: ${users}`);
            console.log(`  - スキーマ数: ${schemas}`);
            console.log(`  - 関数数: ${functions}`);
            console.log(`  - テーブル数: ${tables}`);
            console.log(`  - インデックス数: ${indexes}`);
            console.log(`  - ファイルサイズ: ${Buffer.byteLength(content, 'utf8')} bytes`);
        } catch (error) {
            console.log('  - 設定情報取得エラー');
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new PostgresInitTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = PostgresInitTest;
