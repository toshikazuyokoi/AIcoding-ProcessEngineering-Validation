@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Phase 1: Infrastructure Layer Issues
echo TSK-030 to TSK-033 (4 tasks)
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
echo Will create 4 tasks: TSK-030 to TSK-033
echo Already created: TSK-029-INF-DatabaseConnection (Issue #3)
echo New tasks: 4 tasks
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Starting Phase 1 Issue Creation...
echo.

set success_count=0
set error_count=0

echo TSK-029: Already created (Issue #3)

echo Creating TSK-030-INF-Logger...
echo # [TSK-030-INF-Logger] Logger Class Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/utils/logger.ts file and implement logger class for application-wide log management. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/utils/logger.ts` >> temp-issue.md
echo - **Layer**: Infrastructure >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 1 >> temp-issue.md
echo - **Category**: Core Utilities >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Logger class is implemented >> temp-issue.md
echo - [ ] All log levels work properly >> temp-issue.md
echo - [ ] File output functions properly >> temp-issue.md

gh issue create --title "[TSK-030-INF-Logger] Logger Class Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:1,layer:infrastructure,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-030 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-030 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-031-INF-ErrorHandler...
echo # [TSK-031-INF-ErrorHandler] Error Handler Class Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/utils/error-handler.ts file and implement error handler class for unified error management. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/utils/error-handler.ts` >> temp-issue.md
echo - **Layer**: Infrastructure >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 1 >> temp-issue.md
echo - **Category**: Core Utilities >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] ErrorHandler class is implemented >> temp-issue.md
echo - [ ] All error types are properly handled >> temp-issue.md
echo - [ ] Log output works properly >> temp-issue.md

gh issue create --title "[TSK-031-INF-ErrorHandler] Error Handler Class Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:1,layer:infrastructure,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-031 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-031 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-032-INF-PasswordHasher...
echo # [TSK-032-INF-PasswordHasher] Password Hasher Class Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/utils/password-hasher.ts file and implement password hashing and verification class. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/utils/password-hasher.ts` >> temp-issue.md
echo - **Layer**: Infrastructure >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 1 >> temp-issue.md
echo - **Category**: Core Utilities >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] PasswordHasher class is implemented >> temp-issue.md
echo - [ ] Hashing works properly >> temp-issue.md
echo - [ ] Password verification works properly >> temp-issue.md

gh issue create --title "[TSK-032-INF-PasswordHasher] Password Hasher Class Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:1,layer:infrastructure,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-032 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-032 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-033-INF-JWTManager...
echo # [TSK-033-INF-JWTManager] JWT Manager Class Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/utils/jwt-manager.ts file and implement JWT token generation, verification, and management class. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/utils/jwt-manager.ts` >> temp-issue.md
echo - **Layer**: Infrastructure >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 1 >> temp-issue.md
echo - **Category**: Core Utilities >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] JWTManager class is implemented >> temp-issue.md
echo - [ ] Token generation works properly >> temp-issue.md
echo - [ ] Token verification works properly >> temp-issue.md

gh issue create --title "[TSK-033-INF-JWTManager] JWT Manager Class Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:1,layer:infrastructure,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-033 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-033 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo ========================================
echo Phase 1 Issue Creation Complete
echo ========================================
echo.
echo Results:
echo SUCCESS: !success_count! tasks
echo ERROR: !error_count! tasks
echo.
echo Next: Run create-phase2-clean.bat for Phase 2 tasks
echo.
pause
