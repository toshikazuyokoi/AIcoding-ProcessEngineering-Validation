#!/usr/bin/env node

/**
 * README.md Test Script
 * TSK-002-ENV-readme テスト実行
 * 
 * このスクリプトはREADME-TaskManagementSystem.mdファイルの内容を検証します
 */

const fs = require('fs');
const path = require('path');

class ReadmeTest {
    constructor() {
        this.testResults = [];
        this.readmePath = path.join(process.cwd(), 'README-TaskManagementSystem.md');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 README.md テスト開始');
        console.log('=====================================');

        try {
            await this.testReadmeExists();
            await this.testReadmeContent();
            await this.testRequiredSections();
            await this.testCodeBlocks();
            await this.testLinks();
            await this.testBadges();
            
            this.printResults();
            
            return this.testResults.every(result => result.passed);
        } catch (error) {
            console.error('❌ テスト実行エラー:', error.message);
            return false;
        }
    }

    /**
     * README.mdファイルの存在確認
     */
    async testReadmeExists() {
        const testName = 'README.mdファイルの存在確認';
        try {
            const exists = fs.existsSync(this.readmePath);
            this.addTestResult(testName, exists, exists ? '✅ ファイルが存在します' : '❌ ファイルが存在しません');
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * README.mdファイルの基本内容確認
     */
    async testReadmeContent() {
        const testName = 'README.mdファイルの基本内容確認';
        try {
            const content = fs.readFileSync(this.readmePath, 'utf8');
            
            const basicChecks = [
                { pattern: /# Task Management System/, name: 'プロジェクトタイトル' },
                { pattern: /## 📋 プロジェクト概要/, name: 'プロジェクト概要セクション' },
                { pattern: /### 🎯 主要機能/, name: '主要機能セクション' },
                { pattern: /### 🛠️ 技術スタック/, name: '技術スタックセクション' },
                { pattern: /## 🚀 クイックスタート/, name: 'クイックスタートセクション' },
                { pattern: /## 📖 使用方法/, name: '使用方法セクション' }
            ];

            const missingChecks = basicChecks.filter(check => !check.pattern.test(content));
            const passed = missingChecks.length === 0;
            
            const message = passed 
                ? '✅ 必要な基本セクションがすべて含まれています'
                : `❌ 不足セクション: ${missingChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 必須セクションの確認
     */
    async testRequiredSections() {
        const testName = '必須セクションの確認';
        try {
            const content = fs.readFileSync(this.readmePath, 'utf8');
            
            const requiredSections = [
                'アーキテクチャ',
                'インストール',
                'テスト',
                '開発',
                'プロジェクト構造',
                'デプロイ',
                'セキュリティ',
                'コントリビューション',
                'ドキュメント',
                'トラブルシューティング',
                'ライセンス'
            ];

            const missingSections = requiredSections.filter(section => !content.includes(section));
            const passed = missingSections.length === 0;
            
            const message = passed 
                ? '✅ 必須セクションがすべて含まれています'
                : `❌ 不足セクション: ${missingSections.join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * コードブロックの確認
     */
    async testCodeBlocks() {
        const testName = 'コードブロックの確認';
        try {
            const content = fs.readFileSync(this.readmePath, 'utf8');
            
            const codeBlockChecks = [
                { pattern: /```bash/, name: 'bashコードブロック' },
                { pattern: /```javascript/, name: 'JavaScriptコードブロック' },
                { pattern: /git clone/, name: 'git cloneコマンド' },
                { pattern: /npm install/, name: 'npm installコマンド' },
                { pattern: /docker-compose/, name: 'docker-composeコマンド' }
            ];

            const missingBlocks = codeBlockChecks.filter(check => !check.pattern.test(content));
            const passed = missingBlocks.length === 0;
            
            const message = passed 
                ? '✅ 必要なコードブロックがすべて含まれています'
                : `❌ 不足コードブロック: ${missingBlocks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * リンクの確認
     */
    async testLinks() {
        const testName = 'リンクの確認';
        try {
            const content = fs.readFileSync(this.readmePath, 'utf8');
            
            const linkChecks = [
                { pattern: /\[.*\]\(\.\/.*\)/, name: '相対パスリンク' },
                { pattern: /https:\/\/github\.com/, name: 'GitHubリンク' },
                { pattern: /mailto:/, name: 'メールリンク' }
            ];

            const missingLinks = linkChecks.filter(check => !check.pattern.test(content));
            const passed = missingLinks.length === 0;
            
            const message = passed 
                ? '✅ 必要なリンクがすべて含まれています'
                : `❌ 不足リンク: ${missingLinks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * バッジの確認
     */
    async testBadges() {
        const testName = 'バッジの確認';
        try {
            const content = fs.readFileSync(this.readmePath, 'utf8');
            
            const badgeChecks = [
                { pattern: /\[!\[CI\/CD Pipeline\]/, name: 'CI/CDバッジ' },
                { pattern: /\[!\[Test Coverage\]/, name: 'テストカバレッジバッジ' },
                { pattern: /\[!\[Code Quality\]/, name: 'コード品質バッジ' },
                { pattern: /\[!\[License\]/, name: 'ライセンスバッジ' }
            ];

            const missingBadges = badgeChecks.filter(check => !check.pattern.test(content));
            const passed = missingBadges.length === 0;
            
            const message = passed 
                ? '✅ 必要なバッジがすべて含まれています'
                : `❌ 不足バッジ: ${missingBadges.map(c => c.name).join(', ')}`;
                
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
        console.log('\n=====================================');
        console.log('📊 テスト結果サマリー');
        console.log('=====================================');
        
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
    }
}

// テスト実行
if (require.main === module) {
    const test = new ReadmeTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = ReadmeTest;
