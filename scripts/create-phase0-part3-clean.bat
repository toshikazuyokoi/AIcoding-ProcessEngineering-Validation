@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Phase 0 Part 3: Environment Setup Issues
echo TSK-013 to TSK-028 (16 tasks)
echo ========================================
echo.

echo [1/2] Environment Check...
gh --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: gh command not found
    pause
    exit /b 1
)

echo Checking GitHub authentication...
gh auth status
echo.
set /p auth_ok="Is authentication OK? (y/N): "
if /i not "%auth_ok%"=="y" (
    echo Please authenticate first with: gh auth login
    pause
    exit /b 1
)
echo OK: Environment Check Complete

echo.
echo [2/2] Execution Confirmation
echo Will create 16 tasks: TSK-013 to TSK-028
echo Categories:
echo - Database and Infrastructure Setup (5 tasks: TSK-013 to TSK-016)
echo - CI/CD Workflows (3 tasks: TSK-017 to TSK-019)
echo - Cross-platform Scripts (8 tasks: TSK-020 to TSK-028)
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Starting Phase 0 Part 3 Issue Creation...
echo.

set success_count=0
set error_count=0

REM Database and Infrastructure Setup (TSK-013 to TSK-016)
echo === Database and Infrastructure Setup ===

echo Creating TSK-013-INF-postgres-init...
echo # [TSK-013-INF-postgres-init] PostgreSQL Initialization SQL Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create infrastructure/docker/postgres/init.sql file to define PostgreSQL database initialization. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `infrastructure/docker/postgres/init.sql` >> temp-issue.md
echo - **Layer**: Infrastructure >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Database and Infrastructure Setup >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] PostgreSQL init.sql is created >> temp-issue.md
echo - [ ] Database initialization works properly >> temp-issue.md

gh issue create --title "[TSK-013-INF-postgres-init] PostgreSQL Initialization SQL Creation and Verification" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:0,layer:infrastructure,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-013 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-013 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-014-INF-redis-config...
echo # [TSK-014-INF-redis-config] Redis Configuration Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create infrastructure/docker/redis/redis.conf file to define Redis configuration. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `infrastructure/docker/redis/redis.conf` >> temp-issue.md
echo - **Layer**: Infrastructure >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Database and Infrastructure Setup >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Redis configuration is created >> temp-issue.md
echo - [ ] Redis works properly with configuration >> temp-issue.md

gh issue create --title "[TSK-014-INF-redis-config] Redis Configuration Creation and Verification" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:0,layer:infrastructure,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-014 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-014 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-015-INF-nginx-dockerfile...
echo # [TSK-015-INF-nginx-dockerfile] Nginx Dockerfile Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create infrastructure/docker/nginx/Dockerfile to define Nginx container image. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `infrastructure/docker/nginx/Dockerfile` >> temp-issue.md
echo - **Layer**: Infrastructure >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Database and Infrastructure Setup >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Nginx Dockerfile is created >> temp-issue.md
echo - [ ] Image builds successfully >> temp-issue.md

gh issue create --title "[TSK-015-INF-nginx-dockerfile] Nginx Dockerfile Creation and Verification" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:0,layer:infrastructure,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-015 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-015 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-016-INF-nginx-config...
echo # [TSK-016-INF-nginx-config] Nginx Configuration Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create infrastructure/docker/nginx/nginx.conf file to define Nginx configuration. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `infrastructure/docker/nginx/nginx.conf` >> temp-issue.md
echo - **Layer**: Infrastructure >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Database and Infrastructure Setup >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Nginx configuration is created >> temp-issue.md
echo - [ ] Nginx works properly with configuration >> temp-issue.md

gh issue create --title "[TSK-016-INF-nginx-config] Nginx Configuration Creation and Verification" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:0,layer:infrastructure,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-016 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-016 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo Progress: !success_count! success, !error_count! errors
echo Continue with CI/CD Workflows...
pause >nul

echo === CI/CD Workflows ===

echo Creating TSK-017-ENV-ci-workflow...
echo # [TSK-017-ENV-ci-workflow] CI Workflow Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create .github/workflows/ci.yml file to define continuous integration workflow. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `.github/workflows/ci.yml` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: CI/CD Workflows >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] CI workflow is created >> temp-issue.md
echo - [ ] Workflow runs successfully >> temp-issue.md

gh issue create --title "[TSK-017-ENV-ci-workflow] CI Workflow Creation and Verification" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:0,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-017 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-017 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-018-ENV-cd-workflow...
echo # [TSK-018-ENV-cd-workflow] CD Workflow Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create .github/workflows/cd.yml file to define continuous deployment workflow. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `.github/workflows/cd.yml` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: CI/CD Workflows >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] CD workflow is created >> temp-issue.md
echo - [ ] Deployment workflow works properly >> temp-issue.md

gh issue create --title "[TSK-018-ENV-cd-workflow] CD Workflow Creation and Verification" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:0,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-018 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-018 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-019-ENV-test-workflow...
echo # [TSK-019-ENV-test-workflow] Test Workflow Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create .github/workflows/test.yml file to define test execution workflow. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `.github/workflows/test.yml` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: CI/CD Workflows >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Test workflow is created >> temp-issue.md
echo - [ ] Test execution works properly >> temp-issue.md

gh issue create --title "[TSK-019-ENV-test-workflow] Test Workflow Creation and Verification" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:0,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-019 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-019 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo Progress: !success_count! success, !error_count! errors
echo Continue with Cross-platform Scripts...
pause >nul

echo === Cross-platform Scripts ===

echo Creating TSK-020-SCR-setup-cross...
echo # [TSK-020-SCR-setup-cross] Cross-platform Development Environment Setup Script Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create scripts/cross-platform/setup-dev.js file for cross-platform development environment setup. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `scripts/cross-platform/setup-dev.js` >> temp-issue.md
echo - **Layer**: Script >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Cross-platform Scripts >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Cross-platform setup script is created >> temp-issue.md
echo - [ ] Works on Windows, macOS, and Linux >> temp-issue.md

gh issue create --title "[TSK-020-SCR-setup-cross] Cross-platform Development Environment Setup Script Creation and Verification" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:0,layer:script,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-020 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-020 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo ========================================
echo Phase 0 Part 3 Issue Creation Complete (Part 1)
echo ========================================
echo.
echo Results so far:
echo SUCCESS: !success_count! tasks
echo ERROR: !error_count! tasks
echo.
echo Next: Run create-phase0-part4-clean.bat for remaining scripts (TSK-021 to TSK-028)
echo.
pause
