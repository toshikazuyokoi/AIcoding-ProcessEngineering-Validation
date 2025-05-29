#!/bin/bash

# ===================================
# Task Management System - Linux Test Script Validation
# ===================================
# Generated for TSK-025-SCR-test-linux
# Project: Task Management System
# Component: Linux Test Script Testing
# Purpose: Test and validate the Linux test execution script

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TEST_SCRIPT="${SCRIPT_DIR}/run-tests.sh"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly TEST_LOG="${PROJECT_ROOT}/logs/test-run-tests-$(date +%Y%m%d-%H%M%S).log"

# Test counters
total_tests=0
passed_tests=0
failed_tests=0

# Required functions in the test script
readonly REQUIRED_FUNCTIONS=(
    "log_info"
    "log_success"
    "log_warning"
    "log_error"
    "log_step"
    "log_test"
    "command_exists"
    "get_version"
    "is_port_available"
    "wait_for_service"
    "setup_logging"
    "check_test_environment"
    "setup_test_directories"
    "setup_test_environment"
    "run_unit_tests"
    "run_integration_tests"
    "run_e2e_tests"
    "run_performance_tests"
    "run_security_tests"
    "execute_tests"
    "cleanup_test_environment"
    "generate_test_report"
    "print_summary"
    "show_help"
    "main"
)

# ===================================
# Test Utilities
# ===================================
test_log() {
    echo -e "\033[35m🧪 $1\033[0m" | tee -a "${TEST_LOG}"
}

test_pass() {
    echo -e "\033[32m✅ PASS: $1\033[0m" | tee -a "${TEST_LOG}"
    ((passed_tests++))
}

test_fail() {
    echo -e "\033[31m❌ FAIL: $1\033[0m" | tee -a "${TEST_LOG}"
    ((failed_tests++))
}

test_skip() {
    echo -e "\033[33m⏭️  SKIP: $1\033[0m" | tee -a "${TEST_LOG}"
}

run_test() {
    local test_name="$1"
    local test_command="$2"

    test_log "Testing: $test_name"
    ((total_tests++))

    if eval "$test_command"; then
        test_pass "$test_name"
        return 0
    else
        test_fail "$test_name"
        return 1
    fi
}

# ===================================
# Test Functions
# ===================================
test_script_exists() {
    if [[ -f "$TEST_SCRIPT" ]]; then
        test_pass "Test script exists: $TEST_SCRIPT"
        return 0
    else
        test_fail "Test script not found: $TEST_SCRIPT"
        return 1
    fi
}

test_script_executable() {
    if [[ -x "$TEST_SCRIPT" ]]; then
        test_pass "Test script is executable"
        return 0
    else
        test_fail "Test script is not executable"
        return 1
    fi
}

test_script_syntax() {
    if bash -n "$TEST_SCRIPT"; then
        test_pass "Script syntax is valid"
        return 0
    else
        test_fail "Script syntax check failed"
        return 1
    fi
}

test_shebang() {
    local shebang
    shebang=$(head -n1 "$TEST_SCRIPT")

    if [[ "$shebang" == "#!/bin/bash" ]]; then
        test_pass "Shebang is correct"
        return 0
    else
        test_fail "Shebang is incorrect: $shebang"
        return 1
    fi
}

test_required_functions() {
    local missing_functions=()

    for func in "${REQUIRED_FUNCTIONS[@]}"; do
        if ! grep -q "^${func}()" "$TEST_SCRIPT"; then
            missing_functions+=("$func")
        fi
    done

    if [[ ${#missing_functions[@]} -eq 0 ]]; then
        test_pass "All required functions are present"
        return 0
    else
        test_fail "Missing functions: ${missing_functions[*]}"
        return 1
    fi
}

test_configuration_variables() {
    test_log "Testing configuration variables"

    local required_vars=(
        "SCRIPT_DIR"
        "PROJECT_ROOT"
        "LOG_FILE"
        "TEST_TIMEOUT"
        "COVERAGE_THRESHOLD"
        "MAX_RETRIES"
        "TEST_TYPES"
        "TEST_DIRECTORIES"
        "TEST_ENV_VARS"
    )

    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if ! grep -q "readonly ${var}=" "$TEST_SCRIPT"; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -eq 0 ]]; then
        test_pass "All configuration variables are present"
        return 0
    else
        test_fail "Missing configuration variables: ${missing_vars[*]}"
        return 1
    fi
}

test_help_option() {
    test_log "Testing help option"

    if "$TEST_SCRIPT" --help >/dev/null 2>&1; then
        test_pass "Help option works"
        return 0
    else
        test_fail "Help option failed"
        return 1
    fi
}

test_error_handling() {
    test_log "Testing error handling"

    # Test with invalid test type
    if ! "$TEST_SCRIPT" invalid_test_type >/dev/null 2>&1; then
        test_pass "Error handling for invalid test type works"
        return 0
    else
        test_fail "Error handling for invalid test type failed"
        return 1
    fi
}

test_logging_functionality() {
    test_log "Testing logging functionality"

    # Source the script to test logging functions
    if source "$TEST_SCRIPT" >/dev/null 2>&1; then
        # Test if logging functions are available
        if declare -f log_info >/dev/null && declare -f log_success >/dev/null; then
            test_pass "Logging functions are available"
            return 0
        else
            test_fail "Logging functions are not available"
            return 1
        fi
    else
        test_fail "Cannot source script for logging test"
        return 1
    fi
}

test_test_types() {
    test_log "Testing test type validation"

    local valid_types=("unit" "integration" "e2e" "performance" "security" "all")
    local errors=0

    for test_type in "${valid_types[@]}"; do
        if ! grep -q "\"$test_type\"" "$TEST_SCRIPT"; then
            test_fail "Test type '$test_type' not found in script"
            ((errors++))
        fi
    done

    if [[ $errors -eq 0 ]]; then
        test_pass "All test types are supported"
        return 0
    else
        test_fail "$errors test types are missing"
        return 1
    fi
}

test_environment_setup() {
    test_log "Testing environment setup"

    # Check if environment variables are properly set
    local env_vars=("NODE_ENV" "DATABASE_URL" "REDIS_URL" "JWT_SECRET")
    local missing_env=()

    for env_var in "${env_vars[@]}"; do
        if ! grep -q "$env_var=" "$TEST_SCRIPT"; then
            missing_env+=("$env_var")
        fi
    done

    if [[ ${#missing_env[@]} -eq 0 ]]; then
        test_pass "Environment setup is complete"
        return 0
    else
        test_fail "Missing environment variables: ${missing_env[*]}"
        return 1
    fi
}

test_directory_structure() {
    test_log "Testing directory structure requirements"

    local required_dirs=("test-results" "coverage" "test-reports" "test-artifacts")
    local missing_dirs=()

    for dir in "${required_dirs[@]}"; do
        if ! grep -q "\"$dir\"" "$TEST_SCRIPT"; then
            missing_dirs+=("$dir")
        fi
    done

    if [[ ${#missing_dirs[@]} -eq 0 ]]; then
        test_pass "All required directories are configured"
        return 0
    else
        test_fail "Missing directory configurations: ${missing_dirs[*]}"
        return 1
    fi
}

# ===================================
# Main Test Execution
# ===================================
main() {
    echo "============================================================"
    echo "🧪 Linux Test Script Validation"
    echo "============================================================"
    echo "📁 Project: $(basename "$PROJECT_ROOT")"
    echo "📋 Test script: $TEST_SCRIPT"
    echo "📝 Log file: $TEST_LOG"
    echo "🕒 Started: $(date)"
    echo "============================================================"

    # Setup logging
    mkdir -p "$(dirname "$TEST_LOG")"
    touch "$TEST_LOG"

    # Run tests
    local tests=(
        "test_script_exists"
        "test_script_executable"
        "test_script_syntax"
        "test_shebang"
        "test_required_functions"
        "test_configuration_variables"
        "test_help_option"
        "test_error_handling"
        "test_logging_functionality"
        "test_test_types"
        "test_environment_setup"
        "test_directory_structure"
    )

    for test_func in "${tests[@]}"; do
        echo ""
        test_log "Running: $test_func"
        echo "------------------------------------------------------------"

        ((total_tests++))

        if $test_func; then
            echo "✅ Test passed"
        else
            echo "❌ Test failed"
        fi
    done

    # Print summary
    echo ""
    echo "============================================================"
    echo "📊 Test Summary"
    echo "============================================================"
    echo "Total tests: $total_tests"
    echo "Passed: $passed_tests"
    echo "Failed: $failed_tests"
    echo "Success rate: $(( passed_tests * 100 / total_tests ))%"
    echo "🕒 Completed: $(date)"
    echo "📝 Log file: $TEST_LOG"
    echo "============================================================"

    if [[ $failed_tests -eq 0 ]]; then
        echo "🎉 All tests passed!"
        exit 0
    else
        echo "❌ Some tests failed!"
        exit 1
    fi
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
