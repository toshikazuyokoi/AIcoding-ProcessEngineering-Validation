@echo off
setlocal enabledelayedexpansion

REM ===================================
REM Windows Development Environment Setup
REM ===================================
REM Purpose: Automated setup for Windows development environment
REM Author: Process Engineering Approach
REM Version: 1.0.0
REM Usage: setup-dev.bat [options]

REM ===================================
REM Configuration
REM ===================================
set "NODE_VERSION=20.11.0"
set "NPM_VERSION=10.2.4"
set "REQUIRED_PORTS=3000 8000 5432 6379"
set "PROJECT_ROOT=%~dp0..\.."
set "LOG_DIR=%PROJECT_ROOT%\logs"
set "LOG_FILE=%LOG_DIR%\setup-dev-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log"

REM Default options
set "SKIP_DEPS=false"
set "VERBOSE=false"
set "DRY_RUN=false"

REM Counters
set "ERRORS=0"
set "WARNINGS=0"

REM ===================================
REM Logging Functions
REM ===================================
:setup_logging
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo. > "%LOG_FILE%"
goto :eof

:log_info
echo [INFO] %date% %time% - %~1
if exist "%LOG_FILE%" echo [INFO] %date% %time% - %~1 >> "%LOG_FILE%"
goto :eof

:log_success
echo [SUCCESS] %date% %time% - %~1
if exist "%LOG_FILE%" echo [SUCCESS] %date% %time% - %~1 >> "%LOG_FILE%"
goto :eof

:log_warning
echo [WARNING] %date% %time% - %~1
if exist "%LOG_FILE%" echo [WARNING] %date% %time% - %~1 >> "%LOG_FILE%"
set /a WARNINGS+=1
goto :eof

:log_error
echo [ERROR] %date% %time% - %~1
if exist "%LOG_FILE%" echo [ERROR] %date% %time% - %~1 >> "%LOG_FILE%"
set /a ERRORS+=1
goto :eof

:log_step
echo [STEP %~1] %date% %time% - %~2
if exist "%LOG_FILE%" echo [STEP %~1] %date% %time% - %~2 >> "%LOG_FILE%"
goto :eof

REM ===================================
REM Utility Functions
REM ===================================
:command_exists
where "%~1" >nul 2>&1
goto :eof

:check_port
netstat -an | findstr ":%~1 " >nul 2>&1
if errorlevel 1 (
    exit /b 0
) else (
    exit /b 1
)

:get_version
for /f "tokens=*" %%i in ('%~1 %~2 2^>nul') do (
    set "VERSION_OUTPUT=%%i"
    goto :version_found
)
set "VERSION_OUTPUT=not_installed"
:version_found
goto :eof

:version_compare
REM Simple version comparison (assumes semantic versioning)
set "VER1=%~1"
set "VER2=%~2"
REM For simplicity, assume versions are compatible if installed
if "%VER1%"=="not_installed" (
    exit /b 1
) else (
    exit /b 0
)

REM ===================================
REM System Requirements Check
REM ===================================
:check_system_requirements
call :log_step "1/8" "Checking system requirements"

REM Check Windows version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set "WIN_VERSION=%%i.%%j"
call :log_info "Windows version: %WIN_VERSION%"

REM Check if running as administrator
net session >nul 2>&1
if errorlevel 1 (
    call :log_warning "Not running as administrator - some features may not work"
) else (
    call :log_success "Running with administrator privileges"
)

REM Check PowerShell
call :command_exists powershell
if errorlevel 1 (
    call :log_error "PowerShell is not available"
    exit /b 1
) else (
    call :log_success "PowerShell is available"
)

REM Check Node.js
call :command_exists node
if errorlevel 1 (
    call :log_warning "Node.js is not installed"
    call :log_info "Please install Node.js %NODE_VERSION% from https://nodejs.org/"
    set /a WARNINGS+=1
) else (
    call :get_version "node" "--version"
    call :log_success "Node.js is installed: !VERSION_OUTPUT!"
)

REM Check npm
call :command_exists npm
if errorlevel 1 (
    call :log_warning "npm is not installed"
) else (
    call :get_version "npm" "--version"
    call :log_success "npm is installed: !VERSION_OUTPUT!"
)

REM Check Git
call :command_exists git
if errorlevel 1 (
    call :log_warning "Git is not installed"
    call :log_info "Please install Git from https://git-scm.com/"
) else (
    call :get_version "git" "--version"
    call :log_success "Git is installed: !VERSION_OUTPUT!"
)

REM Check Docker
call :command_exists docker
if errorlevel 1 (
    call :log_warning "Docker is not installed"
    call :log_info "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
) else (
    call :get_version "docker" "--version"
    call :log_success "Docker is installed: !VERSION_OUTPUT!"

    REM Check if Docker is running
    docker info >nul 2>&1
    if errorlevel 1 (
        call :log_warning "Docker is not running - please start Docker Desktop"
    ) else (
        call :log_success "Docker is running"
    )
)

call :log_success "System requirements check completed"
goto :eof

REM ===================================
REM Port Check
REM ===================================
:check_ports
call :log_step "2/8" "Checking required ports"

for %%p in (%REQUIRED_PORTS%) do (
    call :check_port %%p
    if errorlevel 1 (
        call :log_warning "Port %%p is in use"
    ) else (
        call :log_success "Port %%p is available"
    )
)

call :log_success "Port check completed"
goto :eof

REM ===================================
REM Directory Setup
REM ===================================
:setup_directories
call :log_step "3/8" "Setting up project directories"

cd /d "%PROJECT_ROOT%"

set "DIRECTORIES=logs coverage test-results backup uploads deployment-reports backups tmp"

for %%d in (%DIRECTORIES%) do (
    if not exist "%%d" (
        mkdir "%%d"
        call :log_success "Created directory: %%d"
    ) else (
        call :log_info "Directory already exists: %%d"
    )
)

call :log_success "Project directories setup completed"
goto :eof

REM ===================================
REM Environment Files Setup
REM ===================================
:setup_environment_files
call :log_step "4/8" "Setting up environment files"

cd /d "%PROJECT_ROOT%"

REM Backend environment file
if exist "backend\.env.example" (
    if not exist "backend\.env" (
        copy "backend\.env.example" "backend\.env" >nul
        call :log_success "Created environment file: backend\.env"
    ) else (
        call :log_info "Environment file already exists: backend\.env"
    )
) else (
    call :log_warning "Environment template not found: backend\.env.example"
)

REM Frontend environment file
if exist "frontend\.env.example" (
    if not exist "frontend\.env" (
        copy "frontend\.env.example" "frontend\.env" >nul
        call :log_success "Created environment file: frontend\.env"
    ) else (
        call :log_info "Environment file already exists: frontend\.env"
    )
) else (
    call :log_warning "Environment template not found: frontend\.env.example"
)

call :log_success "Environment files setup completed"
goto :eof

REM ===================================
REM Dependencies Installation
REM ===================================
:install_dependencies
if "%SKIP_DEPS%"=="true" (
    call :log_info "Skipping dependency installation (--skip-deps)"
    goto :eof
)

call :log_step "5/8" "Installing dependencies"

cd /d "%PROJECT_ROOT%"

REM Check if package.json exists
if not exist "package.json" (
    call :log_warning "package.json not found in project root"
    goto :install_backend_deps
)

REM Install root dependencies
call :log_info "Installing root dependencies..."
call npm install
if errorlevel 1 (
    call :log_error "Failed to install root dependencies"
    goto :install_backend_deps
) else (
    call :log_success "Root dependencies installed"
)

:install_backend_deps
REM Install backend dependencies
if exist "backend\package.json" (
    call :log_info "Installing backend dependencies..."
    cd /d "%PROJECT_ROOT%\backend"
    call npm install
    if errorlevel 1 (
        call :log_error "Failed to install backend dependencies"
    ) else (
        call :log_success "Backend dependencies installed"
    )
    cd /d "%PROJECT_ROOT%"
) else (
    call :log_warning "Backend package.json not found"
)

:install_frontend_deps
REM Install frontend dependencies
if exist "frontend\package.json" (
    call :log_info "Installing frontend dependencies..."
    cd /d "%PROJECT_ROOT%\frontend"
    call npm install
    if errorlevel 1 (
        call :log_error "Failed to install frontend dependencies"
    ) else (
        call :log_success "Frontend dependencies installed"
    )
    cd /d "%PROJECT_ROOT%"
) else (
    call :log_warning "Frontend package.json not found"
)

call :log_success "Dependencies installation completed"
goto :eof

REM ===================================
REM Database Setup
REM ===================================
:setup_database
call :log_step "6/8" "Setting up database"

cd /d "%PROJECT_ROOT%"

REM Check if Docker Compose file exists
if not exist "docker-compose.dev.yml" (
    call :log_warning "docker-compose.dev.yml not found"
    goto :database_setup_end
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    call :log_warning "Docker is not running - skipping database setup"
    goto :database_setup_end
)

REM Start database services
call :log_info "Starting database services..."
docker-compose -f docker-compose.dev.yml up -d postgres redis
if errorlevel 1 (
    call :log_error "Failed to start database services"
) else (
    call :log_success "Database services started"

    REM Wait for services to be ready
    call :log_info "Waiting for database services to be ready..."
    timeout /t 10 /nobreak >nul

    REM Check PostgreSQL
    docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres >nul 2>&1
    if errorlevel 1 (
        call :log_warning "PostgreSQL may not be ready yet"
    ) else (
        call :log_success "PostgreSQL is ready"
    )

    REM Check Redis
    docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping >nul 2>&1
    if errorlevel 1 (
        call :log_warning "Redis may not be ready yet"
    ) else (
        call :log_success "Redis is ready"
    )
)

:database_setup_end
call :log_success "Database setup completed"
goto :eof

REM ===================================
REM Setup Verification
REM ===================================
:verify_setup
call :log_step "7/8" "Verifying setup"

cd /d "%PROJECT_ROOT%"

set "VERIFICATION_ERRORS=0"

REM Verify Node.js
call :command_exists node
if errorlevel 1 (
    call :log_error "Node.js verification failed"
    set /a VERIFICATION_ERRORS+=1
) else (
    call :log_success "Node.js verification passed"
)

REM Verify npm
call :command_exists npm
if errorlevel 1 (
    call :log_error "npm verification failed"
    set /a VERIFICATION_ERRORS+=1
) else (
    call :log_success "npm verification passed"
)

REM Verify project structure
set "REQUIRED_DIRS=logs coverage test-results backup uploads"
for %%d in (%REQUIRED_DIRS%) do (
    if not exist "%%d" (
        call :log_error "Required directory missing: %%d"
        set /a VERIFICATION_ERRORS+=1
    )
)

REM Verify environment files
if exist "backend\.env.example" (
    if not exist "backend\.env" (
        call :log_error "Backend environment file missing"
        set /a VERIFICATION_ERRORS+=1
    )
)

if exist "frontend\.env.example" (
    if not exist "frontend\.env" (
        call :log_error "Frontend environment file missing"
        set /a VERIFICATION_ERRORS+=1
    )
)

if %VERIFICATION_ERRORS% equ 0 (
    call :log_success "Setup verification passed"
    exit /b 0
) else (
    call :log_error "Setup verification failed with %VERIFICATION_ERRORS% errors"
    exit /b 1
)

REM ===================================
REM Summary and Next Steps
REM ===================================
:print_summary
call :log_step "8/8" "Setup summary"

echo.
echo ============================================================
call :log_success "🎉 Windows Development Environment Setup Complete!"
echo ============================================================
echo.
echo 📊 Setup Summary:
echo   Platform: Windows %WIN_VERSION%
echo   Project Root: %PROJECT_ROOT%
echo   Log File: %LOG_FILE%
echo   Errors: %ERRORS%
echo   Warnings: %WARNINGS%
echo.
echo 🚀 Next Steps:
echo   1. Start Docker Desktop (if not already running)
echo   2. Start the development environment:
echo      cd "%PROJECT_ROOT%"
echo      docker-compose -f docker-compose.dev.yml up -d
echo   3. Start the application:
echo      npm run dev
echo.
echo 📁 Access URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   Database: localhost:5432 (PostgreSQL)
echo   Cache:    localhost:6379 (Redis)
echo.
echo 📚 Useful Commands:
echo   • Start services: docker-compose -f docker-compose.dev.yml up -d
echo   • Stop services:  docker-compose -f docker-compose.dev.yml down
echo   • View logs:      docker-compose -f docker-compose.dev.yml logs -f
echo   • Reset database: npm run db:reset
echo.
echo ============================================================
goto :eof

REM ===================================
REM Help and Usage
REM ===================================
:show_help
echo Windows Development Environment Setup
echo.
echo USAGE:
echo     setup-dev.bat [OPTIONS]
echo.
echo OPTIONS:
echo     --skip-deps         Skip dependency installation
echo     --verbose           Enable verbose output
echo     --dry-run           Show what would be done without executing
echo     --help              Show this help message
echo.
echo EXAMPLES:
echo     setup-dev.bat                    # Full setup
echo     setup-dev.bat --skip-deps       # Setup without installing dependencies
echo     setup-dev.bat --verbose         # Setup with verbose logging
echo     setup-dev.bat --dry-run         # Dry run to see what would be done
echo.
echo REQUIREMENTS:
echo     • Windows 10/11
echo     • Node.js %NODE_VERSION% or later
echo     • npm %NPM_VERSION% or later
echo     • Docker Desktop
echo     • Git (recommended)
echo.
echo SETUP COMPONENTS:
echo     • System requirements check
echo     • Port availability check
echo     • Project directories creation
echo     • Environment files setup
echo     • Dependencies installation
echo     • Database services setup
echo     • Setup verification
echo.
echo For more information, see the project documentation.
exit /b 0

REM ===================================
REM Argument Parsing
REM ===================================
:parse_arguments
if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help
if "%1"=="--skip-deps" set "SKIP_DEPS=true"
if "%1"=="--verbose" set "VERBOSE=true"
if "%1"=="--dry-run" set "DRY_RUN=true"
if "%2"=="--skip-deps" set "SKIP_DEPS=true"
if "%2"=="--verbose" set "VERBOSE=true"
if "%2"=="--dry-run" set "DRY_RUN=true"
if "%3"=="--skip-deps" set "SKIP_DEPS=true"
if "%3"=="--verbose" set "VERBOSE=true"
if "%3"=="--dry-run" set "DRY_RUN=true"
goto :eof

REM ===================================
REM Main Function
REM ===================================
:main
REM Parse command line arguments
call :parse_arguments %*
if errorlevel 1 exit /b 1

REM Setup logging
call :setup_logging

call :log_info "🚀 Starting Windows development environment setup"
call :log_info "Options: skip_deps=%SKIP_DEPS%, verbose=%VERBOSE%, dry_run=%DRY_RUN%"

if "%DRY_RUN%"=="true" (
    call :log_info "DRY RUN MODE - No changes will be made"
    call :log_info "Would execute the following steps:"
    call :log_info "1. Check system requirements"
    call :log_info "2. Check required ports"
    call :log_info "3. Setup project directories"
    call :log_info "4. Setup environment files"
    if "%SKIP_DEPS%"=="false" (
        call :log_info "5. Install dependencies"
    ) else (
        call :log_info "5. Skip dependency installation"
    )
    call :log_info "6. Setup database services"
    call :log_info "7. Verify setup"
    call :log_info "8. Print summary"
    call :log_success "DRY RUN completed successfully"
    exit /b 0
)

REM Execute setup steps
call :check_system_requirements
if errorlevel 1 (
    call :log_error "System requirements check failed"
    exit /b 1
)

call :check_ports
call :setup_directories
call :setup_environment_files
call :install_dependencies
call :setup_database

call :verify_setup
if errorlevel 1 (
    call :log_error "Setup verification failed"
    call :print_summary
    exit /b 1
)

call :print_summary
call :log_success "Setup completed successfully!"
exit /b 0

REM ===================================
REM Entry Point
REM ===================================
call :main %*
exit /b %errorlevel%
