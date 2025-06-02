/**
 * PostgreSQL UUID Extension Setup
 * 
 * Sets up uuid-ossp extension for UUID generation in PostgreSQL
 * Required before running Prisma migrations
 */

const { PrismaClient } = require('@prisma/client');

async function setupUuidExtension() {
  console.log('🚀 Setting up PostgreSQL UUID extension...');
  
  const prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty'
  });

  try {
    // Enable uuid-ossp extension
    console.log('🔍 Enabling uuid-ossp extension...');
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;
    console.log('✅ UUID extension enabled successfully');

    // Test UUID generation
    console.log('🔍 Testing UUID generation...');
    const result = await prisma.$queryRaw`SELECT uuid_generate_v4() as test_uuid`;
    console.log('✅ UUID generation test successful:', result[0]?.test_uuid);

    console.log('🎉 PostgreSQL UUID extension setup complete!');
    
  } catch (error) {
    console.error('❌ UUID extension setup failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
setupUuidExtension().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
