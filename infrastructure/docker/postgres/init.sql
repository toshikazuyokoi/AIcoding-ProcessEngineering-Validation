-- ===================================
-- Task Management System - PostgreSQL Initialization SQL (Development)
-- ===================================
-- Generated for TSK-013-INF-postgres-init
-- Project: Task Management System
-- Component: PostgreSQL Database Initialization
-- Purpose: Initialize database for development environment

-- ===================================
-- Database Information
-- ===================================
-- Database: taskdb_dev
-- User: postgres
-- Environment: Development
-- Encoding: UTF-8
-- Locale: C

\echo 'Starting Task Management System database initialization for development...'

-- ===================================
-- Extensions Installation
-- ===================================
\echo 'Installing PostgreSQL extensions...'

-- UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Performance monitoring extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Full-text search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Cryptographic functions extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Additional useful extensions for development
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS btree_gist;

\echo 'Extensions installed successfully.'

-- ===================================
-- Database Configuration
-- ===================================
\echo 'Configuring database settings...'

-- Set timezone to Asia/Tokyo for development
SET timezone = 'Asia/Tokyo';

-- Enable query logging for development
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 0;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Performance settings for development
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET pg_stat_statements.max = 10000;

-- Reload configuration
SELECT pg_reload_conf();

\echo 'Database configuration completed.'

-- ===================================
-- Development Users Creation
-- ===================================
\echo 'Creating development users...'

-- Create application user for development
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'taskapp_dev') THEN
        CREATE ROLE taskapp_dev WITH
            LOGIN
            PASSWORD 'dev_app_password_123'
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            NOINHERIT
            NOREPLICATION
            CONNECTION LIMIT 50;
        
        \echo 'Created taskapp_dev user.';
    ELSE
        \echo 'taskapp_dev user already exists.';
    END IF;
END
$$;

-- Create read-only user for development monitoring
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'taskapp_readonly_dev') THEN
        CREATE ROLE taskapp_readonly_dev WITH
            LOGIN
            PASSWORD 'dev_readonly_password_123'
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            NOINHERIT
            NOREPLICATION
            CONNECTION LIMIT 10;
        
        \echo 'Created taskapp_readonly_dev user.';
    ELSE
        \echo 'taskapp_readonly_dev user already exists.';
    END IF;
END
$$;

-- Create backup user for development
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'taskapp_backup_dev') THEN
        CREATE ROLE taskapp_backup_dev WITH
            LOGIN
            PASSWORD 'dev_backup_password_123'
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            NOINHERIT
            NOREPLICATION
            CONNECTION LIMIT 5;
        
        \echo 'Created taskapp_backup_dev user.';
    ELSE
        \echo 'taskapp_backup_dev user already exists.';
    END IF;
END
$$;

\echo 'Development users created successfully.'

-- ===================================
-- Database Permissions
-- ===================================
\echo 'Setting up database permissions...'

-- Grant permissions to application user
GRANT CONNECT ON DATABASE taskdb_dev TO taskapp_dev;
GRANT USAGE ON SCHEMA public TO taskapp_dev;
GRANT CREATE ON SCHEMA public TO taskapp_dev;

-- Grant permissions to read-only user
GRANT CONNECT ON DATABASE taskdb_dev TO taskapp_readonly_dev;
GRANT USAGE ON SCHEMA public TO taskapp_readonly_dev;

-- Grant permissions to backup user
GRANT CONNECT ON DATABASE taskdb_dev TO taskapp_backup_dev;
GRANT USAGE ON SCHEMA public TO taskapp_backup_dev;

\echo 'Database permissions set successfully.'

-- ===================================
-- Development Schemas
-- ===================================
\echo 'Creating development schemas...'

-- Create audit schema for development
CREATE SCHEMA IF NOT EXISTS audit;
GRANT USAGE ON SCHEMA audit TO taskapp_dev;
GRANT CREATE ON SCHEMA audit TO taskapp_dev;

-- Create monitoring schema for development
CREATE SCHEMA IF NOT EXISTS monitoring;
GRANT USAGE ON SCHEMA monitoring TO taskapp_dev;
GRANT USAGE ON SCHEMA monitoring TO taskapp_readonly_dev;

-- Create backup schema for development
CREATE SCHEMA IF NOT EXISTS backup;
GRANT USAGE ON SCHEMA backup TO taskapp_backup_dev;
GRANT CREATE ON SCHEMA backup TO taskapp_backup_dev;

\echo 'Development schemas created successfully.'

-- ===================================
-- Development Functions
-- ===================================
\echo 'Creating development utility functions...'

-- Function to generate UUID v4
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
RETURNS uuid AS $$
BEGIN
    RETURN uuid_in(overlay(overlay(md5(random()::text || ':' || random()::text) placing '4' from 13) placing to_hex(floor(random()*(11-8+1) + 8)::int)::text from 17)::cstring);
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for development logging
CREATE OR REPLACE FUNCTION monitoring.log_query_performance(
    query_text TEXT,
    execution_time INTERVAL,
    rows_affected INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO monitoring.query_log (
        query_text,
        execution_time,
        rows_affected,
        logged_at
    ) VALUES (
        query_text,
        execution_time,
        rows_affected,
        CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

\echo 'Development utility functions created successfully.'

-- ===================================
-- Development Monitoring Tables
-- ===================================
\echo 'Creating development monitoring tables...'

-- Query performance log table
CREATE TABLE IF NOT EXISTS monitoring.query_log (
    id SERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    execution_time INTERVAL NOT NULL,
    rows_affected INTEGER,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Application metrics table
CREATE TABLE IF NOT EXISTS monitoring.app_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(20),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Error log table
CREATE TABLE IF NOT EXISTS monitoring.error_log (
    id SERIAL PRIMARY KEY,
    error_type VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID,
    request_id VARCHAR(100),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo 'Development monitoring tables created successfully.'

-- ===================================
-- Development Indexes
-- ===================================
\echo 'Creating development indexes...'

-- Monitoring table indexes
CREATE INDEX IF NOT EXISTS idx_query_log_logged_at ON monitoring.query_log(logged_at);
CREATE INDEX IF NOT EXISTS idx_query_log_execution_time ON monitoring.query_log(execution_time);
CREATE INDEX IF NOT EXISTS idx_app_metrics_metric_name ON monitoring.app_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_app_metrics_recorded_at ON monitoring.app_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_error_log_error_type ON monitoring.error_log(error_type);
CREATE INDEX IF NOT EXISTS idx_error_log_occurred_at ON monitoring.error_log(occurred_at);
CREATE INDEX IF NOT EXISTS idx_error_log_user_id ON monitoring.error_log(user_id);

\echo 'Development indexes created successfully.'

-- ===================================
-- Development Security Settings
-- ===================================
\echo 'Applying development security settings...'

-- Set row level security policies (disabled for development)
-- This will be enabled in production

-- Grant table permissions after Prisma migration
-- These will be applied after tables are created by Prisma

\echo 'Development security settings applied.'

-- ===================================
-- Development Data Seeding Preparation
-- ===================================
\echo 'Preparing for development data seeding...'

-- Create sequence for development test data
CREATE SEQUENCE IF NOT EXISTS public.dev_test_sequence START 1000;

-- Grant sequence usage to application user
GRANT USAGE, SELECT ON SEQUENCE public.dev_test_sequence TO taskapp_dev;

\echo 'Development data seeding preparation completed.'

-- ===================================
-- Development Completion
-- ===================================
\echo 'Development database initialization completed successfully!'
\echo 'Database: taskdb_dev'
\echo 'Users created: taskapp_dev, taskapp_readonly_dev, taskapp_backup_dev'
\echo 'Extensions: uuid-ossp, pg_stat_statements, pg_trgm, pgcrypto, btree_gin, btree_gist'
\echo 'Schemas: public, audit, monitoring, backup'
\echo 'Ready for Prisma migration and application development.'
