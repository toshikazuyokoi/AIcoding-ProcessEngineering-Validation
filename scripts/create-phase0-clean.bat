@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Phase 0: Environment Setup Issues
echo TSK-004, TSK-005, TSK-006 (3 tasks)
echo ========================================
echo.

echo [1/3] Environment Check...
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
echo [2/3] Existing Issues Check...
echo Already created:
echo - TSK-001-ENV-gitignore (Issue #1)
echo - TSK-002-ENV-readme (Issue #5)  
echo - TSK-003-ENV-makefile (Issue #8)
echo - TSK-011-ENV-prisma-schema (Issue #2)
echo.

echo [3/3] Execution Confirmation
echo Will create 3 tasks: TSK-004, TSK-005, TSK-006
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Starting Phase 0 Issue Creation...
echo.

set success_count=0
set error_count=0

echo Creating TSK-004-ENV-docker-compose-dev...
echo # [TSK-004-ENV-docker-compose-dev] docker-compose.dev.yml Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create docker-compose.dev.yml file for development environment container configuration. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `docker-compose.dev.yml` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Docker Environment >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] docker-compose.dev.yml is created >> temp-issue.md
echo - [ ] All services start properly >> temp-issue.md
echo - [ ] Functions as development environment >> temp-issue.md

gh issue create --title "[TSK-004-ENV-docker-compose-dev] docker-compose.dev.yml Creation and Verification" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:0,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-004 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-004 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-005-ENV-docker-compose-test...
echo # [TSK-005-ENV-docker-compose-test] docker-compose.test.yml Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create docker-compose.test.yml file for test environment container configuration. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `docker-compose.test.yml` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Docker Environment >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] docker-compose.test.yml is created >> temp-issue.md
echo - [ ] Test environment works properly >> temp-issue.md

gh issue create --title "[TSK-005-ENV-docker-compose-test] docker-compose.test.yml Creation and Verification" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:0,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-005 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-005 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-006-ENV-docker-compose...
echo # [TSK-006-ENV-docker-compose] docker-compose.yml Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create docker-compose.yml file for production environment container configuration. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `docker-compose.yml` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Docker Environment >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] docker-compose.yml is created >> temp-issue.md
echo - [ ] Functions as production environment >> temp-issue.md

gh issue create --title "[TSK-006-ENV-docker-compose] docker-compose.yml Creation and Verification" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:0,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-006 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-006 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo ========================================
echo Phase 0 Issue Creation Complete
echo ========================================
echo.
echo Results:
echo SUCCESS: !success_count! tasks
echo ERROR: !error_count! tasks
echo.
echo Next: Run create-phase0-part2.bat for remaining Phase 0 tasks
echo.
pause
