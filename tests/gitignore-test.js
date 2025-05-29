#!/usr/bin/env node

/**
 * .gitignore Test Script
 * TSK-001-ENV-gitignore テスト実行
 * 
 * このスクリプトは.gitignoreファイルの動作を検証します
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitignoreTest {
    constructor() {
        this.testResults = [];
        this.gitignorePath = path.join(process.cwd(), '.gitignore');
        this.testFiles = [];
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 .gitignore テスト開始');
        console.log('=====================================');

        try {
            await this.testGitignoreExists();
            await this.testGitignoreContent();
            await this.testIgnorePatterns();
            await this.testGitStatus();
            
            this.printResults();
            this.cleanup();
            
            return this.testResults.every(result => result.passed);
        } catch (error) {
            console.error('❌ テスト実行エラー:', error.message);
            this.cleanup();
            return false;
        }
    }

    /**
     * .gitignoreファイルの存在確認
     */
    async testGitignoreExists() {
        const testName = '.gitignoreファイルの存在確認';
        try {
            const exists = fs.existsSync(this.gitignorePath);
            this.addTestResult(testName, exists, exists ? '✅ ファイルが存在します' : '❌ ファイルが存在しません');
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * .gitignoreファイルの内容確認
     */
    async testGitignoreContent() {
        const testName = '.gitignoreファイルの内容確認';
        try {
            const content = fs.readFileSync(this.gitignorePath, 'utf8');
            
            const requiredPatterns = [
                'node_modules/',
                '.env',
                'dist/',
                'build/',
                '*.log',
                'coverage/',
                '.vscode/',
                '.DS_Store',
                'docker-data/',
                'postgres-data/',
                'redis-data/'
            ];

            const missingPatterns = requiredPatterns.filter(pattern => !content.includes(pattern));
            const passed = missingPatterns.length === 0;
            
            const message = passed 
                ? '✅ 必要なパターンがすべて含まれています'
                : `❌ 不足パターン: ${missingPatterns.join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 無視パターンのテスト
     */
    async testIgnorePatterns() {
        const testName = '無視パターンの動作確認';
        try {
            // テストファイル作成
            const testPatterns = [
                'node_modules/test-package/index.js',
                '.env.test',
                'dist/bundle.js',
                'build/output.js',
                'test.log',
                'coverage/lcov.info',
                '.vscode/settings.json',
                '.DS_Store'
            ];

            // ディレクトリ作成とファイル作成
            for (const pattern of testPatterns) {
                const filePath = path.join(process.cwd(), pattern);
                const dir = path.dirname(filePath);
                
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                fs.writeFileSync(filePath, 'test content');
                this.testFiles.push(filePath);
            }

            // git statusで確認
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            const trackedFiles = gitStatus.split('\n').filter(line => line.trim());
            
            // テストファイルが追跡されていないことを確認
            const unexpectedlyTracked = trackedFiles.filter(line => {
                return testPatterns.some(pattern => line.includes(pattern));
            });

            const passed = unexpectedlyTracked.length === 0;
            const message = passed 
                ? '✅ 指定パターンが正しく無視されています'
                : `❌ 予期せず追跡されているファイル: ${unexpectedlyTracked.join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * git statusの確認
     */
    async testGitStatus() {
        const testName = 'git statusの確認';
        try {
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            const newFiles = gitStatus.split('\n').filter(line => line.startsWith('??'));
            
            // .gitignoreファイル自体は新規ファイルとして表示されるべき
            const gitignoreInStatus = newFiles.some(line => line.includes('.gitignore'));
            
            this.addTestResult(testName, gitignoreInStatus, 
                gitignoreInStatus ? '✅ .gitignoreが新規ファイルとして認識されています' : '❌ .gitignoreが認識されていません');
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

    /**
     * テストファイルのクリーンアップ
     */
    cleanup() {
        console.log('\n🧹 テストファイルのクリーンアップ');
        
        for (const filePath of this.testFiles) {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                console.warn(`⚠️ ファイル削除失敗: ${filePath}`);
            }
        }

        // 空のディレクトリも削除
        const dirsToClean = ['node_modules', 'dist', 'build', 'coverage', '.vscode'];
        for (const dir of dirsToClean) {
            try {
                const dirPath = path.join(process.cwd(), dir);
                if (fs.existsSync(dirPath)) {
                    fs.rmSync(dirPath, { recursive: true, force: true });
                }
            } catch (error) {
                // ディレクトリ削除は失敗しても続行
            }
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new GitignoreTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = GitignoreTest;
