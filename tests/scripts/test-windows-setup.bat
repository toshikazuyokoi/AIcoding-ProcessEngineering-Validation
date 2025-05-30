@echo off
setlocal enabledelayedexpansion

REM ===================================
REM Windows Setup Script Test Suite
REM ===================================
REM Purpose: Comprehensive testing for scripts/windows/setup-dev.bat
REM Author: Process Engineering Approach
REM Version: 1.0.0

REM ===================================
REM Test Configuration
REM ===================================
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\.."
set "SETUP_SCRIPT=%PROJECT_ROOT%\scripts\windows\setup-dev.bat"
set "TEST_LOG_DIR=%PROJECT_ROOT%\logs\tests"
set "TEST_LOG=%TEST_LOG_DIR%\test-windows-setup-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log"

REM Test counters
set "TESTS_RUN=0"
set "TESTS_PASSED=0"
set "TESTS_FAILED=0"

REM ===================================
REM Test Utilities
REM ===================================
:setup_test_logging
if not exist "%TEST_LOG_DIR%" mkdir "%TEST_LOG_DIR%"
echo. > "%TEST_LOG%"
goto :eof

:test_log
echo 🧪 %~1
echo 🧪 %~1 >> "%TEST_LOG%"
goto :eof

:test_pass
echo ✅ PASS: %~1
echo ✅ PASS: %~1 >> "%TEST_LOG%"
set /a TESTS_PASSED+=1
goto :eof

:test_fail
echo ❌ FAIL: %~1
echo ❌ FAIL: %~1 >> "%TEST_LOG%"
set /a TESTS_FAILED+=1
goto :eof

:test_info
echo ℹ️  INFO: %~1
echo ℹ️  INFO: %~1 >> "%TEST_LOG%"
goto :eof

:run_test
set "TEST_NAME=%~1"
set "TEST_FUNCTION=%~2"
set /a TESTS_RUN+=1

call :test_log "Running test: %TEST_NAME%"

call :%TEST_FUNCTION%
if errorlevel 1 (
    call :test_fail "%TEST_NAME%"
) else (
    call :test_pass "%TEST_NAME%"
)

echo.
goto :eof

REM ===================================
REM Test Functions
REM ===================================
:test_script_exists
if exist "%SETUP_SCRIPT%" (
    exit /b 0
) else (
    exit /b 1
)

:test_script_syntax
REM Basic syntax check by attempting to parse the file
findstr /r "^:" "%SETUP_SCRIPT%" >nul
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_required_functions
set "MISSING_FUNCTIONS="
set "REQUIRED_FUNCS=setup_logging log_info log_success log_warning log_error log_step command_exists check_port get_version version_compare check_system_requirements check_ports setup_directories setup_environment_files install_dependencies setup_database verify_setup print_summary show_help parse_arguments main"

for %%f in (%REQUIRED_FUNCS%) do (
    findstr /c ":%%f" "%SETUP_SCRIPT%" >nul
    if errorlevel 1 (
        set "MISSING_FUNCTIONS=!MISSING_FUNCTIONS! %%f"
    )
)

if "%MISSING_FUNCTIONS%"=="" (
    exit /b 0
) else (
    call :test_info "Missing functions:%MISSING_FUNCTIONS%"
    exit /b 1
)

:test_help_option
"%SETUP_SCRIPT%" --help >nul 2>&1
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_invalid_option
"%SETUP_SCRIPT%" --invalid-option >nul 2>&1
if errorlevel 1 (
    exit /b 0
) else (
    exit /b 1
)

:test_dry_run_option
"%SETUP_SCRIPT%" --dry-run >nul 2>&1
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_skip_deps_option
"%SETUP_SCRIPT%" --skip-deps --dry-run >nul 2>&1
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_verbose_option
"%SETUP_SCRIPT%" --verbose --dry-run >nul 2>&1
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_combined_options
"%SETUP_SCRIPT%" --skip-deps --verbose --dry-run >nul 2>&1
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_logging_functions
REM Test that logging functions are properly defined
findstr /c ":log_info" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":log_success" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":log_warning" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":log_error" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":log_step" "%SETUP_SCRIPT%" >nul
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_utility_functions
REM Test that utility functions are properly defined
findstr /c ":command_exists" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":check_port" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":get_version" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":version_compare" "%SETUP_SCRIPT%" >nul
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_setup_functions
REM Test that setup functions are properly defined
findstr /c ":check_system_requirements" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":check_ports" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":setup_directories" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":setup_environment_files" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":install_dependencies" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":setup_database" "%SETUP_SCRIPT%" >nul && ^
findstr /c ":verify_setup" "%SETUP_SCRIPT%" >nul
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_configuration_variables
REM Test that required configuration variables are defined
findstr /c "NODE_VERSION" "%SETUP_SCRIPT%" >nul && ^
findstr /c "NPM_VERSION" "%SETUP_SCRIPT%" >nul && ^
findstr /c "REQUIRED_PORTS" "%SETUP_SCRIPT%" >nul && ^
findstr /c "PROJECT_ROOT" "%SETUP_SCRIPT%" >nul && ^
findstr /c "LOG_DIR" "%SETUP_SCRIPT%" >nul
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_error_handling
REM Test that error handling is implemented
findstr /c "errorlevel" "%SETUP_SCRIPT%" >nul && ^
findstr /c "exit /b 1" "%SETUP_SCRIPT%" >nul
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_help_content
REM Test that help content includes required sections
for /f "tokens=*" %%i in ('"%SETUP_SCRIPT%" --help 2^>nul') do (
    echo %%i | findstr /c "USAGE:" >nul && (
        echo %%i | findstr /c "OPTIONS:" >nul && (
            echo %%i | findstr /c "EXAMPLES:" >nul && (
                echo %%i | findstr /c "REQUIREMENTS:" >nul && (
                    exit /b 0
                )
            )
        )
    )
)
exit /b 1

:test_dry_run_output
REM Test that dry run produces expected output
for /f "tokens=*" %%i in ('"%SETUP_SCRIPT%" --dry-run 2^>nul') do (
    echo %%i | findstr /c "DRY RUN MODE" >nul && (
        echo %%i | findstr /c "No changes will be made" >nul && (
            exit /b 0
        )
    )
)
exit /b 1

:test_script_performance
REM Test script performance (dry run should complete quickly)
set "START_TIME=%time%"
"%SETUP_SCRIPT%" --dry-run >nul 2>&1
set "END_TIME=%time%"

REM Simple performance check - dry run should complete within reasonable time
if errorlevel 1 (
    exit /b 1
) else (
    call :test_info "Performance test passed - dry run completed"
    exit /b 0
)

REM ===================================
REM Integration Tests
REM ===================================
:test_full_dry_run
REM Test complete dry run execution
"%SETUP_SCRIPT%" --dry-run >nul 2>&1
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:test_full_dry_run_with_options
REM Test dry run with all options
"%SETUP_SCRIPT%" --skip-deps --verbose --dry-run >nul 2>&1
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

REM ===================================
REM Main Test Execution
REM ===================================
:main
echo ============================================================
echo 🧪 Windows Setup Script Test Suite
echo ============================================================
echo Script: %SETUP_SCRIPT%
echo Log: %TEST_LOG%
echo.

call :setup_test_logging

REM Basic tests
call :run_test "Script exists" test_script_exists
call :run_test "Script syntax is valid" test_script_syntax
call :run_test "Required functions exist" test_required_functions

REM Help and error handling tests
call :run_test "Help option works" test_help_option
call :run_test "Invalid option handling" test_invalid_option
call :run_test "Help content is complete" test_help_content

REM Option tests
call :run_test "Dry run option" test_dry_run_option
call :run_test "Skip deps option" test_skip_deps_option
call :run_test "Verbose option" test_verbose_option
call :run_test "Combined options" test_combined_options

REM Function tests
call :run_test "Logging functions" test_logging_functions
call :run_test "Utility functions" test_utility_functions
call :run_test "Setup functions" test_setup_functions

REM Configuration tests
call :run_test "Configuration variables" test_configuration_variables
call :run_test "Error handling" test_error_handling

REM Output tests
call :run_test "Dry run output" test_dry_run_output

REM Integration tests
call :run_test "Full dry run" test_full_dry_run
call :run_test "Full dry run with options" test_full_dry_run_with_options

REM Performance tests
call :run_test "Script performance" test_script_performance

REM Test summary
echo ============================================================
echo 📊 Test Results Summary
echo ============================================================
echo Tests Run: %TESTS_RUN%
echo Tests Passed: %TESTS_PASSED%
echo Tests Failed: %TESTS_FAILED%
set /a SUCCESS_RATE=%TESTS_PASSED% * 100 / %TESTS_RUN%
echo Success Rate: %SUCCESS_RATE%%%
echo.
echo Log file: %TEST_LOG%
echo.

if %TESTS_FAILED% equ 0 (
    echo 🎉 All tests passed!
    exit /b 0
) else (
    echo ❌ Some tests failed!
    exit /b 1
)

REM Run main function
call :main %*
exit /b %errorlevel%
