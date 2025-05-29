@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Phase 4 Part 2: Remaining Components
echo TSK-082 to TSK-089 (8 tasks)
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
echo Will create 8 tasks: TSK-082 to TSK-089
echo Categories:
echo - Task Management Components (3 tasks: TSK-082 to TSK-084)
echo - UI and Layout Components (3 tasks: TSK-085 to TSK-087)
echo - Application Integration (2 tasks: TSK-088 to TSK-089)
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Starting Phase 4 Part 2 Issue Creation...
echo.

set success_count=0
set error_count=0

echo === Task Management Components (continued) ===

echo Creating TSK-082-CMP-TaskForm...
echo # [TSK-082-CMP-TaskForm] Task Form Component Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/components/tasks/task-form.tsx file and implement task creation/editing form component. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/components/tasks/task-form.tsx` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: Task Management Components >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] TaskForm component is implemented >> temp-issue.md
echo - [ ] Task creation works properly >> temp-issue.md
echo - [ ] Task editing works properly >> temp-issue.md

gh issue create --title "[TSK-082-CMP-TaskForm] Task Form Component Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-082 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-082 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-083-CMP-TaskItem...
echo # [TSK-083-CMP-TaskItem] Task Item Component Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/components/tasks/task-item.tsx file and implement individual task display component. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/components/tasks/task-item.tsx` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: Task Management Components >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] TaskItem component is implemented >> temp-issue.md
echo - [ ] Task display works properly >> temp-issue.md
echo - [ ] Task actions work properly >> temp-issue.md

gh issue create --title "[TSK-083-CMP-TaskItem] Task Item Component Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-083 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-083 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-084-HKS-UseTasks...
echo # [TSK-084-HKS-UseTasks] Tasks Hook Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/hooks/use-tasks.ts file and implement custom hook for task management functionality. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/hooks/use-tasks.ts` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: Task Management Components >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] useTasks hook is implemented >> temp-issue.md
echo - [ ] Task CRUD operations work properly >> temp-issue.md
echo - [ ] Task state management works properly >> temp-issue.md

gh issue create --title "[TSK-084-HKS-UseTasks] Tasks Hook Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-084 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-084 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo === UI and Layout Components ===

echo Creating TSK-085-CMP-Dashboard...
echo # [TSK-085-CMP-Dashboard] Dashboard Component Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/components/dashboard/dashboard.tsx file and implement main dashboard component. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/components/dashboard/dashboard.tsx` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: UI and Layout Components >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Dashboard component is implemented >> temp-issue.md
echo - [ ] Task statistics display works properly >> temp-issue.md
echo - [ ] Dashboard layout works properly >> temp-issue.md

gh issue create --title "[TSK-085-CMP-Dashboard] Dashboard Component Implementation" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-085 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-085 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-086-CMP-Layout...
echo # [TSK-086-CMP-Layout] Layout Component Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/components/layout/layout.tsx file and implement main layout component. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/components/layout/layout.tsx` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: UI and Layout Components >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Layout component is implemented >> temp-issue.md
echo - [ ] Responsive layout works properly >> temp-issue.md
echo - [ ] Navigation integration works properly >> temp-issue.md

gh issue create --title "[TSK-086-CMP-Layout] Layout Component Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-086 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-086 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-087-CMP-Navigation...
echo # [TSK-087-CMP-Navigation] Navigation Component Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/components/layout/navigation.tsx file and implement navigation component. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/components/layout/navigation.tsx` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: UI and Layout Components >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Navigation component is implemented >> temp-issue.md
echo - [ ] Menu navigation works properly >> temp-issue.md
echo - [ ] User menu works properly >> temp-issue.md

gh issue create --title "[TSK-087-CMP-Navigation] Navigation Component Implementation" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-087 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-087 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo === Application Integration ===

echo Creating TSK-088-CMP-App...
echo # [TSK-088-CMP-App] App Component Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/app.tsx file and implement main application component. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/app.tsx` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: Application Integration >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] App component is implemented >> temp-issue.md
echo - [ ] Routing works properly >> temp-issue.md
echo - [ ] Context providers work properly >> temp-issue.md

gh issue create --title "[TSK-088-CMP-App] App Component Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-088 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-088 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-089-ENV-frontend-package...
echo # [TSK-089-ENV-frontend-package] Frontend Package Configuration > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/package.json file and configure frontend dependencies and scripts. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/package.json` >> temp-issue.md
echo - **Layer**: Environment >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: Application Integration >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] package.json is configured >> temp-issue.md
echo - [ ] All dependencies are properly defined >> temp-issue.md
echo - [ ] Build scripts work properly >> temp-issue.md

gh issue create --title "[TSK-089-ENV-frontend-package] Frontend Package Configuration" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:4,layer:environment,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-089 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-089 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo ========================================
echo Phase 4 Part 2 Issue Creation Complete
echo Phase 4 FULLY COMPLETE!
echo ALL PHASES COMPLETE!
echo ========================================
echo.
echo Results:
echo SUCCESS: !success_count! tasks
echo ERROR: !error_count! tasks
echo.
echo Phase 4 Summary:
echo - Part 1: TSK-076, TSK-077, TSK-078, TSK-079, TSK-080, TSK-081 (6 tasks)
echo - Part 2: TSK-082, TSK-083, TSK-084, TSK-085, TSK-086, TSK-087, TSK-088, TSK-089 (8 tasks)
echo.
echo ========================================
echo PROJECT COMPLETION SUMMARY
echo ========================================
echo Phase 0: Environment Setup - 28 tasks COMPLETE
echo Phase 1: Infrastructure Layer - 5 tasks COMPLETE
echo Phase 2: Domain Layer - 5 tasks COMPLETE
echo Phase 3: Application Layer - 12 tasks COMPLETE
echo Phase 4: Presentation Layer - 14 tasks COMPLETE
echo.
echo TOTAL: 64 tasks created successfully!
echo.
echo All GitHub Issues have been created according to TODO list order.
echo Ready for implementation phase!
echo.
pause
