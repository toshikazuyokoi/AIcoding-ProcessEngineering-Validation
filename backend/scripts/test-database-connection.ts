#!/usr/bin/env ts-node

/**
 * Database Connection Test Script
 * 
 * Tests database connectivity for TSK-090-DB-EnvironmentSetup
 * Validates PostgreSQL connection and basic operations
 * 
 * @fileoverview Database connection testing utility
 * @version 1.0.0
 * @since 2025-02-01
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../src/utils/logger';
import { getDatabaseConfig, initializeDatabaseConfig } from '../config/database';

const logger = createLogger('DatabaseConnectionTest');

interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
  duration?: number;
}

/**
 * Tests basic database connection
 */
async function testBasicConnection(prisma: PrismaClient): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  
  try {
    await prisma.$connect();
    const duration = Date.now() - startTime;
    
    logger.info('✅ Basic database connection successful', { duration });
    return {
      success: true,
      message: 'Database connection established successfully',
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('❌ Basic database connection failed', { error, duration });
    return {
      success: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error,
      duration
    };
  }
}

/**
 * Tests database query execution
 */
async function testQueryExecution(prisma: PrismaClient): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test_value, NOW() as current_time`;
    const duration = Date.now() - startTime;
    
    logger.info('✅ Database query execution successful', { result, duration });
    return {
      success: true,
      message: 'Database query execution successful',
      details: result,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('❌ Database query execution failed', { error, duration });
    return {
      success: false,
      message: `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error,
      duration
    };
  }
}

/**
 * Tests database version and info
 */
async function testDatabaseInfo(prisma: PrismaClient): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  
  try {
    const versionResult = await prisma.$queryRaw`SELECT version() as version`;
    const dbNameResult = await prisma.$queryRaw`SELECT current_database() as database_name`;
    const userResult = await prisma.$queryRaw`SELECT current_user as current_user`;
    
    const duration = Date.now() - startTime;
    const info = {
      version: (versionResult as any)[0]?.version,
      database: (dbNameResult as any)[0]?.database_name,
      user: (userResult as any)[0]?.current_user
    };
    
    logger.info('✅ Database info retrieved successfully', { info, duration });
    return {
      success: true,
      message: 'Database information retrieved successfully',
      details: info,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('❌ Database info retrieval failed', { error, duration });
    return {
      success: false,
      message: `Database info retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error,
      duration
    };
  }
}

/**
 * Tests connection pool functionality
 */
async function testConnectionPool(prisma: PrismaClient): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  
  try {
    // Execute multiple concurrent queries to test connection pool
    const promises = Array.from({ length: 5 }, (_, i) => 
      prisma.$queryRaw`SELECT ${i} as query_id, pg_backend_pid() as backend_pid`
    );
    
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    // Check if different backend PIDs were used (indicating pool usage)
    const backendPids = results.map((result: any) => result[0]?.backend_pid).filter(Boolean);
    const uniquePids = new Set(backendPids);
    
    logger.info('✅ Connection pool test successful', { 
      totalQueries: results.length,
      uniqueConnections: uniquePids.size,
      backendPids,
      duration 
    });
    
    return {
      success: true,
      message: 'Connection pool test successful',
      details: {
        totalQueries: results.length,
        uniqueConnections: uniquePids.size,
        backendPids: Array.from(uniquePids)
      },
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('❌ Connection pool test failed', { error, duration });
    return {
      success: false,
      message: `Connection pool test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error,
      duration
    };
  }
}

/**
 * Tests database schema existence (without requiring tables)
 */
async function testSchemaAccess(prisma: PrismaClient): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  
  try {
    // Check if we can access schema information
    const schemaResult = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = current_schema()
    `;
    
    const duration = Date.now() - startTime;
    
    logger.info('✅ Schema access test successful', { schemaResult, duration });
    return {
      success: true,
      message: 'Database schema access successful',
      details: schemaResult,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('❌ Schema access test failed', { error, duration });
    return {
      success: false,
      message: `Schema access test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error,
      duration
    };
  }
}

/**
 * Main test execution function
 */
async function runDatabaseConnectionTests(): Promise<void> {
  logger.info('🚀 Starting database connection tests...');
  
  try {
    // Initialize database configuration
    initializeDatabaseConfig();
    const config = getDatabaseConfig();
    
    logger.info('📋 Database configuration loaded', {
      environment: config.environment,
      provider: config.provider,
      poolMax: config.pool.max,
      poolMin: config.pool.min
    });

    // Create Prisma client
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
      errorFormat: 'pretty'
    });

    const tests = [
      { name: 'Basic Connection', test: () => testBasicConnection(prisma) },
      { name: 'Query Execution', test: () => testQueryExecution(prisma) },
      { name: 'Database Info', test: () => testDatabaseInfo(prisma) },
      { name: 'Connection Pool', test: () => testConnectionPool(prisma) },
      { name: 'Schema Access', test: () => testSchemaAccess(prisma) }
    ];

    const results: Array<{ name: string; result: ConnectionTestResult }> = [];
    let successCount = 0;

    // Run all tests
    for (const { name, test } of tests) {
      logger.info(`🔍 Running test: ${name}`);
      const result = await test();
      results.push({ name, result });
      
      if (result.success) {
        successCount++;
      }
    }

    // Disconnect from database
    await prisma.$disconnect();
    logger.info('🔌 Database connection closed');

    // Print summary
    logger.info('📊 Test Summary', {
      totalTests: tests.length,
      successful: successCount,
      failed: tests.length - successCount,
      successRate: `${((successCount / tests.length) * 100).toFixed(1)}%`
    });

    // Print detailed results
    console.log('\n' + '='.repeat(60));
    console.log('DATABASE CONNECTION TEST RESULTS');
    console.log('='.repeat(60));
    
    results.forEach(({ name, result }) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const duration = result.duration ? `(${result.duration}ms)` : '';
      console.log(`${status} ${name} ${duration}`);
      console.log(`    ${result.message}`);
      if (result.details && result.success) {
        console.log(`    Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      console.log('');
    });

    // Exit with appropriate code
    if (successCount === tests.length) {
      logger.info('🎉 All database connection tests passed!');
      process.exit(0);
    } else {
      logger.error('💥 Some database connection tests failed!');
      process.exit(1);
    }

  } catch (error) {
    logger.error('💥 Database connection test suite failed', { error });
    console.error('\nFATAL ERROR:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runDatabaseConnectionTests().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { runDatabaseConnectionTests };
