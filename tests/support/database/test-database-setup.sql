-- ===================================
-- Test Database Setup Script
-- ===================================
-- Generated for TSK-IT-000-002-TestDatabase
-- Project: Task Management System - Integration Test
-- Purpose: Advanced test database setup and configuration

-- Set session configuration for testing
SET timezone = 'UTC';
SET client_min_messages = WARNING;
SET log_statement = 'none';

-- Create test-specific schemas
CREATE SCHEMA IF NOT EXISTS test_data;
CREATE SCHEMA IF NOT EXISTS test_fixtures;
CREATE SCHEMA IF NOT EXISTS test_utilities;

-- Grant permissions on test schemas
GRANT ALL ON SCHEMA test_data TO integration_user;
GRANT ALL ON SCHEMA test_fixtures TO integration_user;
GRANT ALL ON SCHEMA test_utilities TO integration_user;

-- Set search path to include test schemas
ALTER DATABASE taskdb_integration SET search_path TO public, test_data, test_fixtures, test_utilities;

-- ===================================
-- Test Data Management Functions
-- ===================================

-- Function to generate test UUID with prefix
CREATE OR REPLACE FUNCTION test_utilities.generate_test_uuid(prefix TEXT DEFAULT 'test')
RETURNS UUID AS $$
BEGIN
    RETURN (prefix || '-' || substring(gen_random_uuid()::text, 6))::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

-- Function to create test user with specific role
CREATE OR REPLACE FUNCTION test_utilities.create_test_user(
    p_email TEXT,
    p_first_name TEXT DEFAULT 'Test',
    p_last_name TEXT DEFAULT 'User',
    p_role TEXT DEFAULT 'user',
    p_is_active BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    user_id := test_utilities.generate_test_uuid('user');
    
    INSERT INTO users (
        id, email, password_hash, first_name, last_name, 
        role, is_active, email_verified, created_at, updated_at
    ) VALUES (
        user_id, p_email, '$2b$10$rQZ9QmjQQm9QmjQQm9QmjO',
        p_first_name, p_last_name, p_role, p_is_active, true,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO user_id;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create test category
CREATE OR REPLACE FUNCTION test_utilities.create_test_category(
    p_user_id UUID,
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_color TEXT DEFAULT '#007bff'
)
RETURNS UUID AS $$
DECLARE
    category_id UUID;
BEGIN
    category_id := test_utilities.generate_test_uuid('cat');
    
    INSERT INTO categories (
        id, name, description, color, user_id, created_at, updated_at
    ) VALUES (
        category_id, p_name, p_description, p_color, p_user_id,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (name, user_id) DO UPDATE SET
        description = EXCLUDED.description,
        color = EXCLUDED.color,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO category_id;
    
    RETURN category_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create test task
CREATE OR REPLACE FUNCTION test_utilities.create_test_task(
    p_user_id UUID,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'pending',
    p_priority TEXT DEFAULT 'medium',
    p_category_id UUID DEFAULT NULL,
    p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    task_id UUID;
BEGIN
    task_id := test_utilities.generate_test_uuid('task');
    
    INSERT INTO tasks (
        id, title, description, status, priority, 
        user_id, category_id, due_date, created_at, updated_at
    ) VALUES (
        task_id, p_title, p_description, p_status, p_priority,
        p_user_id, p_category_id, p_due_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );
    
    RETURN task_id;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- Test Data Cleanup Functions
-- ===================================

-- Function to clean specific user's data
CREATE OR REPLACE FUNCTION test_utilities.cleanup_user_data(p_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Delete in correct order to respect foreign key constraints
    DELETE FROM tasks WHERE user_id = p_user_id;
    DELETE FROM categories WHERE user_id = p_user_id;
    DELETE FROM users WHERE id = p_user_id;
    
    RAISE NOTICE 'Cleaned up data for user: %', p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean all test data
CREATE OR REPLACE FUNCTION test_utilities.cleanup_all_test_data()
RETURNS void AS $$
BEGIN
    -- Delete all data in correct order
    DELETE FROM tasks;
    DELETE FROM categories;
    DELETE FROM users;
    
    -- Reset sequences
    PERFORM setval(pg_get_serial_sequence('users', 'id'), 1, false);
    PERFORM setval(pg_get_serial_sequence('categories', 'id'), 1, false);
    PERFORM setval(pg_get_serial_sequence('tasks', 'id'), 1, false);
    
    RAISE NOTICE 'All test data cleaned up successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to clean data by date range
CREATE OR REPLACE FUNCTION test_utilities.cleanup_data_by_date(
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
RETURNS void AS $$
BEGIN
    DELETE FROM tasks 
    WHERE created_at BETWEEN p_start_date AND p_end_date;
    
    DELETE FROM categories 
    WHERE created_at BETWEEN p_start_date AND p_end_date
    AND id NOT IN (SELECT DISTINCT category_id FROM tasks WHERE category_id IS NOT NULL);
    
    DELETE FROM users 
    WHERE created_at BETWEEN p_start_date AND p_end_date
    AND id NOT IN (
        SELECT DISTINCT user_id FROM tasks 
        UNION 
        SELECT DISTINCT user_id FROM categories
    );
    
    RAISE NOTICE 'Cleaned up data created between % and %', p_start_date, p_end_date;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- Test Data Validation Functions
-- ===================================

-- Function to validate data integrity
CREATE OR REPLACE FUNCTION test_utilities.validate_data_integrity()
RETURNS TABLE(
    table_name TEXT,
    issue_type TEXT,
    issue_count BIGINT,
    details TEXT
) AS $$
BEGIN
    -- Check for orphaned tasks (tasks without valid users)
    RETURN QUERY
    SELECT 
        'tasks'::TEXT,
        'orphaned_user_references'::TEXT,
        COUNT(*)::BIGINT,
        'Tasks with invalid user_id references'::TEXT
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE u.id IS NULL AND COUNT(*) > 0;
    
    -- Check for orphaned tasks (tasks with invalid categories)
    RETURN QUERY
    SELECT 
        'tasks'::TEXT,
        'orphaned_category_references'::TEXT,
        COUNT(*)::BIGINT,
        'Tasks with invalid category_id references'::TEXT
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.category_id IS NOT NULL AND c.id IS NULL AND COUNT(*) > 0;
    
    -- Check for orphaned categories (categories without valid users)
    RETURN QUERY
    SELECT 
        'categories'::TEXT,
        'orphaned_user_references'::TEXT,
        COUNT(*)::BIGINT,
        'Categories with invalid user_id references'::TEXT
    FROM categories cat
    LEFT JOIN users u ON cat.user_id = u.id
    WHERE u.id IS NULL AND COUNT(*) > 0;
    
    -- Check for duplicate emails
    RETURN QUERY
    SELECT 
        'users'::TEXT,
        'duplicate_emails'::TEXT,
        COUNT(*) - COUNT(DISTINCT email)::BIGINT,
        'Users with duplicate email addresses'::TEXT
    FROM users
    HAVING COUNT(*) > COUNT(DISTINCT email);
    
END;
$$ LANGUAGE plpgsql;

-- Function to get test data statistics
CREATE OR REPLACE FUNCTION test_utilities.get_test_data_stats()
RETURNS TABLE(
    entity_type TEXT,
    total_count BIGINT,
    active_count BIGINT,
    created_today BIGINT,
    last_created TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Users statistics
    RETURN QUERY
    SELECT 
        'users'::TEXT,
        COUNT(*)::BIGINT,
        COUNT(*) FILTER (WHERE is_active = true)::BIGINT,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT,
        MAX(created_at)
    FROM users;
    
    -- Categories statistics
    RETURN QUERY
    SELECT 
        'categories'::TEXT,
        COUNT(*)::BIGINT,
        COUNT(*)::BIGINT, -- All categories are considered active
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT,
        MAX(created_at)
    FROM categories;
    
    -- Tasks statistics
    RETURN QUERY
    SELECT 
        'tasks'::TEXT,
        COUNT(*)::BIGINT,
        COUNT(*) FILTER (WHERE status != 'completed')::BIGINT,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT,
        MAX(created_at)
    FROM tasks;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- Test Performance Functions
-- ===================================

-- Function to measure query performance
CREATE OR REPLACE FUNCTION test_utilities.measure_query_performance(
    p_query TEXT,
    p_iterations INTEGER DEFAULT 10
)
RETURNS TABLE(
    iteration INTEGER,
    execution_time_ms NUMERIC,
    rows_affected BIGINT
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
    end_time TIMESTAMP WITH TIME ZONE;
    i INTEGER;
    result_count BIGINT;
BEGIN
    FOR i IN 1..p_iterations LOOP
        start_time := clock_timestamp();
        
        EXECUTE p_query;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        
        end_time := clock_timestamp();
        
        RETURN QUERY SELECT 
            i,
            EXTRACT(EPOCH FROM (end_time - start_time)) * 1000,
            result_count;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- Grant permissions on all functions
-- ===================================
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test_utilities TO integration_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test_data TO integration_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test_fixtures TO integration_user;

-- ===================================
-- Create test data views for easy access
-- ===================================

-- View for test users summary
CREATE OR REPLACE VIEW test_utilities.test_users_summary AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.is_active,
    COUNT(DISTINCT c.id) as category_count,
    COUNT(DISTINCT t.id) as task_count,
    u.created_at
FROM users u
LEFT JOIN categories c ON u.id = c.user_id
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at
ORDER BY u.created_at DESC;

-- View for test data overview
CREATE OR REPLACE VIEW test_utilities.test_data_overview AS
SELECT 
    'users' as entity_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count,
    MIN(created_at) as earliest_created,
    MAX(created_at) as latest_created
FROM users
UNION ALL
SELECT 
    'categories' as entity_type,
    COUNT(*) as total_count,
    COUNT(*) as active_count,
    MIN(created_at) as earliest_created,
    MAX(created_at) as latest_created
FROM categories
UNION ALL
SELECT 
    'tasks' as entity_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status != 'completed') as active_count,
    MIN(created_at) as earliest_created,
    MAX(created_at) as latest_created
FROM tasks;

-- Grant permissions on views
GRANT SELECT ON test_utilities.test_users_summary TO integration_user;
GRANT SELECT ON test_utilities.test_data_overview TO integration_user;

-- Log successful setup
DO $$
BEGIN
    RAISE NOTICE 'Test database setup completed successfully at %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'Available test utilities:';
    RAISE NOTICE '  - test_utilities.create_test_user()';
    RAISE NOTICE '  - test_utilities.create_test_category()';
    RAISE NOTICE '  - test_utilities.create_test_task()';
    RAISE NOTICE '  - test_utilities.cleanup_all_test_data()';
    RAISE NOTICE '  - test_utilities.validate_data_integrity()';
    RAISE NOTICE '  - test_utilities.get_test_data_stats()';
END $$;
