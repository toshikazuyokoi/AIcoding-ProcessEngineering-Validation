#!/bin/bash

# ===================================
# Linux Deploy Script Test Suite
# ===================================
# Purpose: Comprehensive testing for scripts/linux/deploy.sh
# Author: Process Engineering Approach
# Version: 1.0.0

set -euo pipefail

# ===================================
# Test Configuration
# ===================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly DEPLOY_SCRIPT="${PROJECT_ROOT}/scripts/linux/deploy.sh"
readonly TEST_LOG_DIR="${PROJECT_ROOT}/logs/tests"
readonly TEST_LOG="${TEST_LOG_DIR}/test-linux-deploy-$(date +%Y%m%d-%H%M%S).log"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test configuration
readonly REQUIRED_FUNCTIONS=(
    "setup_logging"
    "log_info"
    "log_success"
    "log_warning"
    "log_error"
    "log_step"
    "log_deploy"
    "command_exists"
    "get_env_config"
    "generate_deployment_id"
    "validate_environment"
    "check_prerequisites"
    "create_backup"
    "backup_database"
    "backup_configuration"
    "cleanup_old_backups"
    "build_images"
    "execute_deployment"
    "execute_blue_green_deployment"
    "execute_rolling_deployment"
    "execute_recreate_deployment"
    "run_health_checks"
    "wait_for_services_health"
    "wait_for_service_health"
    "check_service_health"
    "get_service_port"
    "generate_deployment_report"
    "handle_deployment_failure"
    "cleanup_failed_deployment"
    "show_help"
    "parse_arguments"
    "main"
)

# ===================================
# Test Utilities
# ===================================
setup_test_logging() {
    mkdir -p "$TEST_LOG_DIR"
    exec 1> >(tee -a "$TEST_LOG")
    exec 2> >(tee -a "$TEST_LOG" >&2)
}

test_log() {
    echo -e "\033[35m🧪 $1\033[0m" | tee -a "$TEST_LOG"
}

test_pass() {
    echo -e "\033[32m✅ PASS: $1\033[0m" | tee -a "$TEST_LOG"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "\033[31m❌ FAIL: $1\033[0m" | tee -a "$TEST_LOG"
    ((TESTS_FAILED++))
}

test_info() {
    echo -e "\033[34mℹ️  INFO: $1\033[0m" | tee -a "$TEST_LOG"
}

run_test() {
    local test_name="$1"
    local test_function="$2"
    
    ((TESTS_RUN++))
    test_log "Running test: $test_name"
    
    if $test_function; then
        test_pass "$test_name"
    else
        test_fail "$test_name"
    fi
    
    echo ""
}

# ===================================
# Test Functions
# ===================================
test_script_exists() {
    [[ -f "$DEPLOY_SCRIPT" ]]
}

test_script_executable() {
    [[ -x "$DEPLOY_SCRIPT" ]]
}

test_script_syntax() {
    bash -n "$DEPLOY_SCRIPT" >/dev/null 2>&1
}

test_shebang() {
    local first_line=$(head -n1 "$DEPLOY_SCRIPT")
    [[ "$first_line" == "#!/bin/bash" ]]
}

test_required_functions() {
    local missing_functions=()
    
    for func in "${REQUIRED_FUNCTIONS[@]}"; do
        if ! grep -q "^${func}()" "$DEPLOY_SCRIPT"; then
            missing_functions+=("$func")
        fi
    done
    
    if [[ ${#missing_functions[@]} -eq 0 ]]; then
        return 0
    else
        test_info "Missing functions: ${missing_functions[*]}"
        return 1
    fi
}

test_help_option() {
    local output
    output=$("$DEPLOY_SCRIPT" --help 2>&1) || return 1
    
    [[ "$output" == *"Linux Deployment Script"* ]] && \
    [[ "$output" == *"USAGE:"* ]] && \
    [[ "$output" == *"ENVIRONMENTS:"* ]] && \
    [[ "$output" == *"OPTIONS:"* ]]
}

test_invalid_option() {
    local output
    output=$("$DEPLOY_SCRIPT" --invalid-option 2>&1) && return 1
    
    [[ "$output" == *"Unknown option"* ]]
}

test_invalid_environment() {
    local output
    output=$("$DEPLOY_SCRIPT" invalid-env --dry-run 2>&1) && return 1
    
    [[ "$output" == *"Unsupported environment"* ]]
}

test_invalid_strategy() {
    local output
    output=$("$DEPLOY_SCRIPT" development --strategy=invalid --dry-run 2>&1) && return 1
    
    [[ "$output" == *"Invalid deployment strategy"* ]]
}

test_dry_run_development() {
    local output
    output=$("$DEPLOY_SCRIPT" development --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Starting Linux deployment"* ]] && \
    [[ "$output" == *"DRY RUN"* ]]
}

test_dry_run_staging() {
    local output
    output=$("$DEPLOY_SCRIPT" staging --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Environment: staging"* ]] && \
    [[ "$output" == *"DRY RUN"* ]]
}

test_dry_run_production() {
    local output
    output=$("$DEPLOY_SCRIPT" production --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Environment: production"* ]] && \
    [[ "$output" == *"DRY RUN"* ]]
}

test_rolling_strategy() {
    local output
    output=$("$DEPLOY_SCRIPT" development --strategy=rolling --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Strategy: rolling"* ]]
}

test_blue_green_strategy() {
    local output
    output=$("$DEPLOY_SCRIPT" development --strategy=blue-green --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Strategy: blue-green"* ]]
}

test_recreate_strategy() {
    local output
    output=$("$DEPLOY_SCRIPT" development --strategy=recreate --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Strategy: recreate"* ]]
}

test_skip_backup_option() {
    local output
    output=$("$DEPLOY_SCRIPT" development --skip-backup --dry-run 2>&1) || return 1
    
    [[ "$output" == *"skip_backup=true"* ]]
}

test_skip_health_check_option() {
    local output
    output=$("$DEPLOY_SCRIPT" development --skip-health-check --dry-run 2>&1) || return 1
    
    [[ "$output" == *"skip_health_check=true"* ]]
}

test_verbose_option() {
    local output
    output=$("$DEPLOY_SCRIPT" development --verbose --dry-run 2>&1) || return 1
    
    [[ "$output" == *"verbose=true"* ]]
}

test_force_option() {
    local output
    output=$("$DEPLOY_SCRIPT" development --force --dry-run 2>&1) || return 1
    
    [[ "$output" == *"force=true"* ]]
}

test_deployment_id_generation() {
    # Source the script to test internal functions
    source "$DEPLOY_SCRIPT"
    
    local id1=$(generate_deployment_id)
    local id2=$(generate_deployment_id)
    
    [[ "$id1" =~ ^deploy-[0-9]{8}-[0-9]{6}-[a-f0-9]{6}$ ]] && \
    [[ "$id2" =~ ^deploy-[0-9]{8}-[0-9]{6}-[a-f0-9]{6}$ ]] && \
    [[ "$id1" != "$id2" ]]
}

test_env_config_parsing() {
    # Source the script to test internal functions
    source "$DEPLOY_SCRIPT"
    
    local compose_file=$(get_env_config "development" "compose_file")
    local env_file=$(get_env_config "development" "env_file")
    local timeout=$(get_env_config "development" "timeout")
    local services=$(get_env_config "development" "services")
    
    [[ "$compose_file" == "docker-compose.dev.yml" ]] && \
    [[ "$env_file" == ".env.dev" ]] && \
    [[ "$timeout" == "120" ]] && \
    [[ "$services" == "postgres,redis,backend,frontend" ]]
}

test_service_port_mapping() {
    # Source the script to test internal functions
    source "$DEPLOY_SCRIPT"
    
    local backend_port=$(get_service_port "backend")
    local frontend_port=$(get_service_port "frontend")
    local nginx_port=$(get_service_port "nginx")
    local unknown_port=$(get_service_port "unknown")
    
    [[ "$backend_port" == "3000" ]] && \
    [[ "$frontend_port" == "8000" ]] && \
    [[ "$nginx_port" == "80" ]] && \
    [[ "$unknown_port" == "" ]]
}

test_logging_functions() {
    # Source the script to test internal functions
    source "$DEPLOY_SCRIPT"
    
    # Test that logging functions exist and can be called
    log_info "Test info message" >/dev/null 2>&1 && \
    log_success "Test success message" >/dev/null 2>&1 && \
    log_warning "Test warning message" >/dev/null 2>&1 && \
    log_error "Test error message" >/dev/null 2>&1 && \
    log_step "1/1" "Test step message" >/dev/null 2>&1 && \
    log_deploy "Test deploy message" >/dev/null 2>&1
}

test_command_exists_function() {
    # Source the script to test internal functions
    source "$DEPLOY_SCRIPT"
    
    command_exists "bash" && \
    command_exists "echo" && \
    ! command_exists "nonexistent-command-12345"
}

# ===================================
# Integration Tests
# ===================================
test_full_dry_run_development() {
    local output
    output=$("$DEPLOY_SCRIPT" development --dry-run --verbose 2>&1) || return 1
    
    # Check for all expected steps
    [[ "$output" == *"STEP 1/7"* ]] && \
    [[ "$output" == *"STEP 2/7"* ]] && \
    [[ "$output" == *"STEP 3/7"* ]] && \
    [[ "$output" == *"STEP 4/7"* ]] && \
    [[ "$output" == *"STEP 5/7"* ]] && \
    [[ "$output" == *"STEP 6/7"* ]] && \
    [[ "$output" == *"STEP 7/7"* ]] && \
    [[ "$output" == *"Deployment completed successfully"* ]]
}

test_full_dry_run_with_all_options() {
    local output
    output=$("$DEPLOY_SCRIPT" staging --strategy=blue-green --skip-backup --skip-health-check --verbose --dry-run --force 2>&1) || return 1
    
    [[ "$output" == *"Environment: staging"* ]] && \
    [[ "$output" == *"Strategy: blue-green"* ]] && \
    [[ "$output" == *"skip_backup=true"* ]] && \
    [[ "$output" == *"skip_health_check=true"* ]] && \
    [[ "$output" == *"verbose=true"* ]] && \
    [[ "$output" == *"dry_run=true"* ]] && \
    [[ "$output" == *"force=true"* ]]
}

# ===================================
# Performance Tests
# ===================================
test_script_performance() {
    local start_time=$(date +%s%N)
    "$DEPLOY_SCRIPT" development --dry-run >/dev/null 2>&1 || return 1
    local end_time=$(date +%s%N)
    
    local duration_ms=$(( (end_time - start_time) / 1000000 ))
    test_info "Script execution time: ${duration_ms}ms"
    
    # Should complete within 10 seconds for dry run
    [[ $duration_ms -lt 10000 ]]
}

# ===================================
# Main Test Execution
# ===================================
main() {
    echo "============================================================"
    echo "🧪 Linux Deploy Script Test Suite"
    echo "============================================================"
    echo "Script: $DEPLOY_SCRIPT"
    echo "Log: $TEST_LOG"
    echo ""
    
    setup_test_logging
    
    # Basic tests
    run_test "Script exists" test_script_exists
    run_test "Script is executable" test_script_executable
    run_test "Script syntax is valid" test_script_syntax
    run_test "Shebang is correct" test_shebang
    run_test "Required functions exist" test_required_functions
    
    # Help and error handling tests
    run_test "Help option works" test_help_option
    run_test "Invalid option handling" test_invalid_option
    run_test "Invalid environment handling" test_invalid_environment
    run_test "Invalid strategy handling" test_invalid_strategy
    
    # Dry run tests
    run_test "Dry run development" test_dry_run_development
    run_test "Dry run staging" test_dry_run_staging
    run_test "Dry run production" test_dry_run_production
    
    # Strategy tests
    run_test "Rolling strategy" test_rolling_strategy
    run_test "Blue-green strategy" test_blue_green_strategy
    run_test "Recreate strategy" test_recreate_strategy
    
    # Option tests
    run_test "Skip backup option" test_skip_backup_option
    run_test "Skip health check option" test_skip_health_check_option
    run_test "Verbose option" test_verbose_option
    run_test "Force option" test_force_option
    
    # Function tests
    run_test "Deployment ID generation" test_deployment_id_generation
    run_test "Environment config parsing" test_env_config_parsing
    run_test "Service port mapping" test_service_port_mapping
    run_test "Logging functions" test_logging_functions
    run_test "Command exists function" test_command_exists_function
    
    # Integration tests
    run_test "Full dry run development" test_full_dry_run_development
    run_test "Full dry run with all options" test_full_dry_run_with_all_options
    
    # Performance tests
    run_test "Script performance" test_script_performance
    
    # Test summary
    echo "============================================================"
    echo "📊 Test Results Summary"
    echo "============================================================"
    echo "Tests Run: $TESTS_RUN"
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Success Rate: $(( TESTS_PASSED * 100 / TESTS_RUN ))%"
    echo ""
    echo "Log file: $TEST_LOG"
    echo ""
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "\033[32m🎉 All tests passed!\033[0m"
        exit 0
    else
        echo -e "\033[31m❌ Some tests failed!\033[0m"
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
