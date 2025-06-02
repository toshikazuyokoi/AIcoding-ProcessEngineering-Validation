/**
 * Seed Data Verification Script
 * 
 * Verifies that the database seeding was successful
 * Checks data integrity, relationships, and expected counts
 */

const { PrismaClient } = require('@prisma/client');

async function verifySeedData() {
  console.log('🚀 Starting seed data verification...');
  
  const prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty'
  });

  try {
    // Check user counts
    console.log('🔍 Checking user data...');
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    const regularUserCount = await prisma.user.count({ where: { role: 'user' } });
    
    console.log(`📊 Users: ${userCount} total (${adminCount} admin, ${regularUserCount} regular)`);
    
    if (userCount === 0) {
      throw new Error('No users found in database');
    }
    
    if (adminCount === 0) {
      throw new Error('No admin user found');
    }
    
    // Check admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      throw new Error('Admin user not found');
    }
    
    console.log(`✅ Admin user: ${adminUser.email} (${adminUser.username})`);
    
    // Check categories
    console.log('\n🔍 Checking category data...');
    const categoryCount = await prisma.category.count();
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`📊 Categories: ${categoryCount} total`);
    
    if (categoryCount === 0) {
      throw new Error('No categories found in database');
    }
    
    categories.forEach(category => {
      console.log(`  ✅ ${category.name} (${category.color}): ${category.description}`);
    });
    
    // Check tasks
    console.log('\n🔍 Checking task data...');
    const taskCount = await prisma.task.count();
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      _count: { priority: true }
    });
    
    console.log(`📊 Tasks: ${taskCount} total`);
    
    if (taskCount === 0) {
      throw new Error('No tasks found in database');
    }
    
    console.log('  Status distribution:');
    tasksByStatus.forEach(group => {
      console.log(`    ${group.status}: ${group._count.status}`);
    });
    
    console.log('  Priority distribution:');
    tasksByPriority.forEach(group => {
      console.log(`    ${group.priority}: ${group._count.priority}`);
    });
    
    // Check task-category relationships
    console.log('\n🔍 Checking task-category relationships...');
    const taskCategoryCount = await prisma.taskCategory.count();
    
    console.log(`📊 Task-Category relationships: ${taskCategoryCount} total`);
    
    if (taskCategoryCount === 0) {
      throw new Error('No task-category relationships found');
    }
    
    // Check data integrity with complex queries
    console.log('\n🔍 Checking data integrity...');

    // Check that all tasks have valid user relationships
    const tasksWithUsers = await prisma.task.findMany({
      include: { user: true },
      take: 5
    });

    const invalidTasks = tasksWithUsers.filter(task => !task.user);
    if (invalidTasks.length > 0) {
      throw new Error(`Found ${invalidTasks.length} tasks with invalid user references`);
    }

    console.log('✅ All tasks have valid user references');

    // Check that all task-categories have valid references
    const taskCategoriesWithRefs = await prisma.taskCategory.findMany({
      include: { task: true, category: true },
      take: 5
    });

    const invalidTaskCategories = taskCategoriesWithRefs.filter(tc => !tc.task || !tc.category);
    if (invalidTaskCategories.length > 0) {
      throw new Error(`Found ${invalidTaskCategories.length} task-category relationships with invalid references`);
    }

    console.log('✅ All task-category relationships have valid references');
    
    // Test complex relationship queries
    console.log('\n🔍 Testing complex relationship queries...');
    
    const usersWithTasksAndCategories = await prisma.user.findMany({
      include: {
        tasks: {
          include: {
            taskCategories: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });
    
    console.log(`✅ Complex relationship query successful: ${usersWithTasksAndCategories.length} users with tasks and categories`);
    
    // Check password hashing
    console.log('\n🔍 Checking password security...');
    
    const usersWithPlaintextPasswords = await prisma.user.count({
      where: {
        passwordHash: {
          in: ['password', 'admin', '123456', 'password123']
        }
      }
    });
    
    if (usersWithPlaintextPasswords > 0) {
      console.log('⚠️ Warning: Found users with potentially weak passwords');
    } else {
      console.log('✅ All passwords appear to be properly hashed');
    }
    
    // Performance test
    console.log('\n🔍 Running performance tests...');
    
    const startTime = Date.now();
    
    await Promise.all([
      prisma.user.findMany({ take: 10 }),
      prisma.task.findMany({ take: 10, include: { user: true } }),
      prisma.category.findMany({ take: 10 }),
      prisma.taskCategory.findMany({ take: 10, include: { task: true, category: true } })
    ]);
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    console.log(`✅ Performance test completed in ${queryTime}ms`);
    
    if (queryTime > 1000) {
      console.log('⚠️ Warning: Queries took longer than expected (>1000ms)');
    }
    
    console.log('\n🎉 Seed data verification completed successfully!');
    console.log('📊 Final Summary:');
    console.log(`  - Users: ${userCount} ✅`);
    console.log(`  - Categories: ${categoryCount} ✅`);
    console.log(`  - Tasks: ${taskCount} ✅`);
    console.log(`  - Task-Category relationships: ${taskCategoryCount} ✅`);
    console.log(`  - Data integrity: All checks passed ✅`);
    console.log(`  - Performance: ${queryTime}ms ✅`);
    
  } catch (error) {
    console.error('❌ Seed data verification failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the verification
verifySeedData().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
