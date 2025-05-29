#!/bin/bash

# ===================================
# Task Management System - Simple Linux Setup Script Test
# ===================================

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SETUP_SCRIPT="${SCRIPT_DIR}/setup-dev.sh"

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
echo "🧪 Linux Setup Script Simple Validation"
echo "============================================================"

# Test 1: Script exists
run_test "Script exists" "[[ -f '$SETUP_SCRIPT' ]]"

# Test 2: Script is executable
run_test "Script is executable" "[[ -x '$SETUP_SCRIPT' ]]"

# Test 3: Script syntax is valid
run_test "Script syntax is valid" "bash -n '$SETUP_SCRIPT'"

# Test 4: Shebang is correct
run_test "Shebang is correct" "[[ \$(head -n1 '$SETUP_SCRIPT') == '#!/bin/bash' ]]"

# Test 5: Help option works
run_test "Help option works" "'$SETUP_SCRIPT' --help >/dev/null 2>&1"

# Test 6: Required functions exist
run_test "log_info function exists" "grep -q '^log_info()' '$SETUP_SCRIPT'"
run_test "command_exists function exists" "grep -q '^command_exists()' '$SETUP_SCRIPT'"
run_test "version_gte function exists" "grep -q '^version_gte()' '$SETUP_SCRIPT'"
run_test "main function exists" "grep -q '^main()' '$SETUP_SCRIPT'"

# Test 7: Configuration variables exist
run_test "NODE_VERSION variable exists" "grep -q 'readonly NODE_VERSION=' '$SETUP_SCRIPT'"
run_test "REQUIRED_PACKAGES variable exists" "grep -q 'readonly REQUIRED_PACKAGES=' '$SETUP_SCRIPT'"
run_test "REQUIRED_PORTS variable exists" "grep -q 'readonly REQUIRED_PORTS=' '$SETUP_SCRIPT'"

# Test 8: Error handling
run_test "Error handling enabled" "grep -q 'set -euo pipefail' '$SETUP_SCRIPT'"

# Print summary
echo ""
echo "============================================================"
echo "📊 Test Results Summary"
echo "============================================================"
echo ""
echo "📈 Results:"
echo "  ✅ Passed: $passed_tests"
echo "  ❌ Failed: $failed_tests"
echo "  📊 Total:  $total_tests"

success_rate=0
if [[ $total_tests -gt 0 ]]; then
    success_rate=$(( (passed_tests * 100) / total_tests ))
fi

echo "  📊 Success Rate: ${success_rate}%"

if [[ $failed_tests -eq 0 ]]; then
    echo ""
    echo "🎉 All tests passed!"
    exit 0
else
    echo ""
    echo "⚠️  $failed_tests test(s) failed"
    exit 1
fi
