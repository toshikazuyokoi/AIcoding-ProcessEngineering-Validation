@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Phase 3: Application Layer Issues
echo TSK-064 to TSK-075 (12 tasks)
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
echo Will create 12 tasks: TSK-064 to TSK-075
echo Categories:
echo - Validation and Utilities (3 tasks: TSK-064 to TSK-066)
echo - Middleware (3 tasks: TSK-067 to TSK-069)
echo - Controllers (6 tasks: TSK-070 to TSK-075)
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Starting Phase 3 Issue Creation...
echo.

set success_count=0
set error_count=0

REM Validation and Utilities (TSK-064 to TSK-066)
echo === Validation and Utilities ===

echo Creating TSK-064-UTL-ZodValidator...
echo # [TSK-064-UTL-ZodValidator] Zod Validator Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/utils/zod-validator.ts file and implement validation functionality using Zod. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/utils/zod-validator.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Validation and Utilities >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] ZodValidator class is implemented >> temp-issue.md
echo - [ ] All validation rules work properly >> temp-issue.md
echo - [ ] Error messages are output appropriately >> temp-issue.md

gh issue create --title "[TSK-064-UTL-ZodValidator] Zod Validator Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-064 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-064 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-065-UTL-ResponseBuilder...
echo # [TSK-065-UTL-ResponseBuilder] Response Builder Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/utils/response-builder.ts file and implement unified API response format functionality. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/utils/response-builder.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Validation and Utilities >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] ResponseBuilder class is implemented >> temp-issue.md
echo - [ ] Unified response format is functional >> temp-issue.md
echo - [ ] Error responses are generated appropriately >> temp-issue.md

gh issue create --title "[TSK-065-UTL-ResponseBuilder] Response Builder Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-065 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-065 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-066-UTL-RequestValidator...
echo # [TSK-066-UTL-RequestValidator] Request Validator Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/utils/request-validator.ts file and implement HTTP request validation functionality. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/utils/request-validator.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Validation and Utilities >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] RequestValidator class is implemented >> temp-issue.md
echo - [ ] Request validation works properly >> temp-issue.md
echo - [ ] Appropriate error responses are returned >> temp-issue.md

gh issue create --title "[TSK-066-UTL-RequestValidator] Request Validator Implementation" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-066 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-066 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo Progress: !success_count! success, !error_count! errors
echo Continue with Middleware...
pause >nul

echo === Middleware ===

echo Creating TSK-067-MID-AuthMiddleware...
echo # [TSK-067-MID-AuthMiddleware] Authentication Middleware Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/middleware/auth-middleware.ts file and implement JWT authentication middleware. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/middleware/auth-middleware.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Middleware >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] AuthMiddleware is implemented >> temp-issue.md
echo - [ ] JWT authentication works properly >> temp-issue.md
echo - [ ] Proper handling for unauthenticated requests >> temp-issue.md

gh issue create --title "[TSK-067-MID-AuthMiddleware] Authentication Middleware Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-067 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-067 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-068-MID-ErrorMiddleware...
echo # [TSK-068-MID-ErrorMiddleware] Error Middleware Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/middleware/error-middleware.ts file and implement unified error handling middleware. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/middleware/error-middleware.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Middleware >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] ErrorMiddleware is implemented >> temp-issue.md
echo - [ ] Unified error handling works properly >> temp-issue.md
echo - [ ] Appropriate error responses are generated >> temp-issue.md

gh issue create --title "[TSK-068-MID-ErrorMiddleware] Error Middleware Implementation" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-068 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-068 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-069-MID-LoggingMiddleware...
echo # [TSK-069-MID-LoggingMiddleware] Logging Middleware Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/middleware/logging-middleware.ts file and implement request logging middleware. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/middleware/logging-middleware.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Middleware >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] LoggingMiddleware is implemented >> temp-issue.md
echo - [ ] Request logging works properly >> temp-issue.md
echo - [ ] Log output is appropriate >> temp-issue.md

gh issue create --title "[TSK-069-MID-LoggingMiddleware] Logging Middleware Implementation" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-069 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-069 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo Progress: !success_count! success, !error_count! errors
echo Continue with Controllers...
pause >nul

echo === Controllers ===

echo Creating TSK-070-CTL-AuthController...
echo # [TSK-070-CTL-AuthController] Authentication Controller Implementation > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create backend/src/controllers/auth-controller.ts file and implement authentication API endpoints. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `backend/src/controllers/auth-controller.ts` >> temp-issue.md
echo - **Layer**: Application >> temp-issue.md
echo - **Priority**: Critical >> temp-issue.md
echo - **Phase**: Phase 3 >> temp-issue.md
echo - **Category**: Controllers >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] AuthController is implemented >> temp-issue.md
echo - [ ] Login/Register/Logout endpoints work properly >> temp-issue.md
echo - [ ] JWT token management works properly >> temp-issue.md

gh issue create --title "[TSK-070-CTL-AuthController] Authentication Controller Implementation" --body-file "temp-issue.md" --label "priority:critical,type:feature,phase:3,layer:application,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-070 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-070 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo ========================================
echo Phase 3 Issue Creation Complete (Part 1)
echo ========================================
echo.
echo Results so far:
echo SUCCESS: !success_count! tasks
echo ERROR: !error_count! tasks
echo.
echo Next: Run create-phase3-part2-clean.bat for remaining controllers (TSK-071 to TSK-075)
echo.
pause
