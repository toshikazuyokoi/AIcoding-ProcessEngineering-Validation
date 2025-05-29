#!/usr/bin/env node

/**
 * Prisma Schema Test Script
 * TSK-011-ENV-prisma-schema テスト実行
 * 
 * このスクリプトはbackend/prisma/schema.prismaの内容と構成を検証します
 */

const fs = require('fs');
const path = require('path');

class PrismaSchemaTest {
    constructor() {
        this.testResults = [];
        this.schemaPath = path.join(process.cwd(), 'backend/prisma/schema.prisma');
    }

    /**
     * テスト実行メイン関数
     */
    async runTests() {
        console.log('🧪 Prisma Schema テスト開始');
        console.log('==========================================');

        try {
            await this.testFileExists();
            await this.testSchemaStructure();
            await this.testGeneratorConfiguration();
            await this.testDatasourceConfiguration();
            await this.testEnumDefinitions();
            await this.testUserModel();
            await this.testTaskModel();
            await this.testCategoryModel();
            await this.testTaskCategoryModel();
            await this.testRelationships();
            await this.testIndexes();
            await this.testConstraints();
            
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
        const testName = 'schema.prismaファイルの存在確認';
        try {
            const exists = fs.existsSync(this.schemaPath);
            this.addTestResult(testName, exists, exists ? '✅ ファイルが存在します' : '❌ ファイルが存在しません');
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * スキーマ構造確認
     */
    async testSchemaStructure() {
        const testName = 'Prismaスキーマ構造の確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('generator client'), name: 'generator設定' },
                { condition: content.includes('datasource db'), name: 'datasource設定' },
                { condition: content.includes('enum UserRole'), name: 'UserRole enum' },
                { condition: content.includes('enum TaskPriority'), name: 'TaskPriority enum' },
                { condition: content.includes('enum TaskStatus'), name: 'TaskStatus enum' },
                { condition: content.includes('model User'), name: 'Userモデル' },
                { condition: content.includes('model Task'), name: 'Taskモデル' },
                { condition: content.includes('model Category'), name: 'Categoryモデル' },
                { condition: content.includes('model TaskCategory'), name: 'TaskCategoryモデル' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Prismaスキーマ構造が正しいです'
                : `❌ 不正構造: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Generator設定確認
     */
    async testGeneratorConfiguration() {
        const testName = 'Generator設定の確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('provider = "prisma-client-js"'), name: 'Prisma Client JS設定' },
                { condition: content.includes('output   = "../node_modules/.prisma/client"'), name: '出力パス設定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Generator設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Datasource設定確認
     */
    async testDatasourceConfiguration() {
        const testName = 'Datasource設定の確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('provider = "postgresql"'), name: 'PostgreSQL設定' },
                { condition: content.includes('url      = env("DATABASE_URL")'), name: 'DATABASE_URL環境変数' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Datasource設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Enum定義確認
     */
    async testEnumDefinitions() {
        const testName = 'Enum定義の確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('enum UserRole') && content.includes('user') && content.includes('admin'), name: 'UserRole enum値' },
                { condition: content.includes('enum TaskPriority') && content.includes('high') && content.includes('medium') && content.includes('low'), name: 'TaskPriority enum値' },
                { condition: content.includes('enum TaskStatus') && content.includes('pending') && content.includes('in_progress') && content.includes('completed'), name: 'TaskStatus enum値' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Enum定義が正しいです'
                : `❌ 不正定義: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Userモデル確認
     */
    async testUserModel() {
        const testName = 'Userモデルの確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('id String @id @default(dbgenerated("uuid_generate_v4()"))'), name: 'UUID主キー' },
                { condition: content.includes('username     String  @db.VarChar(50)'), name: 'username フィールド' },
                { condition: content.includes('email        String  @unique @db.VarChar(255)'), name: 'email ユニーク制約' },
                { condition: content.includes('passwordHash String  @map("password_hash")'), name: 'passwordHash フィールド' },
                { condition: content.includes('role         UserRole @default(user)'), name: 'role デフォルト値' },
                { condition: content.includes('isActive     Boolean @default(true)'), name: 'isActive デフォルト値' },
                { condition: content.includes('tasks Task[]'), name: 'Task リレーション' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Userモデルが正しいです'
                : `❌ 不正定義: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Taskモデル確認
     */
    async testTaskModel() {
        const testName = 'Taskモデルの確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('userId String @map("user_id") @db.Uuid'), name: 'userId 外部キー' },
                { condition: content.includes('title       String      @db.VarChar(100)'), name: 'title フィールド' },
                { condition: content.includes('description String?     @db.Text'), name: 'description オプショナル' },
                { condition: content.includes('priority    TaskPriority @default(medium)'), name: 'priority デフォルト値' },
                { condition: content.includes('status      TaskStatus  @default(pending)'), name: 'status デフォルト値' },
                { condition: content.includes('user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)'), name: 'User リレーション' },
                { condition: content.includes('taskCategories TaskCategory[]'), name: 'TaskCategory リレーション' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Taskモデルが正しいです'
                : `❌ 不正定義: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * Categoryモデル確認
     */
    async testCategoryModel() {
        const testName = 'Categoryモデルの確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('name        String  @unique @db.VarChar(50)'), name: 'name ユニーク制約' },
                { condition: content.includes('color       String  @db.VarChar(7)'), name: 'color フィールド' },
                { condition: content.includes('description String? @db.Text'), name: 'description オプショナル' },
                { condition: content.includes('taskCategories TaskCategory[]'), name: 'TaskCategory リレーション' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ Categoryモデルが正しいです'
                : `❌ 不正定義: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * TaskCategoryモデル確認
     */
    async testTaskCategoryModel() {
        const testName = 'TaskCategoryモデルの確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('taskId     String @map("task_id") @db.Uuid'), name: 'taskId フィールド' },
                { condition: content.includes('categoryId String @map("category_id") @db.Uuid'), name: 'categoryId フィールド' },
                { condition: content.includes('@@id([taskId, categoryId])'), name: '複合主キー' },
                { condition: content.includes('task     Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)'), name: 'Task リレーション' },
                { condition: content.includes('category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)'), name: 'Category リレーション' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ TaskCategoryモデルが正しいです'
                : `❌ 不正定義: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * リレーション確認
     */
    async testRelationships() {
        const testName = 'リレーション設定の確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('onDelete: Cascade'), name: 'CASCADE削除設定' },
                { condition: content.includes('User           @relation(fields: [userId], references: [id]'), name: 'User-Task リレーション' },
                { condition: content.includes('Task     @relation(fields: [taskId], references: [id]'), name: 'Task-TaskCategory リレーション' },
                { condition: content.includes('Category @relation(fields: [categoryId], references: [id]'), name: 'Category-TaskCategory リレーション' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ リレーション設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * インデックス確認
     */
    async testIndexes() {
        const testName = 'インデックス設定の確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('@@index([email], name: "idx_user_email")'), name: 'User email インデックス' },
                { condition: content.includes('@@index([userId], name: "idx_task_user_id")'), name: 'Task userId インデックス' },
                { condition: content.includes('@@index([priority], name: "idx_task_priority")'), name: 'Task priority インデックス' },
                { condition: content.includes('@@index([status], name: "idx_task_status")'), name: 'Task status インデックス' },
                { condition: content.includes('@@index([userId, status], name: "idx_task_user_status")'), name: 'Task 複合インデックス' },
                { condition: content.includes('@@index([name], name: "idx_category_name")'), name: 'Category name インデックス' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ インデックス設定が正しいです'
                : `❌ 不正設定: ${failedChecks.map(c => c.name).join(', ')}`;
                
            this.addTestResult(testName, passed, message);
        } catch (error) {
            this.addTestResult(testName, false, `❌ エラー: ${error.message}`);
        }
    }

    /**
     * 制約確認
     */
    async testConstraints() {
        const testName = '制約設定の確認';
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            
            const checks = [
                { condition: content.includes('@unique'), name: 'ユニーク制約' },
                { condition: content.includes('@default'), name: 'デフォルト値' },
                { condition: content.includes('@db.Uuid'), name: 'UUID型指定' },
                { condition: content.includes('@db.VarChar'), name: 'VARCHAR型指定' },
                { condition: content.includes('@db.Text'), name: 'TEXT型指定' },
                { condition: content.includes('@db.Timestamp(6)'), name: 'TIMESTAMP型指定' }
            ];

            const failedChecks = checks.filter(check => !check.condition);
            const passed = failedChecks.length === 0;
            
            const message = passed 
                ? '✅ 制約設定が正しいです'
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
        console.log('\n📋 Prisma Schema設定情報:');
        try {
            const content = fs.readFileSync(this.schemaPath, 'utf8');
            const lines = content.split('\n');
            const models = (content.match(/model \w+/g) || []).length;
            const enums = (content.match(/enum \w+/g) || []).length;
            const indexes = (content.match(/@@index/g) || []).length;
            
            console.log(`  - 総行数: ${lines.length}`);
            console.log(`  - モデル数: ${models}`);
            console.log(`  - Enum数: ${enums}`);
            console.log(`  - インデックス数: ${indexes}`);
            console.log(`  - ファイルサイズ: ${Buffer.byteLength(content, 'utf8')} bytes`);
        } catch (error) {
            console.log('  - 設定情報取得エラー');
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new PrismaSchemaTest();
    test.runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = PrismaSchemaTest;
