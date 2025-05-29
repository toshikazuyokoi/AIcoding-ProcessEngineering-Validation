@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Phase 0 Part 2: Environment Setup Issues
echo TSK-007 to TSK-012 (6 tasks)
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
echo Will create 6 tasks: TSK-007 to TSK-012
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Starting Phase 0 Part 2 Issue Creation...
echo.

set success_count=0
set error_count=0

echo Creating TSK-007-ENV-backend-dockerfile...
echo # [TSK-007-ENV-backend-dockerfile] backend/Dockerfile Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/Dockerfile to define backend application container image. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/Dockerfile` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Docker Environment >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] backend/Dockerfile is created >> temp-issue.md
echo - [ ] Image builds successfully >> temp-issue.md

gh issue create --title "[TSK-007-ENV-backend-dockerfile] backend/Dockerfile Creation and Verification" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:0,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-007 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-007 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-008-ENV-backend-dockerignore...
echo # [TSK-008-ENV-backend-dockerignore] backend/.dockerignore Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/.dockerignore file to define exclusion files during Docker build. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/.dockerignore` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Docker Environment >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] backend/.dockerignore is created >> temp-issue.md
echo - [ ] Appropriate exclusion settings are configured >> temp-issue.md

gh issue create --title "[TSK-008-ENV-backend-dockerignore] backend/.dockerignore Creation and Verification" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:0,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-008 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-008 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-009-ENV-frontend-dockerfile...
echo # [TSK-009-ENV-frontend-dockerfile] frontend/Dockerfile Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/Dockerfile to define frontend application container image. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/Dockerfile` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Docker Environment >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] frontend/Dockerfile is created >> temp-issue.md
echo - [ ] Image builds successfully >> temp-issue.md

gh issue create --title "[TSK-009-ENV-frontend-dockerfile] frontend/Dockerfile Creation and Verification" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:0,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-009 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-009 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-010-ENV-frontend-dockerignore...
echo # [TSK-010-ENV-frontend-dockerignore] frontend/.dockerignore Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/.dockerignore file to define exclusion files during Docker build. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/.dockerignore` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Docker Environment >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] frontend/.dockerignore is created >> temp-issue.md
echo - [ ] Appropriate exclusion settings are configured >> temp-issue.md

gh issue create --title "[TSK-010-ENV-frontend-dockerignore] frontend/.dockerignore Creation and Verification" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:0,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-010 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-010 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo TSK-011: Already created (Issue #2)

echo Creating TSK-012-INF-postgres-dockerfile...
echo # [TSK-012-INF-postgres-dockerfile] PostgreSQL Dockerfile Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create infrastructure/docker/postgres/Dockerfile to define PostgreSQL container image. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `infrastructure/docker/postgres/Dockerfile` >> temp-issue.md
echo - **Layer**: Infrastructure >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Database and Infrastructure Setup >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] PostgreSQL Dockerfile is created >> temp-issue.md
echo - [ ] Image builds successfully >> temp-issue.md

gh issue create --title "[TSK-012-INF-postgres-dockerfile] PostgreSQL Dockerfile Creation and Verification" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:0,layer:infrastructure,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-012 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-012 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo ========================================
echo Phase 0 Part 2 Issue Creation Complete
echo ========================================
echo.
echo Results:
echo SUCCESS: !success_count! tasks
echo ERROR: !error_count! tasks
echo.
echo Next: Run create-phase0-part3-clean.bat for remaining Phase 0 tasks
echo.
pause
