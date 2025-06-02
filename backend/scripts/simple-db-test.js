/**
 * Simple Database Connection Test
 * 
 * Basic test for database connectivity without complex dependencies
 */

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🚀 Starting simple database connection test...');
  
  const prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty'
  });

  try {
    // Test basic connection
    console.log('🔍 Testing basic connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test simple query
    console.log('🔍 Testing simple query...');
    const result = await prisma.$queryRaw`SELECT 1 as test_value, NOW() as current_time`;
    console.log('✅ Query execution successful:', result);

    // Test database info
    console.log('🔍 Testing database info...');
    const versionResult = await prisma.$queryRaw`SELECT version() as version`;
    const dbNameResult = await prisma.$queryRaw`SELECT current_database() as database_name`;
    
    console.log('✅ Database info retrieved:');
    console.log('  Version:', versionResult[0]?.version?.substring(0, 50) + '...');
    console.log('  Database:', dbNameResult[0]?.database_name);

    console.log('🎉 All tests passed! Database environment is ready.');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDatabaseConnection().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
