-- ===================================
-- Test Data Seed Script
-- ===================================
-- Generated for TSK-IT-000-002-TestDatabase
-- Project: Task Management System - Integration Test
-- Purpose: Comprehensive test data seeding for integration tests

-- Set session configuration
SET timezone = 'UTC';
SET client_min_messages = WARNING;

-- ===================================
-- Clean existing test data
-- ===================================
SELECT test_utilities.cleanup_all_test_data();

-- ===================================
-- Seed Test Users
-- ===================================

-- Admin user for administrative tests
SELECT test_utilities.create_test_user(
    'admin@integration-test.com',
    'Integration',
    'Admin',
    'admin',
    true
);

-- Regular user for standard functionality tests
SELECT test_utilities.create_test_user(
    'user@integration-test.com',
    'Integration',
    'User',
    'user',
    true
);

-- Inactive user for access control tests
SELECT test_utilities.create_test_user(
    'inactive@integration-test.com',
    'Inactive',
    'User',
    'user',
    false
);

-- Test user with many tasks for performance tests
SELECT test_utilities.create_test_user(
    'poweruser@integration-test.com',
    'Power',
    'User',
    'user',
    true
);

-- Test user for edge case scenarios
SELECT test_utilities.create_test_user(
    'edge-case@integration-test.com',
    'Edge',
    'Case',
    'user',
    true
);

-- ===================================
-- Seed Test Categories
-- ===================================

-- Get user IDs for category creation
DO $$
DECLARE
    admin_id UUID;
    user_id UUID;
    poweruser_id UUID;
    edge_user_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_id FROM users WHERE email = 'admin@integration-test.com';
    SELECT id INTO user_id FROM users WHERE email = 'user@integration-test.com';
    SELECT id INTO poweruser_id FROM users WHERE email = 'poweruser@integration-test.com';
    SELECT id INTO edge_user_id FROM users WHERE email = 'edge-case@integration-test.com';

    -- Admin user categories
    PERFORM test_utilities.create_test_category(admin_id, 'Administration', 'Administrative tasks and system management', '#dc3545');
    PERFORM test_utilities.create_test_category(admin_id, 'System Monitoring', 'System health and performance monitoring', '#6c757d');
    PERFORM test_utilities.create_test_category(admin_id, 'User Management', 'User account and permission management', '#fd7e14');

    -- Regular user categories
    PERFORM test_utilities.create_test_category(user_id, 'Work Projects', 'Professional work and project tasks', '#007bff');
    PERFORM test_utilities.create_test_category(user_id, 'Personal Tasks', 'Personal and household tasks', '#28a745');
    PERFORM test_utilities.create_test_category(user_id, 'Learning', 'Educational and skill development tasks', '#6f42c1');
    PERFORM test_utilities.create_test_category(user_id, 'Health & Fitness', 'Health, fitness, and wellness tasks', '#e83e8c');

    -- Power user categories (for performance testing)
    PERFORM test_utilities.create_test_category(poweruser_id, 'High Volume Category 1', 'Category for high volume testing', '#17a2b8');
    PERFORM test_utilities.create_test_category(poweruser_id, 'High Volume Category 2', 'Another category for volume testing', '#ffc107');
    PERFORM test_utilities.create_test_category(poweruser_id, 'Performance Testing', 'Category specifically for performance tests', '#20c997');

    -- Edge case user categories
    PERFORM test_utilities.create_test_category(edge_user_id, 'Special Characters !@#$%', 'Category with special characters', '#6610f2');
    PERFORM test_utilities.create_test_category(edge_user_id, 'Very Long Category Name That Tests Maximum Length Limits And Boundary Conditions', 'Testing long names', '#fd7e14');
    PERFORM test_utilities.create_test_category(edge_user_id, 'Unicode Test 测试 🚀', 'Testing unicode support', '#e83e8c');
END $$;

-- ===================================
-- Seed Test Tasks
-- ===================================

DO $$
DECLARE
    admin_id UUID;
    user_id UUID;
    poweruser_id UUID;
    edge_user_id UUID;
    admin_cat_id UUID;
    work_cat_id UUID;
    personal_cat_id UUID;
    learning_cat_id UUID;
    volume_cat_id UUID;
    special_cat_id UUID;
    i INTEGER;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_id FROM users WHERE email = 'admin@integration-test.com';
    SELECT id INTO user_id FROM users WHERE email = 'user@integration-test.com';
    SELECT id INTO poweruser_id FROM users WHERE email = 'poweruser@integration-test.com';
    SELECT id INTO edge_user_id FROM users WHERE email = 'edge-case@integration-test.com';

    -- Get category IDs
    SELECT id INTO admin_cat_id FROM categories WHERE name = 'Administration' AND user_id = admin_id;
    SELECT id INTO work_cat_id FROM categories WHERE name = 'Work Projects' AND user_id = user_id;
    SELECT id INTO personal_cat_id FROM categories WHERE name = 'Personal Tasks' AND user_id = user_id;
    SELECT id INTO learning_cat_id FROM categories WHERE name = 'Learning' AND user_id = user_id;
    SELECT id INTO volume_cat_id FROM categories WHERE name = 'High Volume Category 1' AND user_id = poweruser_id;
    SELECT id INTO special_cat_id FROM categories WHERE name = 'Special Characters !@#$%' AND user_id = edge_user_id;

    -- Admin tasks
    PERFORM test_utilities.create_test_task(
        admin_id, 
        'System Health Check', 
        'Perform daily system health monitoring and report any issues',
        'pending',
        'high',
        admin_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '1 day'
    );

    PERFORM test_utilities.create_test_task(
        admin_id,
        'User Account Audit',
        'Review user accounts for security compliance',
        'in_progress',
        'medium',
        admin_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '3 days'
    );

    PERFORM test_utilities.create_test_task(
        admin_id,
        'Database Backup Verification',
        'Verify that all database backups are working correctly',
        'completed',
        'high',
        admin_cat_id,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );

    -- Regular user work tasks
    PERFORM test_utilities.create_test_task(
        user_id,
        'Complete Project Proposal',
        'Finish writing the Q1 project proposal document',
        'in_progress',
        'high',
        work_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '2 days'
    );

    PERFORM test_utilities.create_test_task(
        user_id,
        'Team Meeting Preparation',
        'Prepare agenda and materials for weekly team meeting',
        'pending',
        'medium',
        work_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '1 day'
    );

    PERFORM test_utilities.create_test_task(
        user_id,
        'Code Review',
        'Review pull requests from team members',
        'pending',
        'medium',
        work_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '6 hours'
    );

    -- Personal tasks
    PERFORM test_utilities.create_test_task(
        user_id,
        'Grocery Shopping',
        'Buy groceries for the week including fresh vegetables and fruits',
        'pending',
        'low',
        personal_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '2 days'
    );

    PERFORM test_utilities.create_test_task(
        user_id,
        'Doctor Appointment',
        'Annual health checkup appointment',
        'pending',
        'medium',
        personal_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '1 week'
    );

    -- Learning tasks
    PERFORM test_utilities.create_test_task(
        user_id,
        'Complete Online Course',
        'Finish the advanced JavaScript course on the learning platform',
        'in_progress',
        'medium',
        learning_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '2 weeks'
    );

    PERFORM test_utilities.create_test_task(
        user_id,
        'Read Technical Book',
        'Read "Clean Code" by Robert Martin - currently on chapter 5',
        'in_progress',
        'low',
        learning_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '1 month'
    );

    -- High volume tasks for performance testing
    FOR i IN 1..50 LOOP
        PERFORM test_utilities.create_test_task(
            poweruser_id,
            'Performance Test Task ' || i,
            'This is performance test task number ' || i || ' for load testing',
            CASE (i % 3)
                WHEN 0 THEN 'completed'
                WHEN 1 THEN 'in_progress'
                ELSE 'pending'
            END,
            CASE (i % 3)
                WHEN 0 THEN 'low'
                WHEN 1 THEN 'medium'
                ELSE 'high'
            END,
            volume_cat_id,
            CURRENT_TIMESTAMP + (i || ' hours')::INTERVAL
        );
    END LOOP;

    -- Edge case tasks
    PERFORM test_utilities.create_test_task(
        edge_user_id,
        'Task with Special Characters !@#$%^&*()',
        'Testing task with special characters in title and description: !@#$%^&*()',
        'pending',
        'medium',
        special_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '1 day'
    );

    PERFORM test_utilities.create_test_task(
        edge_user_id,
        'Very Long Task Title That Tests The Maximum Length Limits And Boundary Conditions For Task Titles In The System',
        'This is a very long task description that tests the maximum length limits and boundary conditions for task descriptions in the system. It contains multiple sentences and should test how the system handles long text content. This description continues to test various edge cases and boundary conditions that might occur in real-world usage scenarios.',
        'pending',
        'low',
        special_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '1 week'
    );

    PERFORM test_utilities.create_test_task(
        edge_user_id,
        'Unicode Test Task 测试任务 🚀🎯📝',
        'Testing unicode support in tasks: 测试中文字符 🚀 Emoji support 🎯 Various symbols 📝',
        'pending',
        'medium',
        special_cat_id,
        CURRENT_TIMESTAMP + INTERVAL '3 days'
    );

    -- Tasks with no category (testing null category handling)
    PERFORM test_utilities.create_test_task(
        user_id,
        'Uncategorized Task',
        'This task has no category assigned to test null category handling',
        'pending',
        'low',
        NULL,
        CURRENT_TIMESTAMP + INTERVAL '1 week'
    );

    -- Overdue tasks for testing
    PERFORM test_utilities.create_test_task(
        user_id,
        'Overdue Task',
        'This task is overdue to test overdue task handling',
        'pending',
        'high',
        work_cat_id,
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    );

    -- Tasks with no due date
    PERFORM test_utilities.create_test_task(
        user_id,
        'No Due Date Task',
        'This task has no due date to test null due date handling',
        'pending',
        'medium',
        personal_cat_id,
        NULL
    );
END $$;

-- ===================================
-- Verify seeded data
-- ===================================

-- Display seeding results
DO $$
DECLARE
    user_count INTEGER;
    category_count INTEGER;
    task_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO category_count FROM categories;
    SELECT COUNT(*) INTO task_count FROM tasks;
    
    RAISE NOTICE '=== Test Data Seeding Completed ===';
    RAISE NOTICE 'Users created: %', user_count;
    RAISE NOTICE 'Categories created: %', category_count;
    RAISE NOTICE 'Tasks created: %', task_count;
    RAISE NOTICE '=== Seeding Summary ===';
    
    -- Show data distribution
    RAISE NOTICE 'Data distribution by user:';
    FOR rec IN 
        SELECT 
            u.email,
            COUNT(DISTINCT c.id) as categories,
            COUNT(DISTINCT t.id) as tasks
        FROM users u
        LEFT JOIN categories c ON u.id = c.user_id
        LEFT JOIN tasks t ON u.id = t.user_id
        GROUP BY u.email
        ORDER BY u.email
    LOOP
        RAISE NOTICE '  %: % categories, % tasks', rec.email, rec.categories, rec.tasks;
    END LOOP;
END $$;

-- Run data integrity validation
SELECT * FROM test_utilities.validate_data_integrity();

-- Show test data statistics
SELECT * FROM test_utilities.get_test_data_stats();

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Test data seeding completed successfully at %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'Database is ready for integration testing';
END $$;
