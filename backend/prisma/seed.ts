#!/usr/bin/env ts-node

/**
 * Database Seed Script
 * 
 * Creates initial data for the Task Management System
 * Includes admin user, sample categories, and demo tasks
 * 
 * @fileoverview Database seeding utility for development and testing
 * @version 1.0.0
 * @since 2025-02-01
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed configuration from environment variables
 */
const SEED_CONFIG = {
  enabled: process.env.SEED_ENABLED === 'true',
  adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@taskmanagement.com',
  adminPassword: process.env.SEED_ADMIN_PASSWORD || 'admin123',
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
};

/**
 * Sample categories data
 */
const SAMPLE_CATEGORIES = [
  {
    name: 'Work',
    color: '#3B82F6',
    description: 'Work-related tasks and projects'
  },
  {
    name: 'Personal',
    color: '#10B981',
    description: 'Personal tasks and activities'
  },
  {
    name: 'Shopping',
    color: '#F59E0B',
    description: 'Shopping lists and purchases'
  },
  {
    name: 'Health',
    color: '#EF4444',
    description: 'Health and fitness related tasks'
  },
  {
    name: 'Learning',
    color: '#8B5CF6',
    description: 'Educational and learning activities'
  },
  {
    name: 'Home',
    color: '#06B6D4',
    description: 'Home maintenance and household tasks'
  }
];

/**
 * Sample users data
 */
const SAMPLE_USERS = [
  {
    username: 'john_doe',
    email: 'john.doe@example.com',
    role: 'user' as const,
    isActive: true
  },
  {
    username: 'jane_smith',
    email: 'jane.smith@example.com',
    role: 'user' as const,
    isActive: true
  },
  {
    username: 'demo_user',
    email: 'demo@example.com',
    role: 'user' as const,
    isActive: true
  }
];

/**
 * Sample tasks data template
 */
const SAMPLE_TASKS_TEMPLATE = [
  {
    title: 'Complete project proposal',
    description: 'Finish writing the Q2 project proposal document',
    priority: 'high' as const,
    status: 'in_progress' as const,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    categories: ['Work']
  },
  {
    title: 'Buy groceries',
    description: 'Weekly grocery shopping - milk, bread, fruits, vegetables',
    priority: 'medium' as const,
    status: 'pending' as const,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    categories: ['Personal', 'Shopping']
  },
  {
    title: 'Schedule doctor appointment',
    description: 'Annual health checkup appointment',
    priority: 'medium' as const,
    status: 'pending' as const,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    categories: ['Health']
  },
  {
    title: 'Learn TypeScript',
    description: 'Complete TypeScript fundamentals course',
    priority: 'low' as const,
    status: 'pending' as const,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    categories: ['Learning']
  },
  {
    title: 'Fix kitchen faucet',
    description: 'Repair the leaky kitchen faucet',
    priority: 'high' as const,
    status: 'pending' as const,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    categories: ['Home']
  },
  {
    title: 'Team meeting preparation',
    description: 'Prepare slides and agenda for weekly team meeting',
    priority: 'medium' as const,
    status: 'completed' as const,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    categories: ['Work']
  }
];

/**
 * Hash password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SEED_CONFIG.saltRounds);
}

/**
 * Create admin user
 */
async function createAdminUser() {
  console.log('👤 Creating admin user...');
  
  const passwordHash = await hashPassword(SEED_CONFIG.adminPassword);
  
  const adminUser = await prisma.user.upsert({
    where: { email: SEED_CONFIG.adminEmail },
    update: {},
    create: {
      username: 'admin',
      email: SEED_CONFIG.adminEmail,
      passwordHash,
      role: 'admin',
      isActive: true
    }
  });
  
  console.log(`✅ Admin user created: ${adminUser.email} (ID: ${adminUser.id})`);
  return adminUser;
}

/**
 * Create sample users
 */
async function createSampleUsers() {
  console.log('👥 Creating sample users...');
  
  const users = [];
  const defaultPasswordHash = await hashPassword('password123');
  
  for (const userData of SAMPLE_USERS) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        passwordHash: defaultPasswordHash
      }
    });
    
    users.push(user);
    console.log(`✅ Sample user created: ${user.email} (ID: ${user.id})`);
  }
  
  return users;
}

/**
 * Create sample categories
 */
async function createSampleCategories() {
  console.log('🏷️ Creating sample categories...');
  
  const categories = [];
  
  for (const categoryData of SAMPLE_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData
    });
    
    categories.push(category);
    console.log(`✅ Category created: ${category.name} (ID: ${category.id})`);
  }
  
  return categories;
}

/**
 * Create sample tasks for a user
 */
async function createSampleTasks(userId: string, categories: any[]) {
  console.log(`📝 Creating sample tasks for user ${userId}...`);
  
  const tasks = [];
  
  for (const taskData of SAMPLE_TASKS_TEMPLATE) {
    const { categories: categoryNames, ...taskInfo } = taskData;
    
    const task = await prisma.task.create({
      data: {
        ...taskInfo,
        userId
      }
    });
    
    // Create task-category relationships
    for (const categoryName of categoryNames) {
      const category = categories.find(c => c.name === categoryName);
      if (category) {
        await prisma.taskCategory.create({
          data: {
            taskId: task.id,
            categoryId: category.id
          }
        });
      }
    }
    
    tasks.push(task);
    console.log(`✅ Task created: ${task.title} (ID: ${task.id})`);
  }
  
  return tasks;
}

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting database seeding...');
  
  if (!SEED_CONFIG.enabled) {
    console.log('⚠️ Seeding is disabled (SEED_ENABLED=false)');
    return;
  }
  
  try {
    // Create admin user
    const adminUser = await createAdminUser();
    
    // Create sample users
    const sampleUsers = await createSampleUsers();
    
    // Create sample categories
    const categories = await createSampleCategories();
    
    // Create sample tasks for admin user
    await createSampleTasks(adminUser.id, categories);
    
    // Create sample tasks for first sample user
    if (sampleUsers.length > 0) {
      await createSampleTasks(sampleUsers[0].id, categories);
    }
    
    console.log('\n📊 Seeding Summary:');
    console.log(`  - Users: ${1 + sampleUsers.length} (1 admin + ${sampleUsers.length} regular)`);
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - Tasks: ${SAMPLE_TASKS_TEMPLATE.length * 2} (${SAMPLE_TASKS_TEMPLATE.length} per user)`);
    console.log(`  - Task-Category relationships: Created`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Execute seeding
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
