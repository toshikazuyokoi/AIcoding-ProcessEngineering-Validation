#!/usr/bin/env node

/**
 * Nginx Configuration Test Script
 * TSK-015-INF-nginx-config テスト実行
 * 
 * このスクリプトはinfrastructure/docker/nginx/nginx.confの内容と構成を検証します
 */

const fs = require('fs');
const path = require('path');

class NginxConfigTest {
    constructor() {
        this.testResults = [];
        this.configPath = path.join(process.cwd(), 'infrastructure/docker/nginx/nginx.conf');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 Nginx Configuration テスト開始');
        console.log('==========================================');

        try {
            await this.testFileExists();
            await this.testConfigStructure();
            await this.testBasicConfiguration();
            await this.testPerformanceSettings();
            await this.testSecurityConfiguration();
            await this.testSSLConfiguration();
            await this.testUpstreamConfiguration();
            await this.testRateLimiting();
            await this.testProxyConfiguration();
            await this.testStaticFileHandling();
            await this.testErrorHandling();
            await this.testHealthChecks();
            
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
        const testName = 'nginx.confファイルの存在確認';
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
        const testName = 'Nginx設定構造の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('user nginx'), name: 'user設定' },
                { condition: content.includes('worker_processes'), name: 'worker_processes設定' },
                { condition: content.includes('events {'), name: 'eventsブロック' },
                { condition: content.includes('http {'), name: 'httpブロック' },
                { condition: content.includes('server {'), name: 'serverブロック' },
                { condition: content.includes('upstream'), name: 'upstreamブロック' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Nginx設定構造が正しいです'
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
                { condition: content.includes('worker_processes auto'), name: 'auto worker processes' },
                { condition: content.includes('worker_connections 1024'), name: 'worker connections設定' },
                { condition: content.includes('server_tokens off'), name: 'server tokens無効化' },
                { condition: content.includes('sendfile on'), name: 'sendfile有効化' },
                { condition: content.includes('tcp_nopush on'), name: 'tcp_nopush有効化' },
                { condition: content.includes('keepalive_timeout'), name: 'keepalive timeout設定' }
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
     * パフォーマンス設定確認
     */
    async testPerformanceSettings() {
        const testName = 'パフォーマンス設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('gzip on'), name: 'gzip圧縮有効' },
                { condition: content.includes('gzip_comp_level'), name: 'gzip圧縮レベル設定' },
                { condition: content.includes('gzip_types'), name: 'gzip対象ファイルタイプ設定' },
                { condition: content.includes('client_max_body_size'), name: 'クライアント最大ボディサイズ設定' },
                { condition: content.includes('proxy_buffering on'), name: 'プロキシバッファリング有効' }
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
     * セキュリティ設定確認
     */
    async testSecurityConfiguration() {
        const testName = 'セキュリティ設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('X-Frame-Options'), name: 'X-Frame-Optionsヘッダー' },
                { condition: content.includes('X-Content-Type-Options'), name: 'X-Content-Type-Optionsヘッダー' },
                { condition: content.includes('X-XSS-Protection'), name: 'X-XSS-Protectionヘッダー' },
                { condition: content.includes('Content-Security-Policy'), name: 'CSPヘッダー' },
                { condition: content.includes('Strict-Transport-Security'), name: 'HSTSヘッダー' }
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
     * SSL設定確認
     */
    async testSSLConfiguration() {
        const testName = 'SSL設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('listen 443 ssl http2'), name: 'HTTPS HTTP/2設定' },
                { condition: content.includes('ssl_protocols TLSv1.2 TLSv1.3'), name: 'SSL プロトコル設定' },
                { condition: content.includes('ssl_ciphers'), name: 'SSL暗号化設定' },
                { condition: content.includes('ssl_session_cache'), name: 'SSLセッションキャッシュ' },
                { condition: content.includes('return 301 https://'), name: 'HTTPS リダイレクト' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ SSL設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * アップストリーム設定確認
     */
    async testUpstreamConfiguration() {
        const testName = 'アップストリーム設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('upstream backend_api'), name: 'バックエンドアップストリーム' },
                { condition: content.includes('upstream frontend_app'), name: 'フロントエンドアップストリーム' },
                { condition: content.includes('least_conn'), name: 'ロードバランシング設定' },
                { condition: content.includes('server backend:8000'), name: 'バックエンドサーバー設定' },
                { condition: content.includes('server frontend:3000'), name: 'フロントエンドサーバー設定' },
                { condition: content.includes('keepalive'), name: 'keepalive設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ アップストリーム設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * レート制限確認
     */
    async testRateLimiting() {
        const testName = 'レート制限設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('limit_req_zone'), name: 'レート制限ゾーン定義' },
                { condition: content.includes('zone=api:10m rate=10r/s'), name: 'API レート制限設定' },
                { condition: content.includes('zone=login:10m rate=1r/s'), name: 'ログインレート制限設定' },
                { condition: content.includes('limit_req zone=api'), name: 'API レート制限適用' },
                { condition: content.includes('limit_req zone=login'), name: 'ログインレート制限適用' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ レート制限設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * プロキシ設定確認
     */
    async testProxyConfiguration() {
        const testName = 'プロキシ設定の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('location /api/'), name: 'API プロキシ設定' },
                { condition: content.includes('proxy_pass http://backend_api'), name: 'バックエンドプロキシパス' },
                { condition: content.includes('proxy_set_header Host'), name: 'Hostヘッダー設定' },
                { condition: content.includes('proxy_set_header X-Real-IP'), name: 'Real-IPヘッダー設定' },
                { condition: content.includes('proxy_set_header X-Forwarded-For'), name: 'Forwarded-Forヘッダー設定' },
                { condition: content.includes('proxy_connect_timeout'), name: 'プロキシタイムアウト設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ プロキシ設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 静的ファイル処理確認
     */
    async testStaticFileHandling() {
        const testName = '静的ファイル処理の確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('location ~* \\.(js|css|png|jpg'), name: '静的ファイルロケーション設定' },
                { condition: content.includes('expires 1y'), name: 'キャッシュ期間設定' },
                { condition: content.includes('Cache-Control "public, immutable"'), name: 'キャッシュコントロールヘッダー' },
                { condition: content.includes('try_files'), name: 'SPA ルーティング対応' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 静的ファイル処理が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * エラーハンドリング確認
     */
    async testErrorHandling() {
        const testName = 'エラーハンドリングの確認';
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('error_page 404'), name: '404エラーページ設定' },
                { condition: content.includes('error_page 500 502 503 504'), name: '5xxエラーページ設定' },
                { condition: content.includes('location = /404.html'), name: '404ページロケーション' },
                { condition: content.includes('location = /50x.html'), name: '5xxページロケーション' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ エラーハンドリングが正しいです'
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
            const content = fs.readFileSync(this.configPath, 'utf8');
            
            const checks = [
                { condition: content.includes('location /health'), name: 'Nginxヘルスチェックエンドポイント' },
                { condition: content.includes('location /api/health'), name: 'バックエンドヘルスチェックプロキシ' },
                { condition: content.includes('return 200 "healthy'), name: 'ヘルスチェックレスポンス' },
                { condition: content.includes('access_log off'), name: 'ヘルスチェックログ無効化' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ ヘルスチェック設定が正しいです'
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
        console.log('\n📋 Nginx Configuration設定情報:');
        try {
            const content = fs.readFileSync(this.configPath, 'utf8');
            const lines = content.split('\n');
            const configLines = lines.filter(line => line.trim() && !line.trim().startsWith('#'));
            const commentLines = lines.filter(line => line.trim().startsWith('#'));
            const locations = (content.match(/location\s+[^{]+{/g) || []).length;
            const upstreams = (content.match(/upstream\s+\w+/g) || []).length;
            
            console.log(`  - 総行数: ${lines.length}`);
            console.log(`  - 設定行数: ${configLines.length}`);
            console.log(`  - コメント行数: ${commentLines.length}`);
            console.log(`  - ロケーション数: ${locations}`);
            console.log(`  - アップストリーム数: ${upstreams}`);
            console.log(`  - ファイルサイズ: ${Buffer.byteLength(content, 'utf8')} bytes`);
        } catch (error) {
            console.log('  - 設定情報取得エラー');
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new NginxConfigTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = NginxConfigTest;
