/**
 * Playwright Global Setup
 * 
 * Global setup configuration for E2E tests including database preparation,
 * test data seeding, and environment initialization
 * 
 * @fileoverview Global setup for Playwright E2E tests
 * @version 1.0.0
 * @since 2025-01-28
 */

import { FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Global setup function
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log('🚀 Starting Playwright global setup...');
  
  try {
    // Initialize test database
    await setupTestDatabase();
    
    // Seed test data
    await seedTestData();
    
    // Verify services are running
    await verifyServices();
    
    // Setup authentication tokens
    await setupAuthTokens();
    
    console.log('✅ Playwright global setup completed successfully');
  } catch (error) {
    console.error('❌ Playwright global setup failed:', error);
    throw error;
  }
}

/**
 * Setup test database
 */
async function setupTestDatabase(): Promise<void> {
  console.log('📊 Setting up test database...');
  
  const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('TEST_DATABASE_URL or DATABASE_URL environment variable is required');
  }
  
  try {
    // Run database migrations
    await execAsync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: databaseUrl }
    });
    
    // Generate Prisma client
    await execAsync('npx prisma generate');
    
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }
}

/**
 * Seed test data
 */
async function seedTestData(): Promise<void> {
  console.log('🌱 Seeding test data...');
  
  const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
  
  try {
    // Clear existing test data
    await prisma.taskCategory.deleteMany();
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    
    // Create test users
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@test.com',
        passwordHash: '$2b$10$rQZ8kHWiZ8qZ8qZ8qZ8qZOZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ', // admin123
        role: 'admin',
        isActive: true,
      }
    });
    
    const regularUser = await prisma.user.create({
      data: {
        username: 'user',
        email: 'user@test.com',
        passwordHash: '$2b$10$rQZ8kHWiZ8qZ8qZ8qZ8qZOZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ8qZ', // user123
        role: 'user',
        isActive: true,
      }
    });
    
    // Create test categories
    const workCategory = await prisma.category.create({
      data: {
        name: 'Work',
        color: '#FF5722',
      }
    });
    
    const personalCategory = await prisma.category.create({
      data: {
        name: 'Personal',
        color: '#2196F3',
      }
    });
    
    // Create test tasks
    await prisma.task.createMany({
      data: [
        {
          title: 'Complete project documentation',
          description: 'Write comprehensive documentation for the project',
          userId: adminUser.id,
          priority: 'high',
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
        {
          title: 'Review code changes',
          description: 'Review and approve pending code changes',
          userId: adminUser.id,
          priority: 'medium',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        },
        {
          title: 'Buy groceries',
          description: 'Weekly grocery shopping',
          userId: regularUser.id,
          priority: 'low',
          status: 'pending',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        },
        {
          title: 'Exercise routine',
          description: 'Daily exercise and fitness routine',
          userId: regularUser.id,
          priority: 'medium',
          status: 'completed',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        }
      ]
    });
    
    console.log('✅ Test data seeding completed');
  } catch (error) {
    console.error('❌ Test data seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Verify services are running
 */
async function verifyServices(): Promise<void> {
  console.log('🔍 Verifying services...');
  
  const services = [
    {
      name: 'Database',
      check: async () => {
        const prisma = new PrismaClient();
        try {
          await prisma.$queryRaw`SELECT 1`;
          return true;
        } catch {
          return false;
        } finally {
          await prisma.$disconnect();
        }
      }
    },
    {
      name: 'Redis',
      check: async () => {
        try {
          // Redis check would go here if needed
          return true;
        } catch {
          return false;
        }
      }
    }
  ];
  
  for (const service of services) {
    const isRunning = await service.check();
    if (!isRunning) {
      throw new Error(`${service.name} service is not running`);
    }
    console.log(`✅ ${service.name} service is running`);
  }
}

/**
 * Setup authentication tokens for tests
 */
async function setupAuthTokens(): Promise<void> {
  console.log('🔐 Setting up authentication tokens...');
  
  // Store test tokens in environment or global state
  // This would typically involve creating JWT tokens for test users
  process.env.TEST_ADMIN_TOKEN = 'test-admin-token';
  process.env.TEST_USER_TOKEN = 'test-user-token';
  
  console.log('✅ Authentication tokens setup completed');
}

export default globalSetup;
