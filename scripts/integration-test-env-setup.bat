@echo off
REM ===================================
REM Integration Test Environment Setup
REM ===================================
REM Generated for TSK-IT-000-001-TestEnvironment
REM Project: Task Management System - Integration Test
REM Purpose: Start integration test environment

echo ===================================
echo Integration Test Environment Setup
echo ===================================

REM Set environment variables
set COMPOSE_PROJECT_NAME=integration-test
set COMPOSE_FILE=docker-compose.integration-test.yml

echo [INFO] Loading environment variables...
if exist .env.integration (
    echo [INFO] Found .env.integration file
) else (
    echo [ERROR] .env.integration file not found
    exit /b 1
)

echo [INFO] Checking Docker availability...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not available
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not available
    exit /b 1
)

echo [INFO] Stopping any existing integration test containers...
docker-compose -f %COMPOSE_FILE% down --remove-orphans --volumes

echo [INFO] Cleaning up integration test resources...
docker system prune -f --filter "label=com.docker.compose.project=%COMPOSE_PROJECT_NAME%"

echo [INFO] Building integration test images...
docker-compose -f %COMPOSE_FILE% build --no-cache

echo [INFO] Starting integration test environment...
docker-compose -f %COMPOSE_FILE% up -d postgres-integration redis-integration

echo [INFO] Waiting for database to be ready...
timeout /t 30 /nobreak >nul

echo [INFO] Checking database health...
docker-compose -f %COMPOSE_FILE% exec postgres-integration pg_isready -U integration_user -d taskdb_integration
if %errorlevel% neq 0 (
    echo [ERROR] Database is not ready
    docker-compose -f %COMPOSE_FILE% logs postgres-integration
    exit /b 1
)

echo [INFO] Checking Redis health...
docker-compose -f %COMPOSE_FILE% exec redis-integration redis-cli ping
if %errorlevel% neq 0 (
    echo [ERROR] Redis is not ready
    docker-compose -f %COMPOSE_FILE% logs redis-integration
    exit /b 1
)

echo [INFO] Running database migrations and seeding...
docker-compose -f %COMPOSE_FILE% run --rm integration-seeder

echo [INFO] Starting application services...
docker-compose -f %COMPOSE_FILE% up -d backend-integration frontend-integration

echo [INFO] Waiting for application services to be ready...
timeout /t 60 /nobreak >nul

echo [INFO] Checking backend health...
curl -f http://localhost:8002/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Backend health check failed, checking logs...
    docker-compose -f %COMPOSE_FILE% logs backend-integration
)

echo [INFO] Integration test environment setup completed!
echo [INFO] Services available:
echo   - PostgreSQL: localhost:5434
echo   - Redis: localhost:6381
echo   - Backend API: http://localhost:8002
echo   - Frontend: http://localhost:3000 (if started)

echo [INFO] To run tests:
echo   docker-compose -f %COMPOSE_FILE% run --rm backend-integration npm run test:integration
echo   docker-compose -f %COMPOSE_FILE% run --rm frontend-integration npm run test:integration
echo   docker-compose -f %COMPOSE_FILE% run --rm e2e-integration npm run test:e2e:integration

echo [INFO] To view logs:
echo   docker-compose -f %COMPOSE_FILE% logs -f [service-name]

echo [INFO] To stop environment:
echo   scripts\integration-test-env-teardown.bat

echo ===================================
echo Setup completed successfully!
echo ===================================
