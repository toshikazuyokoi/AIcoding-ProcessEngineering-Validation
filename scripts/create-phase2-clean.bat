@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Phase 2: Domain Layer Issues
echo TSK-050 to TSK-053 (4 tasks)
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
echo Will create 4 tasks: TSK-050 to TSK-053
echo Already created: TSK-049-ENT-User (Issue #4)
echo New tasks: 4 tasks
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Starting Phase 2 Issue Creation...
echo.

set success_count=0
set error_count=0

echo TSK-049: Already created (Issue #4)

echo Creating TSK-050-ENT-Task...
echo # [TSK-050-ENT-Task] Task Entity Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/domain/entities/task.entity.ts file and implement task entity business logic. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/domain/entities/task.entity.ts` >> temp-issue.md
echo - **Layer**: Domain >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 2 >> temp-issue.md
echo - **Category**: Entity >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Task entity class is implemented >> temp-issue.md
echo - [ ] All business rules are implemented >> temp-issue.md
echo - [ ] Validation processing works properly >> temp-issue.md

gh issue create --title "[TSK-050-ENT-Task] Task Entity Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:2,layer:domain,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-050 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-050 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-051-ENT-Category...
echo # [TSK-051-ENT-Category] Category Entity Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/domain/entities/category.entity.ts file and implement category entity business logic. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/domain/entities/category.entity.ts` >> temp-issue.md
echo - **Layer**: Domain >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 2 >> temp-issue.md
echo - **Category**: Entity >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Category entity class is implemented >> temp-issue.md
echo - [ ] All business rules are implemented >> temp-issue.md
echo - [ ] Validation processing works properly >> temp-issue.md

gh issue create --title "[TSK-051-ENT-Category] Category Entity Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:2,layer:domain,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-051 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-051 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-052-ENT-BaseEntity...
echo # [TSK-052-ENT-BaseEntity] Base Entity Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/domain/entities/base.entity.ts file and implement base class for all entities. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/domain/entities/base.entity.ts` >> temp-issue.md
echo - **Layer**: Domain >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 2 >> temp-issue.md
echo - **Category**: Entity >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] BaseEntity class is implemented >> temp-issue.md
echo - [ ] Common functionality works properly >> temp-issue.md
echo - [ ] Can be inherited by other entities >> temp-issue.md

gh issue create --title "[TSK-052-ENT-BaseEntity] Base Entity Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:2,layer:domain,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-052 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-052 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-053-SVC-AuthService...
echo # [TSK-053-SVC-AuthService] Authentication Service Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/domain/services/auth-service.ts file and implement authentication domain service. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/domain/services/auth-service.ts` >> temp-issue.md
echo - **Layer**: Domain >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 2 >> temp-issue.md
echo - **Category**: Domain Service >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] AuthService class is implemented >> temp-issue.md
echo - [ ] Authentication logic works properly >> temp-issue.md
echo - [ ] Security requirements are met >> temp-issue.md

gh issue create --title "[TSK-053-SVC-AuthService] Authentication Service Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:2,layer:domain,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-053 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-053 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo ========================================
echo Phase 2 Issue Creation Complete
echo ========================================
echo.
echo Results:
echo SUCCESS: !success_count! tasks
echo ERROR: !error_count! tasks
echo.
echo Next: Run create-phase3-clean.bat for Phase 3 tasks
echo.
pause
