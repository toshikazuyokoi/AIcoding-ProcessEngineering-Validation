#!/usr/bin/env node

/**
 * Redis Configuration Test Script
 * TSK-014-INF-redis-config テスト実行
 * 
 * このスクリプトはinfrastructure/docker/redis/redis.confの内容と構成を検証します
 */

const fs = require('fs');
const path = require('path');

class RedisConfigTest {
    constructor() {
        this.testResults = [];
        this.configPath = path.join(process.cwd(), 'infrastructure/docker/redis/redis.conf');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 Redis Configuration テスト開始');
        console.log('==========================================');

        try {
            await this.testFileExists();
            await this.testConfigStructure();
            await this.testBasicConfiguration();
            await this.testSnapshotConfiguration();
            await this.testSecurityConfiguration();
            await this.testMemoryManagement();
            await this.testPersistenceConfiguration();
            await this.testPerformanceSettings();
            await this.testConnectionSettings();
            await this.testMonitoringSettings();
            await this.testDevelopmentSettings();
            await this.testAdvancedConfiguration();
            
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
        const testName = 'redis.confファイルの存在確認';
        try {
            const exists = fs.existsSync(this.configPath);
            this.addTestResult(testName, exists, exists ? '✅ ファイルが存在します' : '❌ ファイルが存在しません');
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 設定構造確認
     */
    async testConfigStructure() {
        const testName = 'Redis設定構造の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('# ==================================='), name: 'セクション分割コメント' },
                { condition: content.includes('bind'), name: 'bind設定' },
                { condition: content.includes('port'), name: 'port設定' },
                { condition: content.includes('save'), name: 'save設定' },
                { condition: content.includes('maxmemory'), name: 'maxmemory設定' },
                { condition: content.includes('appendonly'), name: 'appendonly設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Redis設定構造が正しいです'
                : `❌ 不正構造: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 基本設定確認
     */
    async testBasicConfiguration() {
        const testName = '基本設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('bind 0.0.0.0'), name: 'bind設定（開発用）' },
                { condition: content.includes('port 6379'), name: 'デフォルトポート設定' },
                { condition: content.includes('tcp-backlog 511'), name: 'TCP backlog設定' },
                { condition: content.includes('tcp-keepalive 300'), name: 'TCP keepalive設定' },
                { condition: content.includes('databases 16'), name: 'データベース数設定' },
                { condition: content.includes('loglevel notice'), name: 'ログレベル設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 基本設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * スナップショット設定確認
     */
    async testSnapshotConfiguration() {
        const testName = 'スナップショット設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('save 900 1'), name: '900秒1変更でsave' },
                { condition: content.includes('save 300 10'), name: '300秒10変更でsave' },
                { condition: content.includes('save 60 10000'), name: '60秒10000変更でsave' },
                { condition: content.includes('rdbcompression yes'), name: 'RDB圧縮有効' },
                { condition: content.includes('rdbchecksum yes'), name: 'RDBチェックサム有効' },
                { condition: content.includes('dbfilename dump.rdb'), name: 'RDBファイル名設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ スナップショット設定が正しいです'
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
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('protected-mode no'), name: 'プロテクトモード無効（開発用）' },
                { condition: content.includes('# requirepass'), name: 'パスワード設定（コメント化）' },
                { condition: content.includes('# rename-command'), name: '危険コマンド名前変更（コメント化）' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ セキュリティ設定が正しいです（開発環境用）'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * メモリ管理確認
     */
    async testMemoryManagement() {
        const testName = 'メモリ管理設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('maxmemory 512mb'), name: 'メモリ制限設定（512MB）' },
                { condition: content.includes('maxmemory-policy allkeys-lru'), name: 'メモリポリシー（LRU）' },
                { condition: content.includes('maxmemory-samples 5'), name: 'LRUサンプル数設定' },
                { condition: content.includes('lazyfree-lazy-eviction'), name: 'Lazy freeing設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ メモリ管理設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 永続化設定確認
     */
    async testPersistenceConfiguration() {
        const testName = '永続化設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('appendonly yes'), name: 'AOF有効化' },
                { condition: content.includes('appendfilename "appendonly.aof"'), name: 'AOFファイル名設定' },
                { condition: content.includes('appendfsync everysec'), name: 'AOF同期ポリシー（毎秒）' },
                { condition: content.includes('auto-aof-rewrite-percentage 100'), name: 'AOF自動リライト設定' },
                { condition: content.includes('aof-use-rdb-preamble yes'), name: 'RDB-AOFハイブリッド有効' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 永続化設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * パフォーマンス設定確認
     */
    async testPerformanceSettings() {
        const testName = 'パフォーマンス設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('lua-time-limit 5000'), name: 'Luaスクリプト実行時間制限' },
                { condition: content.includes('slowlog-log-slower-than 10000'), name: 'スローログ閾値設定' },
                { condition: content.includes('slowlog-max-len 128'), name: 'スローログ最大長設定' },
                { condition: content.includes('activerehashing yes'), name: 'アクティブリハッシュ有効' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ パフォーマンス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 接続設定確認
     */
    async testConnectionSettings() {
        const testName = '接続設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('maxclients 10000'), name: '最大クライアント数設定' },
                { condition: content.includes('timeout 300'), name: 'クライアントタイムアウト設定' },
                { condition: content.includes('client-output-buffer-limit'), name: 'クライアント出力バッファ制限' },
                { condition: content.includes('client-query-buffer-limit 1gb'), name: 'クライアントクエリバッファ制限' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 接続設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 監視設定確認
     */
    async testMonitoringSettings() {
        const testName = '監視設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('latency-monitor-threshold 100'), name: 'レイテンシ監視閾値設定' },
                { condition: content.includes('notify-keyspace-events "Ex"'), name: 'キースペース通知設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 監視設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 開発環境設定確認
     */
    async testDevelopmentSettings() {
        const testName = '開発環境設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('Development'), name: '開発環境コメント' },
                { condition: content.includes('# save ""'), name: '開発用RDB無効化オプション（コメント化）' },
                { condition: content.includes('Development Notes'), name: '開発ノートセクション' },
                { condition: content.includes('For production use, consider:'), name: '本番環境への注意事項' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 開発環境設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 高度な設定確認
     */
    async testAdvancedConfiguration() {
        const testName = '高度な設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('hash-max-ziplist-entries'), name: 'ハッシュ最適化設定' },
                { condition: content.includes('list-max-ziplist-size'), name: 'リスト最適化設定' },
                { condition: content.includes('set-max-intset-entries'), name: 'セット最適化設定' },
                { condition: content.includes('zset-max-ziplist-entries'), name: 'ソート済みセット最適化設定' },
                { condition: content.includes('stream-node-max-bytes'), name: 'ストリーム設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 高度な設定が正しいです'
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
        console.log('\n📋 Redis Configuration設定情報:');
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            const lines = content.split('\n');
            const configLines = lines.filter(line => line.trim() && !line.trim().startsWith('#'));
            const commentLines = lines.filter(line => line.trim().startsWith('#'));
            
            console.log(`  - 総行数: ${lines.length}`);
            console.log(`  - 設定行数: ${configLines.length}`);
            console.log(`  - コメント行数: ${commentLines.length}`);
            console.log(`  - ファイルサイズ: ${Buffer.byteLength(content, 'utf8')} bytes`);
        } catch (error) {
            console.log('  - 設定情報取得エラー');
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new RedisConfigTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = RedisConfigTest;
