#!/usr/bin/env node

/**
 * Makefile Test Script
 * TSK-003-ENV-makefile テスト実行
 * 
 * このスクリプトはMakefileの内容と動作を検証します
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MakefileTest {
    constructor() {
        this.testResults = [];
        this.makefilePath = path.join(process.cwd(), 'Makefile');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 Makefile テスト開始');
        console.log('=====================================');

        try {
            await this.testMakefileExists();
            await this.testMakefileContent();
            await this.testRequiredTargets();
            await this.testHelpCommand();
            await this.testMakefileSyntax();
            await this.testVariableDefinitions();
            
            this.printResults();
            
            return this.testResults.every(result => result.passed);
        } catch (error) {
            console.error('❌ テスト実行エラー:', error.message);
            return false;
        }
    }

    /**
     * Makefileファイルの存在確認
     */
    async testMakefileExists() {
        const testName = 'Makefileファイルの存在確認';
        try {
            const exists = fs.existsSync(this.makefilePath);
            this.addTestResult(testName, exists, exists ? '✅ ファイルが存在します' : '❌ ファイルが存在しません');
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Makefileファイルの基本内容確認
     */
    async testMakefileContent() {
        const testName = 'Makefileファイルの基本内容確認';
        try {
            const content = fs.readFileSync(this.makefilePath, 'utf8');
            
            const basicChecks = [
                { pattern: /# Task Management System Makefile/, name: 'プロジェクトヘッダー' },
                { pattern: /\.PHONY:/, name: '.PHONYディレクティブ' },
                { pattern: /\.DEFAULT_GOAL/, name: 'デフォルトゴール設定' },
                { pattern: /BACKEND_DIR/, name: 'バックエンドディレクトリ変数' },
                { pattern: /FRONTEND_DIR/, name: 'フロントエンドディレクトリ変数' },
                { pattern: /COMPOSE_FILE/, name: 'Docker Compose設定' }
            ];

            const missingChecks = basicChecks.filter(check => !check.pattern.test(content));
            const passed = missingChecks.length === 0;
            
            const message = passed 
                ? '✅ 必要な基本要素がすべて含まれています'
                : `❌ 不足要素: ${missingChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 必須ターゲットの確認
     */
    async testRequiredTargets() {
        const testName = '必須ターゲットの確認';
        try {
            const content = fs.readFileSync(this.makefilePath, 'utf8');
            
            const requiredTargets = [
                'help',
                'setup',
                'install',
                'dev',
                'build',
                'test',
                'clean',
                'db-setup',
                'docker-up',
                'docker-down',
                'lint',
                'format',
                'security-audit'
            ];

            const missingTargets = requiredTargets.filter(target => {
                const targetPattern = new RegExp(`^${target}:`, 'm');
                return !targetPattern.test(content);
            });
            
            const passed = missingTargets.length === 0;
            
            const message = passed 
                ? '✅ 必須ターゲットがすべて含まれています'
                : `❌ 不足ターゲット: ${missingTargets.join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * helpコマンドの動作確認
     */
    async testHelpCommand() {
        const testName = 'helpコマンドの動作確認';
        try {
            const output = execSync('make help', { encoding: 'utf8', cwd: process.cwd() });
            
            const helpChecks = [
                { pattern: /Task Management System/, name: 'プロジェクト名表示' },
                { pattern: /Quick Start/, name: 'クイックスタート表示' },
                { pattern: /Available Commands/, name: 'コマンド一覧表示' },
                { pattern: /setup.*Complete project setup/, name: 'setupコマンド説明' },
                { pattern: /dev.*Start development/, name: 'devコマンド説明' },
                { pattern: /test.*Run all tests/, name: 'testコマンド説明' }
            ];

            const missingHelp = helpChecks.filter(check => !check.pattern.test(output));
            const passed = missingHelp.length === 0;
            
            const message = passed 
                ? '✅ helpコマンドが正常に動作します'
                : `❌ 不足ヘルプ項目: ${missingHelp.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Makefile構文の確認
     */
    async testMakefileSyntax() {
        const testName = 'Makefile構文の確認';
        try {
            // make -n でドライランを実行して構文エラーをチェック
            execSync('make -n help', { encoding: 'utf8', cwd: process.cwd() });
            this.addTestResult(testName, true, '✅ Makefile構文が正しいです');
        } catch (error) {
            this.addTestResult(testName, false, `❌ 構文エラー: ${error.message}`);
        }
    }

    /**
     * 変数定義の確認
     */
    async testVariableDefinitions() {
        const testName = '変数定義の確認';
        try {
            const content = fs.readFileSync(this.makefilePath, 'utf8');
            
            const variableChecks = [
                { pattern: /BACKEND_DIR\s*:=/, name: 'BACKEND_DIR変数' },
                { pattern: /FRONTEND_DIR\s*:=/, name: 'FRONTEND_DIR変数' },
                { pattern: /NODE_VERSION\s*:=/, name: 'NODE_VERSION変数' },
                { pattern: /COMPOSE_FILE\s*:=/, name: 'COMPOSE_FILE変数' },
                { pattern: /RED\s*:=.*\\033/, name: 'カラー変数定義' }
            ];

            const missingVars = variableChecks.filter(check => !check.pattern.test(content));
            const passed = missingVars.length === 0;
            
            const message = passed 
                ? '✅ 必要な変数がすべて定義されています'
                : `❌ 不足変数: ${missingVars.map(c => c.name).join(', ')}`;
                
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

        // 追加情報の表示
        console.log('\n📋 Makefile情報:');
        try {
            const content = fs.readFileSync(this.makefilePath, 'utf8');
            const lines = content.split('\n').length;
            const targets = (content.match(/^[a-zA-Z][a-zA-Z0-9_-]*:/gm) || []).length;
            const variables = (content.match(/^[A-Z_]+\s*:=/gm) || []).length;
            
            console.log(`  - 総行数: ${lines}`);
            console.log(`  - ターゲット数: ${targets}`);
            console.log(`  - 変数定義数: ${variables}`);
        } catch (error) {
            console.log('  - ファイル情報取得エラー');
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new MakefileTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = MakefileTest;
