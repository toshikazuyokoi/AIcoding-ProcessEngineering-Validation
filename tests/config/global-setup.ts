/**
 * ===================================
 * Global Setup for Integration Tests
 * ===================================
 * Generated for TSK-IT-000-003-ConfigFiles
 * Project: Task Management System - Integration Test
 * Purpose: Global setup before all integration tests
 */

import { setupIntegrationDatabase } from '../support/database-helper';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Global setup function executed before all tests
 */
export default async function globalSetup(): Promise<void> {
  console.log('🚀 Starting Integration Test Global Setup...');
  
  try {
    // Load environment variables
    dotenv.config({ 
      path: path.resolve(__dirname, '../../.env.integration') 
    });
    
    // Set test environment
    process.env.NODE_ENV = 'integration';
    
    // Initialize integration database
    console.log('📊 Initializing integration database...');
    const dbHelper = await setupIntegrationDatabase();
    
    // Verify database connection
    const isHealthy = await dbHelper.healthCheck();
    if (!isHealthy) {
      throw new Error('Integration database health check failed');
    }
    
    console.log('✅ Integration database initialized successfully');
    
    // Setup test data if needed
    console.log('🌱 Setting up initial test data...');
    await dbHelper.seedTestData({
      includeUsers: true,
      includeCategories: true,
      includeTasks: true,
      userCount: 3,
      categoryCount: 5,
      taskCount: 10,
      cleanBeforeSeed: true
    });
    
    console.log('✅ Initial test data setup completed');
    
    // Log setup completion
    console.log('🎉 Integration Test Global Setup Completed Successfully');
    
  } catch (error) {
    console.error('❌ Integration Test Global Setup Failed:', error);
    throw error;
  }
}
