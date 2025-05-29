#!/bin/bash

# ===================================
# Task Management System - Simple Linux Test Script Validation
# ===================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TEST_SCRIPT="${SCRIPT_DIR}/run-tests.sh"

# Test counters
total_tests=0
passed_tests=0
failed_tests=0

# Test utilities
test_pass() {
    echo -e "\033[32m✅ PASS: $1\033[0m"
    ((passed_tests++))
}

test_fail() {
    echo -e "\033[31m❌ FAIL: $1\033[0m"
    ((failed_tests++))
}

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\033[35m🧪 Testing: $test_name\033[0m"
    ((total_tests++))
    
    if eval "$test_command"; then
        test_pass "$test_name"
    else
        test_fail "$test_name"
    fi
}

# Run tests
echo "============================================================"
echo "🧪 Linux Test Script Simple Validation"
echo "============================================================"

# Test 1: Script exists
run_test "Script exists" "[[ -f '$TEST_SCRIPT' ]]"

# Test 2: Script is executable
run_test "Script is executable" "[[ -x '$TEST_SCRIPT' ]]"

# Test 3: Script syntax is valid
run_test "Script syntax is valid" "bash -n '$TEST_SCRIPT'"

# Test 4: Shebang is correct
run_test "Shebang is correct" "[[ \$(head -n1 '$TEST_SCRIPT') == '#!/bin/bash' ]]"

# Test 5: Help option works
run_test "Help option works" "'$TEST_SCRIPT' --help >/dev/null 2>&1"

# Test 6: Error handling for invalid test type
run_test "Error handling works" "! '$TEST_SCRIPT' invalid_test_type >/dev/null 2>&1"

# Test 7: Required functions exist
run_test "Main function exists" "grep -q '^main()' '$TEST_SCRIPT'"

# Test 8: Configuration variables exist
run_test "Configuration variables exist" "grep -q 'readonly.*=' '$TEST_SCRIPT'"

# Test 9: Test types are defined
run_test "Test types are defined" "grep -q 'TEST_TYPES=' '$TEST_SCRIPT'"

# Test 10: Logging functions exist
run_test "Logging functions exist" "grep -q 'log_info()' '$TEST_SCRIPT'"

# Print summary
echo ""
echo "============================================================"
echo "📊 Test Summary"
echo "============================================================"
echo "Total tests: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $failed_tests"

if [[ $total_tests -gt 0 ]]; then
    echo "Success rate: $(( passed_tests * 100 / total_tests ))%"
fi

echo "🕒 Completed: $(date)"
echo "============================================================"

if [[ $failed_tests -eq 0 ]]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "❌ Some tests failed!"
    exit 1
fi
