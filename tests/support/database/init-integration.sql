-- ===================================
-- Integration Test Database Initialization
-- ===================================
-- Generated for TSK-IT-000-001-TestEnvironment
-- Project: Task Management System - Integration Test
-- Purpose: Initialize integration test database schema

-- Set timezone to UTC
SET timezone = 'UTC';

-- Create integration test database (if not exists)
-- Note: Database is already created by Docker environment variables

-- Create test user with appropriate permissions
-- Note: User is already created by Docker environment variables

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE taskdb_integration TO integration_user;

-- Connect to the integration database
\c taskdb_integration;

-- Create schema for integration tests
CREATE SCHEMA IF NOT EXISTS integration_test;
GRANT ALL ON SCHEMA integration_test TO integration_user;

-- Set search path
ALTER DATABASE taskdb_integration SET search_path TO public, integration_test;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create basic tables for integration testing
-- These will be used by the application and tests

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, user_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert test data for integration tests
-- Test user
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', '$2b$10$rQZ9QmjQQm9QmjQQm9QmjO', 'Test', 'User', 'user', true, true),
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', '$2b$10$rQZ9QmjQQm9QmjQQm9QmjO', 'Admin', 'User', 'admin', true, true)
ON CONFLICT (email) DO NOTHING;

-- Test categories
INSERT INTO categories (id, name, description, color, user_id)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440000', 'Work', 'Work related tasks', '#007bff', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440001', 'Personal', 'Personal tasks', '#28a745', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Shopping', 'Shopping list', '#ffc107', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (name, user_id) DO NOTHING;

-- Test tasks
INSERT INTO tasks (id, title, description, status, priority, user_id, category_id)
VALUES 
    ('770e8400-e29b-41d4-a716-446655440000', 'Test Task 1', 'This is a test task for integration testing', 'pending', 'high', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000'),
    ('770e8400-e29b-41d4-a716-446655440001', 'Test Task 2', 'Another test task', 'in_progress', 'medium', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001'),
    ('770e8400-e29b-41d4-a716-446655440002', 'Test Task 3', 'Completed test task', 'completed', 'low', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO integration_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO integration_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO integration_user;

-- Create test-specific functions for data cleanup
CREATE OR REPLACE FUNCTION cleanup_test_data()
RETURNS void AS $$
BEGIN
    -- Delete test data in correct order (respecting foreign keys)
    DELETE FROM tasks WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
    DELETE FROM categories WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
    DELETE FROM users WHERE id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
END;
$$ LANGUAGE plpgsql;

-- Create function to reset test data
CREATE OR REPLACE FUNCTION reset_test_data()
RETURNS void AS $$
BEGIN
    -- Clean up existing test data
    PERFORM cleanup_test_data();
    
    -- Re-insert test data
    INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
    VALUES 
        ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', '$2b$10$rQZ9QmjQQm9QmjQQm9QmjO', 'Test', 'User', 'user', true, true),
        ('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', '$2b$10$rQZ9QmjQQm9QmjQQm9QmjO', 'Admin', 'User', 'admin', true, true);
    
    INSERT INTO categories (id, name, description, color, user_id)
    VALUES 
        ('660e8400-e29b-41d4-a716-446655440000', 'Work', 'Work related tasks', '#007bff', '550e8400-e29b-41d4-a716-446655440000'),
        ('660e8400-e29b-41d4-a716-446655440001', 'Personal', 'Personal tasks', '#28a745', '550e8400-e29b-41d4-a716-446655440000'),
        ('660e8400-e29b-41d4-a716-446655440002', 'Shopping', 'Shopping list', '#ffc107', '550e8400-e29b-41d4-a716-446655440000');
    
    INSERT INTO tasks (id, title, description, status, priority, user_id, category_id)
    VALUES 
        ('770e8400-e29b-41d4-a716-446655440000', 'Test Task 1', 'This is a test task for integration testing', 'pending', 'high', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000'),
        ('770e8400-e29b-41d4-a716-446655440001', 'Test Task 2', 'Another test task', 'in_progress', 'medium', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001'),
        ('770e8400-e29b-41d4-a716-446655440002', 'Test Task 3', 'Completed test task', 'completed', 'low', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002');
END;
$$ LANGUAGE plpgsql;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Integration test database initialized successfully at %', CURRENT_TIMESTAMP;
END $$;
