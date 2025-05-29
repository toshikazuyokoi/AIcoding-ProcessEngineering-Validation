#!/usr/bin/env node

/**
 * Frontend .dockerignore Test Script
 * TSK-010-ENV-frontend-dockerignore テスト実行
 * 
 * このスクリプトはfrontend/.dockerignoreの内容と構成を検証します
 */

const fs = require('fs');
const path = require('path');

class FrontendDockerignoreTest {
    constructor() {
        this.testResults = [];
        this.dockerignorePath = path.join(process.cwd(), 'frontend/.dockerignore');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 Frontend .dockerignore テスト開始');
        console.log('==========================================');

        try {
            await this.testFileExists();
            await this.testNodeJSExclusions();
            await this.testBuildExclusions();
            await this.testDevelopmentExclusions();
            await this.testReactViteExclusions();
            await this.testSecurityExclusions();
            await this.testDocumentationExclusions();
            await this.testInfrastructureExclusions();
            await this.testCacheExclusions();
            await this.testOSExclusions();
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
        const testName = '.dockerignoreファイルの存在確認';
        try {
            const exists = fs.existsSync(this.dockerignorePath);
            this.addTestResult(testName, exists, exists ? '✅ ファイルが存在します' : '❌ ファイルが存在しません');
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Node.js関連除外確認
     */
    async testNodeJSExclusions() {
        const testName = 'Node.js関連ファイル除外の確認';
        try {
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            
            const checks = [
                { condition: content.includes('node_modules/'), name: 'node_modules除外' },
                { condition: content.includes('npm-debug.log'), name: 'npmデバッグログ除外' },
                { condition: content.includes('yarn-debug.log'), name: 'yarnデバッグログ除外' },
                { condition: content.includes('.npm'), name: 'npmキャッシュ除外' },
                { condition: content.includes('package-lock.json') === false, name: 'package-lock.json保持' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Node.js関連ファイル除外が正しいです'
                : `❌ 不正除外設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * ビルド関連除外確認
     */
    async testBuildExclusions() {
        const testName = 'ビルド関連ファイル除外の確認';
        try {
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            
            const checks = [
                { condition: content.includes('dist/'), name: 'distディレクトリ除外' },
                { condition: content.includes('build/'), name: 'buildディレクトリ除外' },
                { condition: content.includes('coverage/'), name: 'coverageディレクトリ除外' },
                { condition: content.includes('*.tsbuildinfo'), name: 'TypeScriptビルド情報除外' },
                { condition: content.includes('.nyc_output/'), name: 'nycカバレッジ除外' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ ビルド関連ファイル除外が正しいです'
                : `❌ 不正除外設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 開発・テスト関連除外確認
     */
    async testDevelopmentExclusions() {
        const testName = '開発・テスト関連ファイル除外の確認';
        try {
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            
            const checks = [
                { condition: content.includes('__tests__/'), name: 'テストディレクトリ除外' },
                { condition: content.includes('*.test.tsx'), name: 'React TypeScriptテストファイル除外' },
                { condition: content.includes('*.spec.jsx'), name: 'React JavaScriptスペックファイル除外' },
                { condition: content.includes('test-results/'), name: 'テスト結果除外' },
                { condition: content.includes('playwright-report/'), name: 'Playwrightレポート除外' },
                { condition: content.includes('e2e/'), name: 'E2Eテストディレクトリ除外' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 開発・テスト関連ファイル除外が正しいです'
                : `❌ 不正除外設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * React・Vite関連除外確認
     */
    async testReactViteExclusions() {
        const testName = 'React・Vite関連ファイル除外の確認';
        try {
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            
            const checks = [
                { condition: content.includes('.vite/'), name: 'Viteキャッシュ除外' },
                { condition: content.includes('vite.config.ts.timestamp-*'), name: 'Viteタイムスタンプファイル除外' },
                { condition: content.includes('.react/'), name: 'Reactキャッシュ除外' },
                { condition: content.includes('.storybook/'), name: 'Storybookディレクトリ除外' },
                { condition: content.includes('storybook-static/'), name: 'Storybookビルド除外' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ React・Vite関連ファイル除外が正しいです'
                : `❌ 不正除外設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * セキュリティ関連除外確認
     */
    async testSecurityExclusions() {
        const testName = 'セキュリティ関連ファイル除外の確認';
        try {
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            
            const checks = [
                { condition: content.includes('.env'), name: '環境変数ファイル除外' },
                { condition: content.includes('*.pem'), name: 'SSL証明書除外' },
                { condition: content.includes('*.key'), name: '秘密鍵除外' },
                { condition: content.includes('id_rsa'), name: 'SSH鍵除外' },
                { condition: content.includes('*.crt'), name: '証明書ファイル除外' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ セキュリティ関連ファイル除外が正しいです'
                : `❌ 不正除外設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * ドキュメント関連除外確認
     */
    async testDocumentationExclusions() {
        const testName = 'ドキュメント関連ファイル除外の確認';
        try {
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            
            const checks = [
                { condition: content.includes('README.md'), name: 'READMEファイル除外' },
                { condition: content.includes('*.md'), name: 'Markdownファイル除外' },
                { condition: content.includes('docs/'), name: 'docsディレクトリ除外' },
                { condition: content.includes('CHANGELOG.md'), name: 'CHANGELOGファイル除外' },
                { condition: content.includes('LICENSE'), name: 'LICENSEファイル除外' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ ドキュメント関連ファイル除外が正しいです'
                : `❌ 不正除外設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * インフラ関連除外確認
     */
    async testInfrastructureExclusions() {
        const testName = 'インフラ関連ファイル除外の確認';
        try {
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            
            const checks = [
                { condition: content.includes('docker-compose'), name: 'Docker Composeファイル除外' },
                { condition: content.includes('Dockerfile.e2e'), name: 'E2E Dockerfileファイル除外' },
                { condition: content.includes('nginx.conf'), name: 'Nginx設定ファイル除外' },
                { condition: content.includes('.github/'), name: 'GitHub Actionsディレクトリ除外' },
                { condition: content.includes('Jenkinsfile'), name: 'Jenkinsファイル除外' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ インフラ関連ファイル除外が正しいです'
                : `❌ 不正除外設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * キャッシュ関連除外確認
     */
    async testCacheExclusions() {
        const testName = 'キャッシュ関連ファイル除外の確認';
        try {
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            
            const checks = [
                { condition: content.includes('.cache/'), name: 'キャッシュディレクトリ除外' },
                { condition: content.includes('tmp/'), name: '一時ディレクトリ除外' },
                { condition: content.includes('.eslintcache'), name: 'ESLintキャッシュ除外' },
                { condition: content.includes('.stylelintcache'), name: 'StyleLintキャッシュ除外' },
                { condition: content.includes('.parcel-cache/'), name: 'Parcelキャッシュ除外' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ キャッシュ関連ファイル除外が正しいです'
                : `❌ 不正除外設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * OS関連除外確認
     */
    async testOSExclusions() {
        const testName = 'OS関連ファイル除外の確認';
        try {
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            
            const checks = [
                { condition: content.includes('.DS_Store'), name: 'macOS .DS_Store除外' },
                { condition: content.includes('Thumbs.db'), name: 'Windows Thumbs.db除外' },
                { condition: content.includes('*.swp'), name: 'Vimスワップファイル除外' },
                { condition: content.includes('.directory'), name: 'Linux .directory除外' },
                { condition: content.includes('$RECYCLE.BIN/'), name: 'Windowsゴミ箱除外' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ OS関連ファイル除外が正しいです'
                : `❌ 不正除外設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            const lines = content.split('\n');
            
            const checks = [
                { condition: lines.length > 50, name: '十分な除外ルール数' },
                { condition: content.includes('# ==='), name: 'セクション分割コメント' },
                { condition: content.includes('*.log'), name: 'ワイルドカード使用' },
                { condition: content.includes('*/'), name: 'ディレクトリ除外' },
                { condition: !content.includes('package.json'), name: '必要ファイル保持' },
                { condition: content.includes('Frontend Specific'), name: 'フロントエンド固有セクション' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ パフォーマンス最適化が正しいです'
                : `❌ 最適化不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
        console.log('\n📋 Frontend .dockerignore設定情報:');
        try {
            const content = fs.readFileSync(this.dockerignorePath, 'utf8');
            const lines = content.split('\n');
            const nonEmptyLines = lines.filter(line => line.trim() && !line.trim().startsWith('#'));
            const commentLines = lines.filter(line => line.trim().startsWith('#'));
            
            console.log(`  - 総行数: ${lines.length}`);
            console.log(`  - 除外ルール数: ${nonEmptyLines.length}`);
            console.log(`  - コメント行数: ${commentLines.length}`);
            console.log(`  - ファイルサイズ: ${Buffer.byteLength(content, 'utf8')} bytes`);
        } catch (error) {
            console.log('  - 設定情報取得エラー');
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new FrontendDockerignoreTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = FrontendDockerignoreTest;
