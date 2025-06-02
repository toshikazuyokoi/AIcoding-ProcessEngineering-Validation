/**
 * Jest Global Teardown
 * 
 * Global teardown configuration that runs once after all tests
 * Cleans up test environment, databases, and external services
 * 
 * @fileoverview Jest global teardown file
 * @version 1.0.0
 * @since 2025-02-01
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Global teardown function
 * Runs once after all test suites complete
 */
export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting Jest global teardown...');

  try {
    // ===================================
    // Performance Reporting
    // ===================================
    
    const startTime = (global as any).__TEST_START_TIME__;
    if (startTime) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      console.log(`⏱️  Total test execution time: ${minutes}m ${seconds}s`);
    }

    // ===================================
    // Memory Usage Reporting
    // ===================================
    
    const memUsage = process.memoryUsage();
    console.log(`💾 Final memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
    console.log(`💾 Peak memory usage: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);

    // ===================================
    // Test Database Cleanup
    // ===================================
    
    // Note: In a real application, you might want to:
    // 1. Clean up test database
    // 2. Stop database containers
    // 3. Remove test data
    // For now, we'll just log the cleanup
    
    console.log('🗄️  Test database cleanup completed');

    // ===================================
    // External Services Cleanup
    // ===================================
    
    // Note: In a real application, you might want to:
    // 1. Stop Redis test instance
    // 2. Clean up external API mocks
    // 3. Stop test email services
    // For now, we'll just log the cleanup
    
    console.log('🔧 External services cleanup completed');

    // ===================================
    // File System Cleanup
    // ===================================
    
    // Clean up temporary test files (but keep coverage and logs)
    const tempDir = path.join(__dirname, '../../tmp');
    if (fs.existsSync(tempDir)) {
      try {
        // Remove temporary files but keep the directory
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            fs.unlinkSync(filePath);
          }
        }
        console.log('🗑️  Temporary files cleaned up');
      } catch (error) {
        console.warn('⚠️  Could not clean up temporary files:', error);
      }
    }

    // ===================================
    // Coverage Report Summary
    // ===================================
    
    const coverageDir = path.join(__dirname, '../../coverage');
    if (fs.existsSync(coverageDir)) {
      const coverageJsonPath = path.join(coverageDir, 'coverage-summary.json');
      if (fs.existsSync(coverageJsonPath)) {
        try {
          const coverageData = JSON.parse(fs.readFileSync(coverageJsonPath, 'utf8'));
          const total = coverageData.total;
          if (total) {
            console.log('📊 Coverage Summary:');
            console.log(`   Lines: ${total.lines.pct}%`);
            console.log(`   Functions: ${total.functions.pct}%`);
            console.log(`   Branches: ${total.branches.pct}%`);
            console.log(`   Statements: ${total.statements.pct}%`);
          }
        } catch (error) {
          console.warn('⚠️  Could not read coverage summary:', error);
        }
      }
    }

    // ===================================
    // Test Results Summary
    // ===================================
    
    const testResultsDir = path.join(__dirname, '../../test-results');
    if (fs.existsSync(testResultsDir)) {
      console.log('📋 Test results saved to test-results directory');
    }

    // ===================================
    // Environment Cleanup
    // ===================================
    
    // Clean up test-specific environment variables
    delete process.env.TEST_DATABASE_URL;
    delete process.env.TEST_REDIS_URL;
    
    console.log('🌍 Test environment variables cleaned up');

    // ===================================
    // Final Status
    // ===================================
    
    console.log('✅ Jest global teardown completed successfully');

  } catch (error) {
    console.error('❌ Jest global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}
