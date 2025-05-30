#!/bin/bash

# ===================================
# Linux Backup Script Test Suite
# ===================================
# Purpose: Comprehensive testing for scripts/linux/backup.sh
# Author: Process Engineering Approach
# Version: 1.0.0

set -euo pipefail

# ===================================
# Test Configuration
# ===================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly BACKUP_SCRIPT="${PROJECT_ROOT}/scripts/linux/backup.sh"
readonly TEST_LOG_DIR="${PROJECT_ROOT}/logs/tests"
readonly TEST_LOG="${TEST_LOG_DIR}/test-linux-backup-$(date +%Y%m%d-%H%M%S).log"

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
    "log_backup"
    "command_exists"
    "generate_backup_id"
    "get_backup_dir"
    "calculate_checksum"
    "validate_backup_configuration"
    "check_prerequisites"
    "prepare_backup_directory"
    "backup_database"
    "backup_postgresql"
    "backup_redis"
    "backup_configuration_files"
    "backup_application_files"
    "backup_logs"
    "compress_backup"
    "encrypt_backup"
    "verify_backup"
    "cleanup_old_backups"
    "cleanup_backups_by_age"
    "update_manifest_file"
    "generate_backup_report"
    "handle_backup_failure"
    "cleanup_failed_backup"
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
    [[ -f "$BACKUP_SCRIPT" ]]
}

test_script_executable() {
    [[ -x "$BACKUP_SCRIPT" ]]
}

test_script_syntax() {
    bash -n "$BACKUP_SCRIPT" >/dev/null 2>&1
}

test_shebang() {
    local first_line=$(head -n1 "$BACKUP_SCRIPT")
    [[ "$first_line" == "#!/bin/bash" ]]
}

test_required_functions() {
    local missing_functions=()
    
    for func in "${REQUIRED_FUNCTIONS[@]}"; do
        if ! grep -q "^${func}()" "$BACKUP_SCRIPT"; then
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
    output=$("$BACKUP_SCRIPT" --help 2>&1) || return 1
    
    [[ "$output" == *"Linux Backup Script"* ]] && \
    [[ "$output" == *"USAGE:"* ]] && \
    [[ "$output" == *"ENVIRONMENTS:"* ]] && \
    [[ "$output" == *"BACKUP TYPES:"* ]] && \
    [[ "$output" == *"OPTIONS:"* ]]
}

test_invalid_option() {
    local output
    output=$("$BACKUP_SCRIPT" --invalid-option 2>&1) && return 1
    
    [[ "$output" == *"Unknown option"* ]]
}

test_invalid_environment() {
    local output
    output=$("$BACKUP_SCRIPT" invalid-env --dry-run 2>&1) && return 1
    
    [[ "$output" == *"Unsupported environment"* ]]
}

test_invalid_backup_type() {
    local output
    output=$("$BACKUP_SCRIPT" development invalid-type --dry-run 2>&1) && return 1
    
    [[ "$output" == *"Invalid backup type"* ]]
}

test_dry_run_development() {
    local output
    output=$("$BACKUP_SCRIPT" development --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Starting Linux backup"* ]] && \
    [[ "$output" == *"DRY RUN"* ]]
}

test_dry_run_staging() {
    local output
    output=$("$BACKUP_SCRIPT" staging --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Environment: staging"* ]] && \
    [[ "$output" == *"DRY RUN"* ]]
}

test_dry_run_production() {
    local output
    output=$("$BACKUP_SCRIPT" production --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Environment: production"* ]] && \
    [[ "$output" == *"DRY RUN"* ]]
}

test_full_backup_type() {
    local output
    output=$("$BACKUP_SCRIPT" development full --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Backup Type: full"* ]]
}

test_incremental_backup_type() {
    local output
    output=$("$BACKUP_SCRIPT" development incremental --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Backup Type: incremental"* ]]
}

test_differential_backup_type() {
    local output
    output=$("$BACKUP_SCRIPT" development differential --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Backup Type: differential"* ]]
}

test_compress_option() {
    local output
    output=$("$BACKUP_SCRIPT" development --compress --dry-run 2>&1) || return 1
    
    [[ "$output" == *"compress=true"* ]]
}

test_no_compress_option() {
    local output
    output=$("$BACKUP_SCRIPT" development --no-compress --dry-run 2>&1) || return 1
    
    [[ "$output" == *"compress=false"* ]]
}

test_encrypt_option() {
    local output
    output=$("$BACKUP_SCRIPT" development --encrypt --dry-run 2>&1) || return 1
    
    [[ "$output" == *"encrypt=true"* ]]
}

test_no_encrypt_option() {
    local output
    output=$("$BACKUP_SCRIPT" development --no-encrypt --dry-run 2>&1) || return 1
    
    [[ "$output" == *"encrypt=false"* ]]
}

test_verify_option() {
    local output
    output=$("$BACKUP_SCRIPT" development --verify --dry-run 2>&1) || return 1
    
    [[ "$output" == *"verify=true"* ]]
}

test_no_verify_option() {
    local output
    output=$("$BACKUP_SCRIPT" development --no-verify --dry-run 2>&1) || return 1
    
    [[ "$output" == *"verify=false"* ]]
}

test_verbose_option() {
    local output
    output=$("$BACKUP_SCRIPT" development --verbose --dry-run 2>&1) || return 1
    
    [[ "$output" == *"verbose=true"* ]]
}

test_backup_id_generation() {
    # Source the script to test internal functions
    source "$BACKUP_SCRIPT"
    
    local id1=$(generate_backup_id)
    local id2=$(generate_backup_id)
    
    [[ "$id1" =~ ^backup-[0-9]{8}-[0-9]{6}-[a-f0-9]{6}$ ]] && \
    [[ "$id2" =~ ^backup-[0-9]{8}-[0-9]{6}-[a-f0-9]{6}$ ]] && \
    [[ "$id1" != "$id2" ]]
}

test_backup_dir_function() {
    # Source the script to test internal functions
    source "$BACKUP_SCRIPT"
    
    local backup_id="backup-20250530-120000-abc123"
    local backup_dir=$(get_backup_dir "$backup_id")
    
    [[ "$backup_dir" == *"/backups/$backup_id" ]]
}

test_checksum_calculation() {
    # Source the script to test internal functions
    source "$BACKUP_SCRIPT"
    
    # Create a test file
    local test_file="/tmp/test_checksum_$$"
    echo "test content" > "$test_file"
    
    local checksum=$(calculate_checksum "$test_file")
    
    # Cleanup
    rm -f "$test_file"
    
    [[ -n "$checksum" ]] && [[ ${#checksum} -ge 32 ]]
}

test_logging_functions() {
    # Source the script to test internal functions
    source "$BACKUP_SCRIPT"
    
    # Test that logging functions exist and can be called
    log_info "Test info message" >/dev/null 2>&1 && \
    log_success "Test success message" >/dev/null 2>&1 && \
    log_warning "Test warning message" >/dev/null 2>&1 && \
    log_error "Test error message" >/dev/null 2>&1 && \
    log_step "1/10" "Test step message" >/dev/null 2>&1 && \
    log_backup "Test backup message" >/dev/null 2>&1
}

test_command_exists_function() {
    # Source the script to test internal functions
    source "$BACKUP_SCRIPT"
    
    command_exists "bash" && \
    command_exists "echo" && \
    ! command_exists "nonexistent-command-12345"
}

# ===================================
# Integration Tests
# ===================================
test_full_dry_run_development() {
    local output
    output=$("$BACKUP_SCRIPT" development --dry-run --verbose 2>&1) || return 1
    
    # Check for all expected steps
    [[ "$output" == *"STEP 1/10"* ]] && \
    [[ "$output" == *"STEP 2/10"* ]] && \
    [[ "$output" == *"STEP 3/10"* ]] && \
    [[ "$output" == *"STEP 4/10"* ]] && \
    [[ "$output" == *"STEP 5/10"* ]] && \
    [[ "$output" == *"STEP 6/10"* ]] && \
    [[ "$output" == *"STEP 7/10"* ]] && \
    [[ "$output" == *"STEP 8/10"* ]] && \
    [[ "$output" == *"STEP 9/10"* ]] && \
    [[ "$output" == *"STEP 10/10"* ]] && \
    [[ "$output" == *"Backup completed successfully"* ]]
}

test_full_dry_run_with_all_options() {
    local output
    output=$("$BACKUP_SCRIPT" staging incremental --encrypt --no-compress --no-verify --verbose --dry-run 2>&1) || return 1
    
    [[ "$output" == *"Environment: staging"* ]] && \
    [[ "$output" == *"Backup Type: incremental"* ]] && \
    [[ "$output" == *"encrypt=true"* ]] && \
    [[ "$output" == *"compress=false"* ]] && \
    [[ "$output" == *"verify=false"* ]] && \
    [[ "$output" == *"verbose=true"* ]] && \
    [[ "$output" == *"dry_run=true"* ]]
}

# ===================================
# Performance Tests
# ===================================
test_script_performance() {
    local start_time=$(date +%s%N)
    "$BACKUP_SCRIPT" development --dry-run >/dev/null 2>&1 || return 1
    local end_time=$(date +%s%N)
    
    local duration_ms=$(( (end_time - start_time) / 1000000 ))
    test_info "Script execution time: ${duration_ms}ms"
    
    # Should complete within 15 seconds for dry run
    [[ $duration_ms -lt 15000 ]]
}

# ===================================
# Main Test Execution
# ===================================
main() {
    echo "============================================================"
    echo "🧪 Linux Backup Script Test Suite"
    echo "============================================================"
    echo "Script: $BACKUP_SCRIPT"
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
    run_test "Invalid backup type handling" test_invalid_backup_type
    
    # Dry run tests
    run_test "Dry run development" test_dry_run_development
    run_test "Dry run staging" test_dry_run_staging
    run_test "Dry run production" test_dry_run_production
    
    # Backup type tests
    run_test "Full backup type" test_full_backup_type
    run_test "Incremental backup type" test_incremental_backup_type
    run_test "Differential backup type" test_differential_backup_type
    
    # Option tests
    run_test "Compress option" test_compress_option
    run_test "No compress option" test_no_compress_option
    run_test "Encrypt option" test_encrypt_option
    run_test "No encrypt option" test_no_encrypt_option
    run_test "Verify option" test_verify_option
    run_test "No verify option" test_no_verify_option
    run_test "Verbose option" test_verbose_option
    
    # Function tests
    run_test "Backup ID generation" test_backup_id_generation
    run_test "Backup directory function" test_backup_dir_function
    run_test "Checksum calculation" test_checksum_calculation
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
