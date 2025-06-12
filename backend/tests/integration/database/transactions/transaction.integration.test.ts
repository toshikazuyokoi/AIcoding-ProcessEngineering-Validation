/**
 * Transaction Integration Test Suite
 * 
 * Comprehensive tests for transaction processing and ACID properties
 * Tests atomicity, consistency, isolation, durability, and error handling
 * 
 * @fileoverview Integration tests for transaction management
 * @version 1.0.0
 * @since 2025-01-28
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { UserRepository } from '../../../../src/repositories/user-repository';
import { TaskRepository } from '../../../../src/repositories/task-repository';
import { CategoryRepository } from '../../../../src/repositories/category-repository';
import { DatabaseConnection } from '../../../../src/utils/database-connection';
import { setupTestDatabase, teardownTestDatabase } from '../../../utils/test-database';

describe('Transaction Integration Tests', () => {
  let prisma: PrismaClient;
  let userRepository: UserRepository;
  let taskRepository: TaskRepository;
  let categoryRepository: CategoryRepository;
  let dbConnection: DatabaseConnection;

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();

    // Create direct Prisma client for testing
    const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('Database URL not configured');
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });

    // Initialize database connection for repositories
    dbConnection = DatabaseConnection.getInstance();

    // Initialize repositories
    userRepository = new UserRepository({ prismaClient: prisma });
    taskRepository = new TaskRepository({ prismaClient: prisma });
    categoryRepository = new CategoryRepository({ prismaClient: prisma });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await prisma.taskCategory.deleteMany();
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('IT-TX-001: Atomicity Tests', () => {
    test('should commit all operations when transaction succeeds', async () => {
      const userData = {
        username: 'atomicuser',
        email: 'atomic@example.com',
        passwordHash: 'hashedpassword123'
      };

      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: userData
        });

        // Create category
        const category = await tx.category.create({
          data: {
            name: 'Atomic Category',
            color: '#FF0000'
          }
        });

        // Create task
        const task = await tx.task.create({
          data: {
            title: 'Atomic Task',
            userId: user.id,
            priority: 'high',
            status: 'pending'
          }
        });

        return { user, category, task };
      });

      // Verify all data was committed
      expect(result.user).toBeDefined();
      expect(result.category).toBeDefined();
      expect(result.task).toBeDefined();

      // Verify data exists in database
      const users = await prisma.user.findMany();
      const categories = await prisma.category.findMany();
      const tasks = await prisma.task.findMany();

      expect(users).toHaveLength(1);
      expect(categories).toHaveLength(1);
      expect(tasks).toHaveLength(1);
    });

    test('should rollback all operations when transaction fails', async () => {
      const userData = {
        username: 'rollbackuser',
        email: 'rollback@example.com',
        passwordHash: 'hashedpassword123'
      };

      await expect(
        prisma.$transaction(async (tx) => {
          // Create user
          await tx.user.create({
            data: userData
          });

          // Create category
          await tx.category.create({
            data: {
              name: 'Rollback Category',
              color: '#00FF00'
            }
          });

          // Force transaction failure
          throw new Error('Intentional transaction failure');
        })
      ).rejects.toThrow('Intentional transaction failure');

      // Verify no data was committed
      const users = await prisma.user.findMany();
      const categories = await prisma.category.findMany();

      expect(users).toHaveLength(0);
      expect(categories).toHaveLength(0);
    });
  });

  describe('IT-TX-002: Consistency Tests', () => {
    test('should maintain referential integrity during transaction', async () => {
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            username: 'consistentuser',
            email: 'consistent@example.com',
            passwordHash: 'hashedpassword123'
          }
        });

        // Create tasks with valid user reference
        const task1 = await tx.task.create({
          data: {
            title: 'Consistent Task 1',
            userId: user.id,
            priority: 'medium',
            status: 'pending'
          }
        });

        const task2 = await tx.task.create({
          data: {
            title: 'Consistent Task 2',
            userId: user.id,
            priority: 'low',
            status: 'in_progress'
          }
        });

        return { user, tasks: [task1, task2] };
      });

      // Verify referential integrity
      const userWithTasks = await prisma.user.findUnique({
        where: { id: result.user.id },
        include: { tasks: true }
      });

      expect(userWithTasks).toBeDefined();
      expect(userWithTasks!.tasks).toHaveLength(2);
      expect(userWithTasks!.tasks.every(task => task.userId === result.user.id)).toBe(true);
    });

    test('should enforce unique constraints within transaction', async () => {
      await expect(
        prisma.$transaction(async (tx) => {
          // Create first user
          await tx.user.create({
            data: {
              username: 'uniqueuser',
              email: 'unique@example.com',
              passwordHash: 'hashedpassword123'
            }
          });

          // Try to create second user with same email (should fail)
          await tx.user.create({
            data: {
              username: 'duplicateuser',
              email: 'unique@example.com', // Duplicate email
              passwordHash: 'hashedpassword456'
            }
          });
        })
      ).rejects.toThrow();

      // Verify no users were created due to constraint violation
      const users = await prisma.user.findMany({
        where: { email: 'unique@example.com' }
      });

      expect(users).toHaveLength(0);
    });
  });

  describe('IT-TX-003: Isolation Tests', () => {
    test('should isolate concurrent transactions', async () => {
      const userData1 = {
        username: 'concurrent1',
        email: 'concurrent1@example.com',
        passwordHash: 'hashedpassword123'
      };

      const userData2 = {
        username: 'concurrent2',
        email: 'concurrent2@example.com',
        passwordHash: 'hashedpassword456'
      };

      // Execute concurrent transactions
      const [result1, result2] = await Promise.all([
        prisma.$transaction(async (tx) => {
          const user = await tx.user.create({ data: userData1 });
          
          // Simulate some processing time
          await new Promise(resolve => setTimeout(resolve, 100));
          
          return user;
        }),
        prisma.$transaction(async (tx) => {
          const user = await tx.user.create({ data: userData2 });
          
          // Simulate some processing time
          await new Promise(resolve => setTimeout(resolve, 100));
          
          return user;
        })
      ]);

      // Verify both transactions completed successfully
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.id).not.toBe(result2.id);

      // Verify both users exist in database
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(2);
    });
  });

  describe('IT-TX-004: Durability Tests', () => {
    test('should persist committed data after transaction completion', async () => {
      const userData = {
        username: 'durableuser',
        email: 'durable@example.com',
        passwordHash: 'hashedpassword123'
      };

      // Execute transaction
      const user = await prisma.$transaction(async (tx) => {
        return await tx.user.create({ data: userData });
      });

      // Simulate application restart by creating new connection
      const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('Database URL not configured');
      }

      const newPrisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        }
      });

      try {
        // Verify data persists with new connection
        const persistedUser = await newPrisma.user.findUnique({
          where: { id: user.id }
        });

        expect(persistedUser).toBeDefined();
        expect(persistedUser!.email).toBe(userData.email);
      } finally {
        await newPrisma.$disconnect();
      }
    });
  });

  describe('IT-TX-005: Nested Transaction Tests', () => {
    test('should handle nested transactions correctly', async () => {
      const result = await prisma.$transaction(async (tx) => {
        // Outer transaction: Create user
        const user = await tx.user.create({
          data: {
            username: 'nesteduser',
            email: 'nested@example.com',
            passwordHash: 'hashedpassword123'
          }
        });

        // Inner operation: Create multiple tasks
        const tasks = await Promise.all([
          tx.task.create({
            data: {
              title: 'Nested Task 1',
              userId: user.id,
              priority: 'high',
              status: 'pending'
            }
          }),
          tx.task.create({
            data: {
              title: 'Nested Task 2',
              userId: user.id,
              priority: 'medium',
              status: 'in_progress'
            }
          })
        ]);

        return { user, tasks };
      });

      // Verify nested operations completed
      expect(result.user).toBeDefined();
      expect(result.tasks).toHaveLength(2);

      // Verify data in database
      const userWithTasks = await prisma.user.findUnique({
        where: { id: result.user.id },
        include: { tasks: true }
      });

      expect(userWithTasks!.tasks).toHaveLength(2);
    });
  });

  describe('IT-TX-006: Deadlock Handling Tests', () => {
    test('should handle potential deadlock scenarios', async () => {
      // Create initial data
      const user1 = await prisma.user.create({
        data: {
          username: 'deadlock1',
          email: 'deadlock1@example.com',
          passwordHash: 'hashedpassword123'
        }
      });

      const user2 = await prisma.user.create({
        data: {
          username: 'deadlock2',
          email: 'deadlock2@example.com',
          passwordHash: 'hashedpassword456'
        }
      });

      // Execute potentially conflicting transactions
      const results = await Promise.allSettled([
        prisma.$transaction(async (tx) => {
          // Update user1 first, then user2
          await tx.user.update({
            where: { id: user1.id },
            data: { username: 'deadlock1_updated' }
          });

          await new Promise(resolve => setTimeout(resolve, 50));

          await tx.user.update({
            where: { id: user2.id },
            data: { username: 'deadlock2_updated_by_tx1' }
          });

          return 'transaction1_completed';
        }),
        prisma.$transaction(async (tx) => {
          // Update user2 first, then user1
          await tx.user.update({
            where: { id: user2.id },
            data: { username: 'deadlock2_updated' }
          });

          await new Promise(resolve => setTimeout(resolve, 50));

          await tx.user.update({
            where: { id: user1.id },
            data: { username: 'deadlock1_updated_by_tx2' }
          });

          return 'transaction2_completed';
        })
      ]);

      // At least one transaction should complete successfully
      const successfulResults = results.filter(result => result.status === 'fulfilled');
      expect(successfulResults.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('IT-TX-007: Timeout Handling Tests', () => {
    test('should handle transaction timeout', async () => {
      await expect(
        prisma.$transaction(
          async (tx) => {
            await tx.user.create({
              data: {
                username: 'timeoutuser',
                email: 'timeout@example.com',
                passwordHash: 'hashedpassword123'
              }
            });

            // Simulate long-running operation
            await new Promise(resolve => setTimeout(resolve, 1500));

            return 'should_not_reach_here';
          },
          {
            maxWait: 500,  // 0.5 second max wait
            timeout: 1000  // 1 second timeout
          }
        )
      ).rejects.toThrow();

      // Verify no data was committed
      const users = await prisma.user.findMany({
        where: { email: 'timeout@example.com' }
      });

      expect(users).toHaveLength(0);
    });
  });

  describe('IT-TX-008: Isolation Level Tests', () => {
    test('should respect different isolation levels', async () => {
      // Create initial user
      const user = await prisma.user.create({
        data: {
          username: 'isolationuser',
          email: 'isolation@example.com',
          passwordHash: 'hashedpassword123'
        }
      });

      // Test with ReadCommitted isolation level
      const result = await prisma.$transaction(
        async (tx) => {
          // Read user
          const readUser = await tx.user.findUnique({
            where: { id: user.id }
          });

          // Update user
          const updatedUser = await tx.user.update({
            where: { id: user.id },
            data: { username: 'isolationuser_updated' }
          });

          return { readUser, updatedUser };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
        }
      );

      expect(result.readUser).toBeDefined();
      expect(result.updatedUser).toBeDefined();
      expect(result.updatedUser.username).toBe('isolationuser_updated');

      // Verify update was committed
      const finalUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      expect(finalUser!.username).toBe('isolationuser_updated');
    });
  });
});
