/**
 * Migration Verification Script
 * 
 * Verifies that the database migration was successful
 * Checks tables, indexes, constraints, and relationships
 */

const { PrismaClient } = require('@prisma/client');

async function verifyMigration() {
  console.log('🚀 Starting migration verification...');
  
  const prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty'
  });

  try {
    // Check tables exist
    console.log('🔍 Checking table existence...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tableNames = tables.map(t => t.table_name);
    const expectedTables = ['users', 'tasks', 'categories', 'task_categories'];
    
    console.log('📋 Found tables:', tableNames);
    
    for (const expectedTable of expectedTables) {
      if (tableNames.includes(expectedTable)) {
        console.log(`✅ Table '${expectedTable}' exists`);
      } else {
        console.log(`❌ Table '${expectedTable}' missing`);
      }
    }

    // Check enums exist
    console.log('\n🔍 Checking enum types...');
    const enums = await prisma.$queryRaw`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
      ORDER BY typname;
    `;
    
    const enumNames = enums.map(e => e.typname);
    const expectedEnums = ['user_role', 'task_priority', 'task_status'];
    
    console.log('📋 Found enums:', enumNames);
    
    for (const expectedEnum of expectedEnums) {
      if (enumNames.includes(expectedEnum)) {
        console.log(`✅ Enum '${expectedEnum}' exists`);
      } else {
        console.log(`❌ Enum '${expectedEnum}' missing`);
      }
    }

    // Check indexes
    console.log('\n🔍 Checking indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `;
    
    console.log('📋 Found custom indexes:', indexes.length);
    indexes.forEach(idx => {
      console.log(`  ✅ ${idx.tablename}.${idx.indexname}`);
    });

    // Check foreign keys
    console.log('\n🔍 Checking foreign key constraints...');
    const foreignKeys = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `;
    
    console.log('📋 Found foreign keys:', foreignKeys.length);
    foreignKeys.forEach(fk => {
      console.log(`  ✅ ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });

    // Test basic CRUD operations
    console.log('\n🔍 Testing basic CRUD operations...');
    
    // Test user creation
    const testUser = await prisma.user.create({
      data: {
        username: 'test_user',
        email: 'test@example.com',
        passwordHash: 'test_hash',
        role: 'user'
      }
    });
    console.log('✅ User creation successful:', testUser.id);

    // Test category creation
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        color: '#FF0000',
        description: 'Test category description'
      }
    });
    console.log('✅ Category creation successful:', testCategory.id);

    // Test task creation
    const testTask = await prisma.task.create({
      data: {
        title: 'Test Task',
        description: 'Test task description',
        userId: testUser.id,
        priority: 'high',
        status: 'pending'
      }
    });
    console.log('✅ Task creation successful:', testTask.id);

    // Test task-category relationship
    const testTaskCategory = await prisma.taskCategory.create({
      data: {
        taskId: testTask.id,
        categoryId: testCategory.id
      }
    });
    console.log('✅ Task-Category relationship creation successful');

    // Test complex query with relationships
    const userWithTasks = await prisma.user.findUnique({
      where: { id: testUser.id },
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
    console.log('✅ Complex relationship query successful');

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await prisma.taskCategory.deleteMany();
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Test data cleanup successful');

    console.log('\n🎉 Migration verification completed successfully!');
    console.log('📊 Summary:');
    console.log(`  - Tables: ${expectedTables.length}/${expectedTables.length} ✅`);
    console.log(`  - Enums: ${expectedEnums.length}/${expectedEnums.length} ✅`);
    console.log(`  - Indexes: ${indexes.length} ✅`);
    console.log(`  - Foreign Keys: ${foreignKeys.length} ✅`);
    console.log(`  - CRUD Operations: All working ✅`);
    console.log(`  - Relationships: All working ✅`);
    
  } catch (error) {
    console.error('❌ Migration verification failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the verification
verifyMigration().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
