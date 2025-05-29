#!/usr/bin/env node

/**
 * Backend Dockerfile Test Script
 * TSK-007-ENV-backend-dockerfile テスト実行
 * 
 * このスクリプトはbackend/Dockerfileの内容と構成を検証します
 */

const fs = require('fs');
const path = require('path');

class BackendDockerfileTest {
    constructor() {
        this.testResults = [];
        this.dockerfilePath = path.join(process.cwd(), 'backend/Dockerfile');
        this.dockerfileDevPath = path.join(process.cwd(), 'backend/Dockerfile.dev');
        this.dockerfileTestPath = path.join(process.cwd(), 'backend/Dockerfile.test');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 Backend Dockerfile テスト開始');
        console.log('==========================================');

        try {
            await this.testDockerfileExists();
            await this.testDockerfileContent();
            await this.testMultiStageBuilds();
            await this.testSecurityConfiguration();
            await this.testNodeJSConfiguration();
            await this.testEnvironmentConfiguration();
            await this.testHealthChecks();
            await this.testUserSecurity();
            await this.testPortConfiguration();
            await this.testVolumeConfiguration();
            
            this.printResults();
            
            return this.testResults.every(result => result.passed);
        } catch (error) {
            console.error('❌ テスト実行エラー:', error.message);
            return false;
        }
    }

    /**
     * Dockerfileファイル存在確認
     */
    async testDockerfileExists() {
        const testName = 'Dockerfileファイルの存在確認';
        try {
            const mainExists = fs.existsSync(this.dockerfilePath);
            const devExists = fs.existsSync(this.dockerfileDevPath);
            const testExists = fs.existsSync(this.dockerfileTestPath);
            
            const allExist = mainExists && devExists && testExists;
            
            const message = allExist 
                ? '✅ 全Dockerfileが存在します (Dockerfile, Dockerfile.dev, Dockerfile.test)'
                : `❌ 不足Dockerfile: ${[
                    !mainExists && 'Dockerfile',
                    !devExists && 'Dockerfile.dev', 
                    !testExists && 'Dockerfile.test'
                ].filter(Boolean).join(', ')}`;
                
            this.addTestResult(testName, allExist, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Dockerfile内容確認
     */
    async testDockerfileContent() {
        const testName = 'Dockerfile内容の確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('FROM node:20.11.0-alpine'), name: 'Node.js 20.11.0 Alpine基盤' },
                { condition: content.includes('WORKDIR /app'), name: 'ワーキングディレクトリ設定' },
                { condition: content.includes('COPY package*.json'), name: 'package.json コピー' },
                { condition: content.includes('npm ci'), name: 'npm ci 使用' },
                { condition: content.includes('EXPOSE 8000'), name: 'ポート8000公開' },
                { condition: content.includes('CMD'), name: 'CMD命令存在' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Dockerfile内容が正しいです'
                : `❌ 不正内容: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
            
            const checks = [
                { condition: content.includes('FROM node:20.11.0-alpine AS base'), name: 'base ステージ' },
                { condition: content.includes('AS dependencies'), name: 'dependencies ステージ' },
                { condition: content.includes('AS development'), name: 'development ステージ' },
                { condition: content.includes('AS test'), name: 'test ステージ' },
                { condition: content.includes('AS build'), name: 'build ステージ' },
                { condition: content.includes('AS production'), name: 'production ステージ' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ マルチステージビルドが正しく設定されています'
                : `❌ 不足ステージ: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
                { condition: content.includes('adduser -S backend'), name: '非rootユーザー作成' },
                { condition: content.includes('USER backend'), name: '非rootユーザー使用' },
                { condition: content.includes('--chown=backend:nodejs'), name: 'ファイル所有権設定' },
                { condition: content.includes('dumb-init'), name: 'dumb-init使用' },
                { condition: content.includes('apk add --no-cache'), name: 'キャッシュクリーンアップ' }
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
     * Node.js設定確認
     */
    async testNodeJSConfiguration() {
        const testName = 'Node.js設定の確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('node:20.11.0-alpine'), name: 'Node.js 20.11.0バージョン' },
                { condition: content.includes('npm ci'), name: 'npm ci使用' },
                { condition: content.includes('npm cache clean'), name: 'npmキャッシュクリーンアップ' },
                { condition: content.includes('npm run build'), name: 'ビルドスクリプト' },
                { condition: content.includes('npm prune --production'), name: '本番依存関係最適化' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Node.js設定が正しいです'
                : `❌ Node.js設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 環境設定確認
     */
    async testEnvironmentConfiguration() {
        const testName = '環境設定の確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('ENV NODE_ENV=development'), name: '開発環境設定' },
                { condition: content.includes('ENV NODE_ENV=test'), name: 'テスト環境設定' },
                { condition: content.includes('ENV NODE_ENV=production'), name: '本番環境設定' },
                { condition: content.includes('ENV PORT=8000'), name: 'ポート環境変数' },
                { condition: content.includes('ENV LOG_LEVEL'), name: 'ログレベル設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 環境設定が正しいです'
                : `❌ 環境設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
            
            const checks = [
                { condition: content.includes('HEALTHCHECK'), name: 'ヘルスチェック命令' },
                { condition: content.includes('curl -f http://localhost'), name: 'curl ヘルスチェック' },
                { condition: content.includes('--interval=30s'), name: 'ヘルスチェック間隔' },
                { condition: content.includes('--timeout=10s'), name: 'ヘルスチェックタイムアウト' },
                { condition: content.includes('--retries=3'), name: 'ヘルスチェックリトライ' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ ヘルスチェック設定が正しいです'
                : `❌ ヘルスチェック設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * ユーザーセキュリティ確認
     */
    async testUserSecurity() {
        const testName = 'ユーザーセキュリティの確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('addgroup -g 1001 -S nodejs'), name: 'nodejs グループ作成' },
                { condition: content.includes('adduser -S backend -u 1001'), name: 'backend ユーザー作成' },
                { condition: content.includes('USER backend'), name: '非rootユーザー切り替え' },
                { condition: content.includes('chown -R backend:nodejs'), name: 'ファイル所有権変更' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ ユーザーセキュリティが正しいです'
                : `❌ ユーザーセキュリティ不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * ポート設定確認
     */
    async testPortConfiguration() {
        const testName = 'ポート設定の確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('EXPOSE 8000'), name: 'アプリケーションポート8000' },
                { condition: content.includes('EXPOSE 9229'), name: 'デバッガーポート9229' },
                { condition: content.includes('EXPOSE 8001'), name: 'テストポート8001' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ ポート設定が正しいです'
                : `❌ ポート設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * ボリューム設定確認
     */
    async testVolumeConfiguration() {
        const testName = 'ボリューム・ディレクトリ設定の確認';
        try {
            const content = fs.readFileSync(this.dockerfilePath, 'utf8');
            
            const checks = [
                { condition: content.includes('mkdir -p logs'), name: 'ログディレクトリ作成' },
                { condition: content.includes('mkdir -p dist'), name: 'ビルドディレクトリ作成' },
                { condition: content.includes('mkdir -p coverage'), name: 'カバレッジディレクトリ作成' },
                { condition: content.includes('COPY --from='), name: 'マルチステージコピー' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ ボリューム・ディレクトリ設定が正しいです'
                : `❌ ボリューム設定不備: ${failedChecks.map(c => c.name).join(', ')}`;
                
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
        console.log('\n📋 Backend Dockerfile設定情報:');
        try {
            const mainContent = fs.readFileSync(this.dockerfilePath, 'utf8');
            const devContent = fs.readFileSync(this.dockerfileDevPath, 'utf8');
            const testContent = fs.readFileSync(this.dockerfileTestPath, 'utf8');
            
            console.log(`  - Dockerfile: ${mainContent.split('\n').length} 行`);
            console.log(`  - Dockerfile.dev: ${devContent.split('\n').length} 行`);
            console.log(`  - Dockerfile.test: ${testContent.split('\n').length} 行`);
            console.log(`  - マルチステージビルド: ${(mainContent.match(/FROM.*AS/g) || []).length} ステージ`);
        } catch (error) {
            console.log('  - 設定情報取得エラー');
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new BackendDockerfileTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = BackendDockerfileTest;
