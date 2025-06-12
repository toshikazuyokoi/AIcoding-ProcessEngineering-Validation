/**
 * Playwright Global Teardown
 * 
 * Global teardown configuration for E2E tests including cleanup operations,
 * test data removal, and resource disposal
 * 
 * @fileoverview Global teardown for Playwright E2E tests
 * @version 1.0.0
 * @since 2025-01-28
 */

import { FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Global teardown function
 */
async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('🧹 Starting Playwright global teardown...');
  
  try {
    // Clean up test data
    await cleanupTestData();
    
    // Clean up test files
    await cleanupTestFiles();
    
    // Generate test summary
    await generateTestSummary();
    
    // Clean up environment variables
    cleanupEnvironmentVariables();
    
    console.log('✅ Playwright global teardown completed successfully');
  } catch (error) {
    console.error('❌ Playwright global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Clean up test data from database
 */
async function cleanupTestData(): Promise<void> {
  console.log('🗑️ Cleaning up test data...');
  
  const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('⚠️ No database URL found, skipping test data cleanup');
    return;
  }
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
  
  try {
    // Clean up test data in correct order (respecting foreign key constraints)
    await prisma.taskCategory.deleteMany();
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Test data cleanup completed');
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clean up temporary test files
 */
async function cleanupTestFiles(): Promise<void> {
  console.log('📁 Cleaning up test files...');
  
  const testOutputDir = path.join(__dirname, '../../test-results');
  const tempDirs = [
    path.join(testOutputDir, 'temp'),
    path.join(testOutputDir, 'screenshots'),
    path.join(testOutputDir, 'videos'),
    path.join(testOutputDir, 'traces'),
  ];
  
  try {
    for (const dir of tempDirs) {
      try {
        const stats = await fs.stat(dir);
        if (stats.isDirectory()) {
          // Only clean up if directory exists and is older than 1 hour
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          if (stats.mtime.getTime() < oneHourAgo) {
            await fs.rm(dir, { recursive: true, force: true });
            console.log(`🗑️ Cleaned up old test files in ${dir}`);
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be accessed, skip
      }
    }
    
    console.log('✅ Test files cleanup completed');
  } catch (error) {
    console.error('❌ Test files cleanup failed:', error);
  }
}

/**
 * Generate test execution summary
 */
async function generateTestSummary(): Promise<void> {
  console.log('📊 Generating test summary...');
  
  try {
    const testResultsPath = path.join(__dirname, '../../test-results/test-results.json');
    const summaryPath = path.join(__dirname, '../../test-results/test-summary.json');
    
    try {
      const testResultsData = await fs.readFile(testResultsPath, 'utf-8');
      const testResults = JSON.parse(testResultsData);
      
      const summary = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        totalTests: testResults.stats?.total || 0,
        passedTests: testResults.stats?.passed || 0,
        failedTests: testResults.stats?.failed || 0,
        skippedTests: testResults.stats?.skipped || 0,
        duration: testResults.stats?.duration || 0,
        success: (testResults.stats?.failed || 0) === 0,
        browsers: testResults.config?.projects?.map((p: any) => p.name) || [],
        baseURL: testResults.config?.use?.baseURL || 'unknown',
      };
      
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
      
      // Log summary to console
      console.log('📈 Test Execution Summary:');
      console.log(`   Total Tests: ${summary.totalTests}`);
      console.log(`   Passed: ${summary.passedTests}`);
      console.log(`   Failed: ${summary.failedTests}`);
      console.log(`   Skipped: ${summary.skippedTests}`);
      console.log(`   Duration: ${summary.duration}ms`);
      console.log(`   Success: ${summary.success ? '✅' : '❌'}`);
      
    } catch (error) {
      console.warn('⚠️ Could not read test results for summary generation');
    }
    
    console.log('✅ Test summary generation completed');
  } catch (error) {
    console.error('❌ Test summary generation failed:', error);
  }
}

/**
 * Clean up environment variables
 */
function cleanupEnvironmentVariables(): void {
  console.log('🔧 Cleaning up environment variables...');
  
  const testEnvVars = [
    'TEST_ADMIN_TOKEN',
    'TEST_USER_TOKEN',
    'TEST_SESSION_ID',
    'TEST_TEMP_DIR',
  ];
  
  for (const envVar of testEnvVars) {
    if (process.env[envVar]) {
      delete process.env[envVar];
    }
  }
  
  console.log('✅ Environment variables cleanup completed');
}

/**
 * Archive test artifacts (optional)
 */
async function archiveTestArtifacts(): Promise<void> {
  console.log('📦 Archiving test artifacts...');
  
  try {
    const testResultsDir = path.join(__dirname, '../../test-results');
    const playwrightReportDir = path.join(__dirname, '../../playwright-report');
    const archiveDir = path.join(__dirname, '../../test-archives');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `test-run-${timestamp}`;
    const archivePath = path.join(archiveDir, archiveName);
    
    // Create archive directory
    await fs.mkdir(archivePath, { recursive: true });
    
    // Copy test results and reports
    try {
      await fs.cp(testResultsDir, path.join(archivePath, 'results'), { recursive: true });
    } catch (error) {
      // Results directory might not exist
    }
    
    try {
      await fs.cp(playwrightReportDir, path.join(archivePath, 'report'), { recursive: true });
    } catch (error) {
      // Report directory might not exist
    }
    
    console.log(`✅ Test artifacts archived to ${archivePath}`);
  } catch (error) {
    console.error('❌ Test artifacts archiving failed:', error);
  }
}

export default globalTeardown;
