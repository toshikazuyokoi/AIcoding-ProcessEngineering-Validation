#!/bin/bash

# ===================================
# Task Management System - Linux Setup Script Validation
# ===================================
# Generated for TSK-024-SCR-setup-linux
# Project: Task Management System
# Component: Linux Setup Script Testing
# Purpose: Test and validate the Linux development environment setup script

set -euo pipefail

# ===================================
# Configuration
# ===================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly SETUP_SCRIPT="${SCRIPT_DIR}/setup-dev.sh"
readonly TEST_LOG="${PROJECT_ROOT}/logs/test-setup-dev-$(date +%Y%m%d-%H%M%S).log"

# Test configuration
readonly REQUIRED_FUNCTIONS=(
    "log_info"
    "log_success"
    "log_warning"
    "log_error"
    "log_step"
    "command_exists"
    "get_version"
    "version_gte"
    "is_port_available"
    "detect_linux_distribution"
    "check_system_requirements"
    "install_system_packages"
    "install_nodejs"
    "install_docker"
    "check_ports"
    "setup_directories"
    "setup_environment_files"
    "install_dependencies"
    "verify_setup"
    "print_summary"
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
}

test_fail() {
    echo -e "\033[31m❌ FAIL: $1\033[0m" | tee -a "${TEST_LOG}"
}

test_skip() {
    echo -e "\033[33m⏭️  SKIP: $1\033[0m" | tee -a "${TEST_LOG}"
}

# ===================================
# Test Functions
# ===================================
test_script_exists() {
    test_log "Testing script existence"

    if [[ -f "$SETUP_SCRIPT" ]]; then
        test_pass "Setup script exists: $SETUP_SCRIPT"
        return 0
    else
        test_fail "Setup script not found: $SETUP_SCRIPT"
        return 1
    fi
}

test_script_executable() {
    test_log "Testing script permissions"

    if [[ -x "$SETUP_SCRIPT" ]]; then
        test_pass "Setup script is executable"
        return 0
    else
        test_fail "Setup script is not executable"
        return 1
    fi
}

test_script_syntax() {
    test_log "Testing script syntax"

    if bash -n "$SETUP_SCRIPT"; then
        test_pass "Script syntax is valid"
        return 0
    else
        test_fail "Script syntax is invalid"
        return 1
    fi
}

test_shebang() {
    test_log "Testing shebang"

    local first_line
    first_line=$(head -n1 "$SETUP_SCRIPT")

    if [[ "$first_line" == "#!/bin/bash" ]]; then
        test_pass "Correct shebang: $first_line"
        return 0
    else
        test_fail "Incorrect shebang: $first_line"
        return 1
    fi
}

test_required_functions() {
    test_log "Testing required functions"

    local missing_functions=()

    for func in "${REQUIRED_FUNCTIONS[@]}"; do
        if grep -q "^${func}()" "$SETUP_SCRIPT"; then
            test_pass "Function exists: $func"
        else
            test_fail "Function missing: $func"
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
        "NODE_VERSION"
        "NPM_VERSION"
        "DOCKER_MIN_VERSION"
        "DOCKER_COMPOSE_MIN_VERSION"
        "REQUIRED_PACKAGES"
        "REQUIRED_PORTS"
        "ENV_FILES"
        "DIRECTORIES"
    )

    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if grep -q "readonly ${var}=" "$SETUP_SCRIPT"; then
            test_pass "Variable exists: $var"
        else
            test_fail "Variable missing: $var"
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -eq 0 ]]; then
        test_pass "All required configuration variables are present"
        return 0
    else
        test_fail "Missing variables: ${missing_vars[*]}"
        return 1
    fi
}

test_help_option() {
    test_log "Testing help option"

    # Test --help flag
    if "$SETUP_SCRIPT" --help >/dev/null 2>&1; then
        test_pass "Help option works"
        return 0
    else
        test_fail "Help option failed"
        return 1
    fi
}

test_error_handling() {
    test_log "Testing error handling"

    # Check for set -euo pipefail
    if grep -q "set -euo pipefail" "$SETUP_SCRIPT"; then
        test_pass "Error handling enabled (set -euo pipefail)"
    else
        test_fail "Error handling not enabled"
        return 1
    fi

    # Check for error exit codes
    if grep -q "exit 1" "$SETUP_SCRIPT"; then
        test_pass "Error exit codes present"
    else
        test_fail "Error exit codes missing"
        return 1
    fi

    return 0
}

test_logging_functionality() {
    test_log "Testing logging functionality"

    # Test if logging functions are defined in the script
    if grep -q "^log_info()" "$SETUP_SCRIPT"; then
        test_pass "log_info function is defined"
    else
        test_fail "log_info function not defined"
        return 1
    fi

    if grep -q "^log_success()" "$SETUP_SCRIPT"; then
        test_pass "log_success function is defined"
    else
        test_fail "log_success function not defined"
        return 1
    fi

    return 0
}

test_version_comparison() {
    test_log "Testing version comparison"

    # Test if version_gte function is defined in the script
    if grep -q "^version_gte()" "$SETUP_SCRIPT"; then
        test_pass "version_gte function is defined"
    else
        test_fail "version_gte function not defined"
        return 1
    fi

    # Test if the function uses sort -V for version comparison
    if grep -q "sort -V" "$SETUP_SCRIPT"; then
        test_pass "Version comparison uses sort -V"
    else
        test_fail "Version comparison doesn't use sort -V"
        return 1
    fi

    return 0
}

test_command_detection() {
    test_log "Testing command detection"

    # Test if command_exists function is defined in the script
    if grep -q "^command_exists()" "$SETUP_SCRIPT"; then
        test_pass "command_exists function is defined"
    else
        test_fail "command_exists function not defined"
        return 1
    fi

    # Test if the function uses command -v
    if grep -q "command -v" "$SETUP_SCRIPT"; then
        test_pass "Command detection uses 'command -v'"
    else
        test_fail "Command detection doesn't use 'command -v'"
        return 1
    fi

    return 0
}

test_port_checking() {
    test_log "Testing port checking"

    # Test if is_port_available function is defined in the script
    if grep -q "^is_port_available()" "$SETUP_SCRIPT"; then
        test_pass "is_port_available function is defined"
    else
        test_fail "is_port_available function not defined"
        return 1
    fi

    # Test if the function uses netstat
    if grep -q "netstat" "$SETUP_SCRIPT"; then
        test_pass "Port checking uses netstat"
    else
        test_fail "Port checking doesn't use netstat"
        return 1
    fi

    return 0
}

test_directory_structure() {
    test_log "Testing directory structure requirements"

    # Check if script expects correct project structure
    if grep -q "PROJECT_ROOT" "$SETUP_SCRIPT"; then
        test_pass "Script uses PROJECT_ROOT variable"
    else
        test_fail "Script doesn't use PROJECT_ROOT variable"
        return 1
    fi

    # Check if script handles relative paths correctly
    if grep -q "cd.*PROJECT_ROOT" "$SETUP_SCRIPT"; then
        test_pass "Script changes to project root directory"
    else
        test_fail "Script doesn't change to project root directory"
        return 1
    fi

    return 0
}

# ===================================
# Test Runner
# ===================================
run_all_tests() {
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    local start_time
    start_time=$(date +%s)

    echo ""
    echo "============================================================"
    test_log "🧪 Linux Setup Script Validation Suite"
    echo "============================================================"

    # Setup test logging
    mkdir -p "$(dirname "${TEST_LOG}")"
    touch "${TEST_LOG}"
    test_log "Test started at $(date)"
    test_log "Setup script: $SETUP_SCRIPT"
    test_log "Test log: $TEST_LOG"

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
        "test_version_comparison"
        "test_command_detection"
        "test_port_checking"
        "test_directory_structure"
    )

    for test_func in "${tests[@]}"; do
        echo ""
        test_log "Running: $test_func"
        echo "------------------------------------------------------------"

        ((total_tests++))

        if $test_func; then
            ((passed_tests++))
        else
            ((failed_tests++))
        fi
    done

    # Print summary
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo ""
    echo "============================================================"
    test_log "📊 Test Results Summary"
    echo "============================================================"

    echo ""
    echo "📈 Results:"
    echo "  ✅ Passed: $passed_tests"
    echo "  ❌ Failed: $failed_tests"
    echo "  📊 Total:  $total_tests"
    echo "  ⏱️  Duration: ${duration}s"

    local success_rate=0
    if [[ $total_tests -gt 0 ]]; then
        success_rate=$(( (passed_tests * 100) / total_tests ))
    fi

    echo "  📊 Success Rate: ${success_rate}%"

    if [[ $failed_tests -eq 0 ]]; then
        echo ""
        test_pass "🎉 All tests passed!"
    else
        echo ""
        test_fail "⚠️  $failed_tests test(s) failed"
    fi

    echo ""
    echo "📁 Test log: $TEST_LOG"
    echo "============================================================"

    # Exit with appropriate code
    if [[ $failed_tests -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
}

# ===================================
# Main Execution
# ===================================
main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                echo "Linux Setup Script Validation Suite"
                echo ""
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --help, -h     Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0             # Run all validation tests"
                exit 0
                ;;
            *)
                test_fail "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    run_all_tests
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
