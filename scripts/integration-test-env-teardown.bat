@echo off
REM ===================================
REM Integration Test Environment Teardown
REM ===================================
REM Generated for TSK-IT-000-001-TestEnvironment
REM Project: Task Management System - Integration Test
REM Purpose: Stop and cleanup integration test environment

echo ===================================
echo Integration Test Environment Teardown
echo ===================================

REM Set environment variables
set COMPOSE_PROJECT_NAME=integration-test
set COMPOSE_FILE=docker-compose.integration-test.yml

echo [INFO] Stopping integration test environment...

echo [INFO] Stopping all integration test containers...
docker-compose -f %COMPOSE_FILE% stop

echo [INFO] Removing integration test containers...
docker-compose -f %COMPOSE_FILE% down --remove-orphans

echo [INFO] Removing integration test volumes (optional)...
set /p cleanup_volumes="Remove integration test volumes? (y/N): "
if /i "%cleanup_volumes%"=="y" (
    echo [INFO] Removing integration test volumes...
    docker-compose -f %COMPOSE_FILE% down --volumes
    docker volume prune -f --filter "label=com.docker.compose.project=%COMPOSE_PROJECT_NAME%"
) else (
    echo [INFO] Keeping integration test volumes for data persistence
)

echo [INFO] Removing integration test networks...
docker network prune -f --filter "label=com.docker.compose.project=%COMPOSE_PROJECT_NAME%"

echo [INFO] Cleaning up unused integration test images (optional)...
set /p cleanup_images="Remove unused integration test images? (y/N): "
if /i "%cleanup_images%"=="y" (
    echo [INFO] Removing unused integration test images...
    docker image prune -f --filter "label=com.docker.compose.project=%COMPOSE_PROJECT_NAME%"
) else (
    echo [INFO] Keeping integration test images for faster startup
)

echo [INFO] Checking remaining integration test resources...
echo [INFO] Remaining containers:
docker ps -a --filter "label=com.docker.compose.project=%COMPOSE_PROJECT_NAME%"

echo [INFO] Remaining volumes:
docker volume ls --filter "label=com.docker.compose.project=%COMPOSE_PROJECT_NAME%"

echo [INFO] Remaining networks:
docker network ls --filter "label=com.docker.compose.project=%COMPOSE_PROJECT_NAME%"

echo [INFO] Integration test environment cleanup completed!

echo [INFO] To restart environment:
echo   scripts\integration-test-env-setup.bat

echo [INFO] To check Docker system usage:
echo   docker system df

echo [INFO] To perform full Docker cleanup:
echo   docker system prune -a --volumes

echo ===================================
echo Teardown completed successfully!
echo ===================================
