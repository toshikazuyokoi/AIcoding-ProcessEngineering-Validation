@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Phase 4: Presentation Layer Issues
echo TSK-076 to TSK-089 (14 tasks)
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
echo Will create 14 tasks: TSK-076 to TSK-089
echo Categories:
echo - API and Authentication Foundation (3 tasks: TSK-076 to TSK-078)
echo - Authentication Components (2 tasks: TSK-079 to TSK-080)
echo - Task Management Components (4 tasks: TSK-081 to TSK-084)
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
echo Starting Phase 4 Issue Creation...
echo.

set success_count=0
set error_count=0

REM API and Authentication Foundation (TSK-076 to TSK-078)
echo === API and Authentication Foundation ===

echo Creating TSK-076-UTL-ApiClient...
echo # [TSK-076-UTL-ApiClient] API Client Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/utils/api-client.ts file and implement client for backend API communication. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/utils/api-client.ts` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: API and Authentication Foundation >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] ApiClient class is implemented >> temp-issue.md
echo - [ ] All HTTP methods work properly >> temp-issue.md
echo - [ ] Authentication headers are set appropriately >> temp-issue.md

gh issue create --title "[TSK-076-UTL-ApiClient] API Client Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-076 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-076 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-077-CTX-AuthContext...
echo # [TSK-077-CTX-AuthContext] Authentication Context Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/contexts/auth-context.tsx file and implement context for application-wide authentication state management. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/contexts/auth-context.tsx` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: API and Authentication Foundation >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] AuthContext is implemented >> temp-issue.md
echo - [ ] Authentication state management works properly >> temp-issue.md
echo - [ ] Login/Logout functionality works >> temp-issue.md

gh issue create --title "[TSK-077-CTX-AuthContext] Authentication Context Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-077 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-077 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-078-HKS-UseAuth...
echo # [TSK-078-HKS-UseAuth] Authentication Hook Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/hooks/use-auth.ts file and implement custom hook for authentication functionality. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/hooks/use-auth.ts` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: API and Authentication Foundation >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] useAuth hook is implemented >> temp-issue.md
echo - [ ] Authentication state retrieval works properly >> temp-issue.md
echo - [ ] Authentication actions work properly >> temp-issue.md

gh issue create --title "[TSK-078-HKS-UseAuth] Authentication Hook Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-078 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-078 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo Progress: !success_count! success, !error_count! errors
echo Continue with Authentication Components...
pause >nul

echo === Authentication Components ===

echo Creating TSK-079-CMP-AuthForm...
echo # [TSK-079-CMP-AuthForm] Authentication Form Component Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/components/auth/auth-form.tsx file and implement login/registration form component. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/components/auth/auth-form.tsx` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: Authentication Components >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] AuthForm component is implemented >> temp-issue.md
echo - [ ] Login functionality works properly >> temp-issue.md
echo - [ ] Registration functionality works properly >> temp-issue.md

gh issue create --title "[TSK-079-CMP-AuthForm] Authentication Form Component Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-079 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-079 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-080-CMP-ProtectedRoute...
echo # [TSK-080-CMP-ProtectedRoute] Protected Route Component Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/components/auth/protected-route.tsx file and implement route protection component. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/components/auth/protected-route.tsx` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: Authentication Components >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] ProtectedRoute component is implemented >> temp-issue.md
echo - [ ] Route protection works properly >> temp-issue.md
echo - [ ] Redirect to login works properly >> temp-issue.md

gh issue create --title "[TSK-080-CMP-ProtectedRoute] Protected Route Component Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-080 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-080 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo Progress: !success_count! success, !error_count! errors
echo Continue with Task Management Components...
pause >nul

echo === Task Management Components ===

echo Creating TSK-081-CMP-TaskList...
echo # [TSK-081-CMP-TaskList] Task List Component Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create frontend/src/components/tasks/task-list.tsx file and implement task list display component. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `frontend/src/components/tasks/task-list.tsx` >> temp-issue.md
echo - **Layer**: Presentation >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 4 >> temp-issue.md
echo - **Category**: Task Management Components >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] TaskList component is implemented >> temp-issue.md
echo - [ ] Task display works properly >> temp-issue.md
echo - [ ] Filtering and search work properly >> temp-issue.md

gh issue create --title "[TSK-081-CMP-TaskList] Task List Component Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:4,layer:presentation,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-081 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-081 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo ========================================
echo Phase 4 Issue Creation Complete (Part 1)
echo ========================================
echo.
echo Results so far:
echo SUCCESS: !success_count! tasks
echo ERROR: !error_count! tasks
echo.
echo Next: Run create-phase4-part2-clean.bat for remaining tasks (TSK-082 to TSK-089)
echo.
pause
