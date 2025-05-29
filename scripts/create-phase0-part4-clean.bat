@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Phase 0 Part 4: Cross-platform Scripts
echo TSK-021 to TSK-028 (8 tasks)
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
echo Will create 8 tasks: TSK-021 to TSK-028
echo All Cross-platform Scripts category
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Starting Phase 0 Part 4 Issue Creation...
echo.

set success_count=0
set error_count=0

echo === Cross-platform Scripts (continued) ===

echo Creating TSK-021-SCR-test-cross...
echo # [TSK-021-SCR-test-cross] Cross-platform Test Execution Script Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create scripts/cross-platform/run-tests.js file for cross-platform test execution. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `scripts/cross-platform/run-tests.js` >> temp-issue.md
echo - **Layer**: Script >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Cross-platform Scripts >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Cross-platform test script is created >> temp-issue.md
echo - [ ] Works on Windows, macOS, and Linux >> temp-issue.md

gh issue create --title "[TSK-021-SCR-test-cross] Cross-platform Test Execution Script Creation and Verification" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:0,layer:script,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-021 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-021 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-022-SCR-deploy-cross...
echo # [TSK-022-SCR-deploy-cross] Cross-platform Deploy Script Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create scripts/cross-platform/deploy.js file for cross-platform deployment. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `scripts/cross-platform/deploy.js` >> temp-issue.md
echo - **Layer**: Script >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Cross-platform Scripts >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Cross-platform deploy script is created >> temp-issue.md
echo - [ ] Works on Windows, macOS, and Linux >> temp-issue.md

gh issue create --title "[TSK-022-SCR-deploy-cross] Cross-platform Deploy Script Creation and Verification" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:0,layer:script,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-022 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-022 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-023-SCR-backup-cross...
echo # [TSK-023-SCR-backup-cross] Cross-platform Backup Script Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create scripts/cross-platform/backup.js file for cross-platform backup. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `scripts/cross-platform/backup.js` >> temp-issue.md
echo - **Layer**: Script >> temp-issue.md
echo - **Priority**: Low >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Cross-platform Scripts >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Cross-platform backup script is created >> temp-issue.md
echo - [ ] Works on Windows, macOS, and Linux >> temp-issue.md

gh issue create --title "[TSK-023-SCR-backup-cross] Cross-platform Backup Script Creation and Verification" --body-file "temp-issue.md" --label "priority:low,type:feature,phase:0,layer:script,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-023 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-023 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-024-SCR-setup-linux...
echo # [TSK-024-SCR-setup-linux] Linux Development Environment Setup Script Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create scripts/linux/setup-dev.sh file for Linux development environment setup. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `scripts/linux/setup-dev.sh` >> temp-issue.md
echo - **Layer**: Script >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Cross-platform Scripts >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Linux setup script is created >> temp-issue.md
echo - [ ] Works properly on Linux distributions >> temp-issue.md

gh issue create --title "[TSK-024-SCR-setup-linux] Linux Development Environment Setup Script Creation and Verification" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:0,layer:script,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-024 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-024 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-025-SCR-test-linux...
echo # [TSK-025-SCR-test-linux] Linux Test Execution Script Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create scripts/linux/run-tests.sh file for Linux test execution. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `scripts/linux/run-tests.sh` >> temp-issue.md
echo - **Layer**: Script >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Cross-platform Scripts >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Linux test script is created >> temp-issue.md
echo - [ ] Works properly on Linux distributions >> temp-issue.md

gh issue create --title "[TSK-025-SCR-test-linux] Linux Test Execution Script Creation and Verification" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:0,layer:script,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-025 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-025 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-026-SCR-deploy-linux...
echo # [TSK-026-SCR-deploy-linux] Linux Deploy Script Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create scripts/linux/deploy.sh file for Linux deployment. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `scripts/linux/deploy.sh` >> temp-issue.md
echo - **Layer**: Script >> temp-issue.md
echo - **Priority**: Medium >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Cross-platform Scripts >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Linux deploy script is created >> temp-issue.md
echo - [ ] Works properly on Linux distributions >> temp-issue.md

gh issue create --title "[TSK-026-SCR-deploy-linux] Linux Deploy Script Creation and Verification" --body-file "temp-issue.md" --label "priority:medium,type:feature,phase:0,layer:script,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-026 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-026 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-027-SCR-backup-linux...
echo # [TSK-027-SCR-backup-linux] Linux Backup Script Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create scripts/linux/backup.sh file for Linux backup. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `scripts/linux/backup.sh` >> temp-issue.md
echo - **Layer**: Script >> temp-issue.md
echo - **Priority**: Low >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Cross-platform Scripts >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Linux backup script is created >> temp-issue.md
echo - [ ] Works properly on Linux distributions >> temp-issue.md

gh issue create --title "[TSK-027-SCR-backup-linux] Linux Backup Script Creation and Verification" --body-file "temp-issue.md" --label "priority:low,type:feature,phase:0,layer:script,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-027 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-027 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo Creating TSK-028-SCR-setup-windows...
echo # [TSK-028-SCR-setup-windows] Windows Development Environment Setup Script Creation and Verification > temp-issue.md
echo. >> temp-issue.md
echo ## Overview >> temp-issue.md
echo Create scripts/windows/setup-dev.bat file for Windows development environment setup. >> temp-issue.md
echo. >> temp-issue.md
echo ## Implementation Target >> temp-issue.md
echo - **File**: `scripts/windows/setup-dev.bat` >> temp-issue.md
echo - **Layer**: Script >> temp-issue.md
echo - **Priority**: High >> temp-issue.md
echo - **Phase**: Phase 0 >> temp-issue.md
echo - **Category**: Cross-platform Scripts >> temp-issue.md
echo. >> temp-issue.md
echo ## Completion Criteria >> temp-issue.md
echo - [ ] Windows setup script is created >> temp-issue.md
echo - [ ] Works properly on Windows >> temp-issue.md

gh issue create --title "[TSK-028-SCR-setup-windows] Windows Development Environment Setup Script Creation and Verification" --body-file "temp-issue.md" --label "priority:high,type:feature,phase:0,layer:script,augment-20250528" --assignee "toshikazuyokoi" >nul 2>&1
if errorlevel 1 (
    echo ERROR: TSK-028 creation failed
    set /a error_count+=1
) else (
    echo SUCCESS: TSK-028 created
    set /a success_count+=1
)
del temp-issue.md >nul 2>&1

echo.
echo ========================================
echo Phase 0 Part 4 Issue Creation Complete
echo Phase 0 FULLY COMPLETE!
echo ========================================
echo.
echo Results:
echo SUCCESS: !success_count! tasks
echo ERROR: !error_count! tasks
echo.
echo Phase 0 Summary:
echo - Part 1: TSK-003, TSK-004, TSK-005, TSK-006 (4 tasks)
echo - Part 2: TSK-007, TSK-008, TSK-009, TSK-010, TSK-012 (5 tasks)
echo - Part 3: TSK-013, TSK-014, TSK-015, TSK-016, TSK-017, TSK-018, TSK-019, TSK-020 (8 tasks)
echo - Part 4: TSK-021, TSK-022, TSK-023, TSK-024, TSK-025, TSK-026, TSK-027, TSK-028 (8 tasks)
echo.
echo Next: Run create-phase1-clean.bat for Phase 1 tasks
echo.
pause
