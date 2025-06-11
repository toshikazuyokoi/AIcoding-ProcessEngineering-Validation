-- ===================================
-- Test Data Cleanup Script
-- ===================================
-- Generated for TSK-IT-000-002-TestDatabase
-- Project: Task Management System - Integration Test
-- Purpose: Comprehensive test data cleanup for integration tests

-- Set session configuration
SET timezone = 'UTC';
SET client_min_messages = WARNING;

-- ===================================
-- Cleanup Options Configuration
-- ===================================

-- Create temporary table for cleanup configuration
CREATE TEMP TABLE IF NOT EXISTS cleanup_config (
    option_name TEXT PRIMARY KEY,
    option_value TEXT,
    description TEXT
);

-- Insert default cleanup configuration
INSERT INTO cleanup_config (option_name, option_value, description) VALUES
('cleanup_mode', 'full', 'Cleanup mode: full, partial, selective'),
('preserve_schema', 'true', 'Whether to preserve database schema'),
('reset_sequences', 'true', 'Whether to reset auto-increment sequences'),
('backup_before_cleanup', 'false', 'Whether to backup data before cleanup'),
('cleanup_logs', 'true', 'Whether to log cleanup operations'),
('validate_after_cleanup', 'true', 'Whether to validate database after cleanup');

-- ===================================
-- Pre-cleanup Validation
-- ===================================

DO $$
DECLARE
    cleanup_mode TEXT;
    user_count INTEGER;
    category_count INTEGER;
    task_count INTEGER;
BEGIN
    -- Get cleanup mode
    SELECT option_value INTO cleanup_mode 
    FROM cleanup_config 
    WHERE option_name = 'cleanup_mode';
    
    -- Get current data counts
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO category_count FROM categories;
    SELECT COUNT(*) INTO task_count FROM tasks;
    
    RAISE NOTICE '=== Pre-cleanup Database State ===';
    RAISE NOTICE 'Cleanup mode: %', cleanup_mode;
    RAISE NOTICE 'Current users: %', user_count;
    RAISE NOTICE 'Current categories: %', category_count;
    RAISE NOTICE 'Current tasks: %', task_count;
    RAISE NOTICE 'Cleanup started at: %', CURRENT_TIMESTAMP;
END $$;

-- ===================================
-- Backup Data (if requested)
-- ===================================

DO $$
DECLARE
    backup_enabled BOOLEAN;
BEGIN
    SELECT (option_value = 'true') INTO backup_enabled 
    FROM cleanup_config 
    WHERE option_name = 'backup_before_cleanup';
    
    IF backup_enabled THEN
        -- Create backup schema if it doesn't exist
        CREATE SCHEMA IF NOT EXISTS test_backup;
        
        -- Backup current data
        DROP TABLE IF EXISTS test_backup.users_backup;
        DROP TABLE IF EXISTS test_backup.categories_backup;
        DROP TABLE IF EXISTS test_backup.tasks_backup;
        
        CREATE TABLE test_backup.users_backup AS SELECT * FROM users;
        CREATE TABLE test_backup.categories_backup AS SELECT * FROM categories;
        CREATE TABLE test_backup.tasks_backup AS SELECT * FROM tasks;
        
        RAISE NOTICE 'Data backed up to test_backup schema';
    END IF;
END $$;

-- ===================================
-- Selective Cleanup Functions
-- ===================================

-- Function to cleanup test data by pattern
CREATE OR REPLACE FUNCTION cleanup_by_pattern(email_pattern TEXT)
RETURNS void AS $$
DECLARE
    deleted_users INTEGER := 0;
    deleted_categories INTEGER := 0;
    deleted_tasks INTEGER := 0;
BEGIN
    -- Delete tasks for matching users
    WITH user_ids AS (
        SELECT id FROM users WHERE email LIKE email_pattern
    )
    DELETE FROM tasks 
    WHERE user_id IN (SELECT id FROM user_ids);
    GET DIAGNOSTICS deleted_tasks = ROW_COUNT;
    
    -- Delete categories for matching users
    WITH user_ids AS (
        SELECT id FROM users WHERE email LIKE email_pattern
    )
    DELETE FROM categories 
    WHERE user_id IN (SELECT id FROM user_ids);
    GET DIAGNOSTICS deleted_categories = ROW_COUNT;
    
    -- Delete matching users
    DELETE FROM users WHERE email LIKE email_pattern;
    GET DIAGNOSTICS deleted_users = ROW_COUNT;
    
    RAISE NOTICE 'Cleanup by pattern "%": % users, % categories, % tasks deleted', 
                 email_pattern, deleted_users, deleted_categories, deleted_tasks;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup data older than specified date
CREATE OR REPLACE FUNCTION cleanup_by_date(cutoff_date TIMESTAMP WITH TIME ZONE)
RETURNS void AS $$
DECLARE
    deleted_users INTEGER := 0;
    deleted_categories INTEGER := 0;
    deleted_tasks INTEGER := 0;
BEGIN
    -- Delete old tasks
    DELETE FROM tasks WHERE created_at < cutoff_date;
    GET DIAGNOSTICS deleted_tasks = ROW_COUNT;
    
    -- Delete categories with no remaining tasks
    DELETE FROM categories 
    WHERE created_at < cutoff_date 
    AND id NOT IN (SELECT DISTINCT category_id FROM tasks WHERE category_id IS NOT NULL);
    GET DIAGNOSTICS deleted_categories = ROW_COUNT;
    
    -- Delete users with no remaining data
    DELETE FROM users 
    WHERE created_at < cutoff_date 
    AND id NOT IN (
        SELECT DISTINCT user_id FROM tasks 
        UNION 
        SELECT DISTINCT user_id FROM categories
    );
    GET DIAGNOSTICS deleted_users = ROW_COUNT;
    
    RAISE NOTICE 'Cleanup by date (before %): % users, % categories, % tasks deleted', 
                 cutoff_date, deleted_users, deleted_categories, deleted_tasks;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup specific user's data
CREATE OR REPLACE FUNCTION cleanup_user_data(user_email TEXT)
RETURNS void AS $$
DECLARE
    target_user_id UUID;
    deleted_categories INTEGER := 0;
    deleted_tasks INTEGER := 0;
BEGIN
    -- Get user ID
    SELECT id INTO target_user_id FROM users WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found', user_email;
        RETURN;
    END IF;
    
    -- Delete user's tasks
    DELETE FROM tasks WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_tasks = ROW_COUNT;
    
    -- Delete user's categories
    DELETE FROM categories WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_categories = ROW_COUNT;
    
    -- Delete user
    DELETE FROM users WHERE id = target_user_id;
    
    RAISE NOTICE 'Cleanup for user %: % categories, % tasks deleted', 
                 user_email, deleted_categories, deleted_tasks;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- Main Cleanup Execution
-- ===================================

DO $$
DECLARE
    cleanup_mode TEXT;
    reset_sequences BOOLEAN;
    preserve_schema BOOLEAN;
    start_time TIMESTAMP WITH TIME ZONE;
    end_time TIMESTAMP WITH TIME ZONE;
    execution_time INTERVAL;
BEGIN
    start_time := CURRENT_TIMESTAMP;
    
    -- Get configuration
    SELECT option_value INTO cleanup_mode FROM cleanup_config WHERE option_name = 'cleanup_mode';
    SELECT (option_value = 'true') INTO reset_sequences FROM cleanup_config WHERE option_name = 'reset_sequences';
    SELECT (option_value = 'true') INTO preserve_schema FROM cleanup_config WHERE option_name = 'preserve_schema';
    
    RAISE NOTICE '=== Starting Cleanup Process ===';
    RAISE NOTICE 'Mode: %, Reset Sequences: %, Preserve Schema: %', 
                 cleanup_mode, reset_sequences, preserve_schema;
    
    -- Execute cleanup based on mode
    CASE cleanup_mode
        WHEN 'full' THEN
            -- Full cleanup - remove all test data
            RAISE NOTICE 'Performing full cleanup...';
            PERFORM test_utilities.cleanup_all_test_data();
            
        WHEN 'partial' THEN
            -- Partial cleanup - keep some basic data
            RAISE NOTICE 'Performing partial cleanup...';
            PERFORM cleanup_by_pattern('%integration-test.com');
            PERFORM cleanup_by_pattern('%test%');
            
        WHEN 'selective' THEN
            -- Selective cleanup - remove only specific data
            RAISE NOTICE 'Performing selective cleanup...';
            PERFORM cleanup_by_date(CURRENT_TIMESTAMP - INTERVAL '1 day');
            
        WHEN 'user_specific' THEN
            -- Clean specific users (can be customized)
            RAISE NOTICE 'Performing user-specific cleanup...';
            PERFORM cleanup_user_data('poweruser@integration-test.com');
            PERFORM cleanup_user_data('edge-case@integration-test.com');
            
        ELSE
            RAISE NOTICE 'Unknown cleanup mode: %. Performing full cleanup.', cleanup_mode;
            PERFORM test_utilities.cleanup_all_test_data();
    END CASE;
    
    -- Reset sequences if requested
    IF reset_sequences THEN
        RAISE NOTICE 'Resetting database sequences...';
        
        -- Reset sequences for all tables
        PERFORM setval(pg_get_serial_sequence('users', 'id'), 1, false);
        PERFORM setval(pg_get_serial_sequence('categories', 'id'), 1, false);
        PERFORM setval(pg_get_serial_sequence('tasks', 'id'), 1, false);
        
        RAISE NOTICE 'Database sequences reset successfully';
    END IF;
    
    end_time := CURRENT_TIMESTAMP;
    execution_time := end_time - start_time;
    
    RAISE NOTICE 'Cleanup completed in %', execution_time;
END $$;

-- ===================================
-- Post-cleanup Validation
-- ===================================

DO $$
DECLARE
    validate_enabled BOOLEAN;
    user_count INTEGER;
    category_count INTEGER;
    task_count INTEGER;
    integrity_issues INTEGER;
BEGIN
    SELECT (option_value = 'true') INTO validate_enabled 
    FROM cleanup_config 
    WHERE option_name = 'validate_after_cleanup';
    
    IF validate_enabled THEN
        RAISE NOTICE '=== Post-cleanup Validation ===';
        
        -- Get final counts
        SELECT COUNT(*) INTO user_count FROM users;
        SELECT COUNT(*) INTO category_count FROM categories;
        SELECT COUNT(*) INTO task_count FROM tasks;
        
        RAISE NOTICE 'Final counts - Users: %, Categories: %, Tasks: %', 
                     user_count, category_count, task_count;
        
        -- Check data integrity
        SELECT COUNT(*) INTO integrity_issues 
        FROM test_utilities.validate_data_integrity();
        
        IF integrity_issues > 0 THEN
            RAISE WARNING 'Data integrity issues found: %', integrity_issues;
            -- Display integrity issues
            RAISE NOTICE 'Integrity issues:';
            FOR rec IN SELECT * FROM test_utilities.validate_data_integrity() LOOP
                RAISE NOTICE '  %: % (% issues) - %', 
                             rec.table_name, rec.issue_type, rec.issue_count, rec.details;
            END LOOP;
        ELSE
            RAISE NOTICE 'Data integrity validation passed';
        END IF;
        
        -- Show remaining data summary
        IF user_count > 0 OR category_count > 0 OR task_count > 0 THEN
            RAISE NOTICE 'Remaining data summary:';
            FOR rec IN SELECT * FROM test_utilities.test_data_overview LOOP
                RAISE NOTICE '  %: % total, % active', 
                             rec.entity_type, rec.total_count, rec.active_count;
            END LOOP;
        END IF;
    END IF;
END $$;

-- ===================================
-- Cleanup Temporary Objects
-- ===================================

-- Drop temporary functions
DROP FUNCTION IF EXISTS cleanup_by_pattern(TEXT);
DROP FUNCTION IF EXISTS cleanup_by_date(TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS cleanup_user_data(TEXT);

-- Drop temporary tables
DROP TABLE IF EXISTS cleanup_config;

-- ===================================
-- Final Status Report
-- ===================================

DO $$
DECLARE
    final_user_count INTEGER;
    final_category_count INTEGER;
    final_task_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO final_user_count FROM users;
    SELECT COUNT(*) INTO final_category_count FROM categories;
    SELECT COUNT(*) INTO final_task_count FROM tasks;
    
    RAISE NOTICE '=== Cleanup Process Completed ===';
    RAISE NOTICE 'Final state:';
    RAISE NOTICE '  Users: %', final_user_count;
    RAISE NOTICE '  Categories: %', final_category_count;
    RAISE NOTICE '  Tasks: %', final_task_count;
    RAISE NOTICE 'Cleanup completed at: %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'Database is ready for fresh test data';
    
    -- Log cleanup completion
    IF final_user_count = 0 AND final_category_count = 0 AND final_task_count = 0 THEN
        RAISE NOTICE '✅ Complete cleanup successful - database is empty';
    ELSE
        RAISE NOTICE '⚠️  Partial cleanup completed - some data remains';
    END IF;
END $$;
