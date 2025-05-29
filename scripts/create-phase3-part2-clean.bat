@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Phase 3 Part 2: Controllers
echo TSK-071 to TSK-075 (5 tasks)
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
echo Will create 5 tasks: TSK-071 to TSK-075
echo All Controllers category
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Starting Phase 3 Part 2 Issue Creation...
echo.

set success_count=0
set error_count=0

echo === Controllers (continued) ===

echo Creating TSK-071-CTL-TaskController...
echo # [TSK-071-CTL-TaskController] Task Controller Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/controllers/task-controller.ts file and implement task management API endpoints. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/controllers/task-controller.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Controllers >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] TaskController is implemented >> temp-issue.md
echo - [ ] CRUD operations work properly >> temp-issue.md
echo - [ ] Task filtering and search work properly >> temp-issue.md

gh issue create --title "[TSK-071-CTL-TaskController] Task Controller Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-071 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-071 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-072-CTL-UserController...
echo # [TSK-072-CTL-UserController] User Controller Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/controllers/user-controller.ts file and implement user management API endpoints. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/controllers/user-controller.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Controllers >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] UserController is implemented >> temp-issue.md
echo - [ ] Profile management works properly >> temp-issue.md
echo - [ ] User settings work properly >> temp-issue.md

gh issue create --title "[TSK-072-CTL-UserController] User Controller Implementation" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-072 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-072 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-073-CTL-CategoryController...
echo # [TSK-073-CTL-CategoryController] Category Controller Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/controllers/category-controller.ts file and implement category management API endpoints. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/controllers/category-controller.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Controllers >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] CategoryController is implemented >> temp-issue.md
echo - [ ] Category CRUD operations work properly >> temp-issue.md
echo - [ ] Category hierarchy management works properly >> temp-issue.md

gh issue create --title "[TSK-073-CTL-CategoryController] Category Controller Implementation" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-073 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-073 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-074-CTL-BaseController...
echo # [TSK-074-CTL-BaseController] Base Controller Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/controllers/base-controller.ts file and implement base class for all controllers. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/controllers/base-controller.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Controllers >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] BaseController class is implemented >> temp-issue.md
echo - [ ] Common functionality works properly >> temp-issue.md
echo - [ ] Can be inherited by other controllers >> temp-issue.md

gh issue create --title "[TSK-074-CTL-BaseController] Base Controller Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-074 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-074 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-075-APP-ExpressApp...
echo # [TSK-075-APP-ExpressApp] Express Application Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/app.ts file and implement Express application integration. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/app.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Controllers >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Express application is implemented >> temp-issue.md
echo - [ ] All middleware is properly configured >> temp-issue.md
echo - [ ] All routes are properly configured >> temp-issue.md
echo - [ ] Application starts successfully >> temp-issue.md

gh issue create --title "[TSK-075-APP-ExpressApp] Express Application Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-075 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-075 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo ========================================
echo Phase 3 Part 2 Issue Creation Complete
echo Phase 3 FULLY COMPLETE!
echo ========================================
echo.
echo Results:
echo SUCCESS: !success_count! tasks
echo ERROR: !error_count! tasks
echo.
echo Phase 3 Summary:
echo - Part 1: TSK-064, TSK-065, TSK-066, TSK-067, TSK-068, TSK-069, TSK-070 (7 tasks)
echo - Part 2: TSK-071, TSK-072, TSK-073, TSK-074, TSK-075 (5 tasks)
echo.
echo Next: Run create-phase4-clean.bat for Phase 4 tasks
echo.
pause
