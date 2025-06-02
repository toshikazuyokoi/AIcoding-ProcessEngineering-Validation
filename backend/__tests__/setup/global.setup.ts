/**
 * Jest Global Setup
 * 
 * Global setup configuration that runs once before all tests
 * Initializes test environment, databases, and external services
 * 
 * @fileoverview Jest global setup file
 * @version 1.0.0
 * @since 2025-02-01
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup function
 * Runs once before all test suites
 */
export default async function globalSetup(): Promise<void> {
  console.log('🚀 Starting Jest global setup...');

  try {
    // ===================================
    // Environment Setup
    // ===================================
    
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error';
    process.env.CI = 'true';
    
    // Database configuration for tests
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 
      'postgresql://test_user:test_password@localhost:5432/test_db';
    
    // Redis configuration for tests
    process.env.REDIS_URL = process.env.TEST_REDIS_URL || 
      'redis://localhost:6379/1';
    
    // JWT configuration for tests
    process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
    process.env.JWT_EXPIRES_IN = '1h';
    
    console.log('✅ Environment variables configured');

    // ===================================
    // Directory Setup
    // ===================================
    
    // Ensure test directories exist
    const testDirectories = [
      path.join(__dirname, '../../coverage'),
      path.join(__dirname, '../../test-results'),
      path.join(__dirname, '../../logs'),
      path.join(__dirname, '../../tmp')
    ];

    for (const dir of testDirectories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }

    console.log('✅ Test directories ensured');

    // ===================================
    // Test Database Setup
    // ===================================
    
    // Note: In a real application, you might want to:
    // 1. Start a test database container
    // 2. Run database migrations
    // 3. Seed test data
    // For now, we'll just log the setup
    
    console.log('🗄️  Test database configuration ready');

    // ===================================
    // External Services Setup
    // ===================================
    
    // Note: In a real application, you might want to:
    // 1. Start Redis test instance
    // 2. Configure external API mocks
    // 3. Set up test email services
    // For now, we'll just log the setup
    
    console.log('🔧 External services configuration ready');

    // ===================================
    // Test Configuration Validation
    // ===================================
    
    // Validate Jest configuration exists
    const jestConfigPath = path.join(__dirname, '../../jest.config.js');
    if (!fs.existsSync(jestConfigPath)) {
      throw new Error('Jest configuration file not found');
    }

    // Validate package.json exists
    const packageJsonPath = path.join(__dirname, '../../package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json file not found');
    }

    console.log('✅ Configuration files validated');

    // ===================================
    // Performance Monitoring Setup
    // ===================================
    
    // Set up performance monitoring for tests
    const startTime = Date.now();
    (global as any).__TEST_START_TIME__ = startTime;
    
    console.log('⏱️  Performance monitoring initialized');

    // ===================================
    // Memory Management
    // ===================================
    
    // Configure memory limits for tests
    if (process.env.NODE_OPTIONS) {
      console.log(`🧠 Node options: ${process.env.NODE_OPTIONS}`);
    }

    // Log initial memory usage
    const memUsage = process.memoryUsage();
    console.log(`💾 Initial memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);

    console.log('✅ Jest global setup completed successfully');

  } catch (error) {
    console.error('❌ Jest global setup failed:', error);
    throw error;
  }
}
