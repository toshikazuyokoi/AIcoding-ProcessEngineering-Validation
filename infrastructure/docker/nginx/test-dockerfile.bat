@echo off
REM ===================================
REM Task Management System - Nginx Dockerfile Test Script (Windows)
REM ===================================
REM Generated for TSK-015-INF-nginx-dockerfile
REM Project: Task Management System
REM Component: Nginx Dockerfile Testing
REM Purpose: Windows batch script for testing Nginx Docker builds

setlocal enabledelayedexpansion

REM ===================================
REM Configuration
REM ===================================
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..\..\..
set TEST_IMAGE_PREFIX=task-management-nginx-test
set TEST_CONTAINER_PREFIX=nginx-test
set TEST_RESULTS_DIR=%SCRIPT_DIR%test-results

REM ===================================
REM Helper Functions
REM ===================================
:log_info
echo [INFO] %~1
goto :eof

:log_success
echo [SUCCESS] %~1
goto :eof

:log_error
echo [ERROR] %~1
goto :eof

:cleanup
call :log_info "Cleaning up test containers and images..."

REM Stop and remove test containers
for /f "tokens=*" %%i in ('docker ps -a --filter "name=%TEST_CONTAINER_PREFIX%" --format "{{.Names}}" 2^>nul') do (
    docker stop %%i >nul 2>&1
    docker rm %%i >nul 2>&1
)

REM Remove test images
for /f "tokens=*" %%i in ('docker images --filter "reference=%TEST_IMAGE_PREFIX%*" --format "{{.Repository}}:{{.Tag}}" 2^>nul') do (
    docker rmi %%i >nul 2>&1
)
goto :eof

REM ===================================
REM Test Functions
REM ===================================
:test_dockerfile_syntax
call :log_info "Testing Dockerfile syntax..."

docker build --no-cache -f "%SCRIPT_DIR%Dockerfile" -t "%TEST_IMAGE_PREFIX%:syntax-test" "%SCRIPT_DIR%" >nul 2>&1
if %errorlevel% equ 0 (
    call :log_success "Dockerfile syntax is valid"
    set /a syntax_test=1
) else (
    call :log_error "Dockerfile syntax is invalid"
    set /a syntax_test=0
)
goto :eof

:test_multi_stage_builds
call :log_info "Testing multi-stage builds..."

set stages=development test production
set /a stage_success=0

for %%s in (%stages%) do (
    call :log_info "Building %%s stage..."
    
    docker build --no-cache --target "%%s" -f "%SCRIPT_DIR%Dockerfile" -t "%TEST_IMAGE_PREFIX%:%%s" "%SCRIPT_DIR%" >nul 2>&1
    if !errorlevel! equ 0 (
        call :log_success "%%s stage build successful"
        set /a stage_success+=1
    ) else (
        call :log_error "%%s stage build failed"
    )
)

if !stage_success! equ 3 (
    call :log_success "All multi-stage builds completed successfully"
    set /a multistage_test=1
) else (
    call :log_error "Some multi-stage builds failed"
    set /a multistage_test=0
)
goto :eof

:test_container_startup
call :log_info "Testing container startup..."

set stages=development test production
set /a startup_success=0
set /a port_counter=0

for %%s in (%stages%) do (
    call :log_info "Testing %%s container startup..."
    
    set container_name=%TEST_CONTAINER_PREFIX%-%%s
    set /a port=8080+!port_counter!
    
    docker run -d --name !container_name! -p !port!:80 "%TEST_IMAGE_PREFIX%:%%s" >nul 2>&1
    if !errorlevel! equ 0 (
        timeout /t 5 /nobreak >nul
        
        docker ps --filter "name=!container_name!" --filter "status=running" | findstr !container_name! >nul
        if !errorlevel! equ 0 (
            call :log_success "%%s container started successfully"
            set /a startup_success+=1
        ) else (
            call :log_error "%%s container failed to start"
        )
    ) else (
        call :log_error "Failed to start %%s container"
    )
    
    set /a port_counter+=1
)

if !startup_success! equ 3 (
    call :log_success "All containers started successfully"
    set /a startup_test=1
) else (
    call :log_error "Some containers failed to start"
    set /a startup_test=0
)
goto :eof

:test_health_checks
call :log_info "Testing health checks..."

set stages=development test production
set /a health_success=0
set /a port_counter=0

for %%s in (%stages%) do (
    call :log_info "Testing %%s health check..."
    
    set /a port=8080+!port_counter!
    set /a attempts=0
    set /a max_attempts=10
    
    :health_loop
    curl -f "http://localhost:!port!/health" >nul 2>&1
    if !errorlevel! equ 0 (
        call :log_success "%%s health check passed"
        set /a health_success+=1
        goto :next_health
    )
    
    set /a attempts+=1
    if !attempts! lss !max_attempts! (
        timeout /t 3 /nobreak >nul
        goto :health_loop
    ) else (
        call :log_error "%%s health check failed after !max_attempts! attempts"
    )
    
    :next_health
    set /a port_counter+=1
)

if !health_success! equ 3 (
    call :log_success "All health checks passed"
    set /a health_test=1
) else (
    call :log_error "Some health checks failed"
    set /a health_test=0
)
goto :eof

:test_security_configuration
call :log_info "Testing security configuration..."

set container_name=%TEST_CONTAINER_PREFIX%-production
set /a security_success=0

REM Test non-root user
docker exec %container_name% id 2>nul | findstr "uid=1001(nginx-user)" >nul
if !errorlevel! equ 0 (
    call :log_success "Container running as non-root user"
    set /a security_success+=1
) else (
    call :log_error "Container not running as expected non-root user"
)

REM Test SSL certificate
docker exec %container_name% test -f /etc/nginx/ssl/cert.pem 2>nul
if !errorlevel! equ 0 (
    call :log_success "SSL certificate exists"
    set /a security_success+=1
) else (
    call :log_error "SSL certificate not found"
)

if !security_success! equ 2 (
    call :log_success "Security configuration tests passed"
    set /a security_test=1
) else (
    call :log_error "Security configuration tests failed"
    set /a security_test=0
)
goto :eof

REM ===================================
REM Main Execution
REM ===================================
:main
call :log_info "Starting Nginx Dockerfile tests..."

REM Create test results directory
if not exist "%TEST_RESULTS_DIR%" mkdir "%TEST_RESULTS_DIR%"

REM Cleanup before starting
call :cleanup

REM Initialize test results
set /a total_tests=5
set /a passed_tests=0

REM Run tests
call :test_dockerfile_syntax
set /a passed_tests+=!syntax_test!

call :test_multi_stage_builds
set /a passed_tests+=!multistage_test!

call :test_container_startup
set /a passed_tests+=!startup_test!

call :test_health_checks
set /a passed_tests+=!health_test!

call :test_security_configuration
set /a passed_tests+=!security_test!

REM Cleanup after tests
call :cleanup

REM Report results
echo.
call :log_info "Test Results:"
call :log_info "Total tests: !total_tests!"
call :log_info "Passed tests: !passed_tests!"
set /a failed_tests=!total_tests!-!passed_tests!
call :log_info "Failed tests: !failed_tests!"

if !passed_tests! equ !total_tests! (
    call :log_success "All tests passed!"
    exit /b 0
) else (
    call :log_error "Some tests failed!"
    exit /b 1
)

REM ===================================
REM Script Entry Point
REM ===================================
call :main
