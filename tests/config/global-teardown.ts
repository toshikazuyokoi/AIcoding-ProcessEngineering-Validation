/**
 * ===================================
 * Global Teardown for Integration Tests
 * ===================================
 * Generated for TSK-IT-000-003-ConfigFiles
 * Project: Task Management System - Integration Test
 * Purpose: Global teardown after all integration tests
 */

import { teardownIntegrationDatabase } from '../support/database-helper';

/**
 * Global teardown function executed after all tests
 */
export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting Integration Test Global Teardown...');
  
  try {
    // Cleanup integration database connections
    console.log('📊 Cleaning up integration database connections...');
    await teardownIntegrationDatabase();
    
    console.log('✅ Integration database connections closed');
    
    // Additional cleanup if needed
    console.log('🗑️  Performing additional cleanup...');
    
    // Clear any global test state
    if (global.testStartTime) {
      const totalDuration = Date.now() - global.testStartTime;
      console.log(`⏱️  Total test suite duration: ${totalDuration}ms`);
    }
    
    // Log teardown completion
    console.log('🎉 Integration Test Global Teardown Completed Successfully');
    
  } catch (error) {
    console.error('❌ Integration Test Global Teardown Failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}
