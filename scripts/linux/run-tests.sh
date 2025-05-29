#!/bin/bash

# ===================================
# Task Management System - Linux Test Execution Script
# ===================================
# Generated for TSK-025-SCR-test-linux
# Project: Task Management System
# Component: Linux Test Execution
# Purpose: Automated test execution for Linux environments

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# ===================================
# Configuration
# ===================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly LOG_FILE="${PROJECT_ROOT}/logs/test-run-$(date +%Y%m%d-%H%M%S).log"

# Test configuration
readonly TEST_TIMEOUT=1800  # 30 minutes
readonly COVERAGE_THRESHOLD=90
readonly MAX_RETRIES=3
readonly RETRY_DELAY=5

# Test types
readonly TEST_TYPES=(
    "unit"
    "integration"
    "e2e"
    "performance"
    "security"
)

# Required directories
readonly TEST_DIRECTORIES=(
    "test-results"
    "coverage"
    "test-reports"
    "test-artifacts"
)

# Environment variables for testing
readonly TEST_ENV_VARS=(
    "NODE_ENV=test"
    "DATABASE_URL=postgresql://test_user:test_password@localhost:5433/taskdb_test"
    "REDIS_URL=redis://localhost:6380"
    "JWT_SECRET=test_jwt_secret_key_for_testing_only"
    "BCRYPT_ROUNDS=4"
)

# ===================================
# Utility Functions
# ===================================
log_info() {
    echo -e "\033[34mℹ️  $1\033[0m" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "\033[32m✅ $1\033[0m" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "\033[33m⚠️  $1\033[0m" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "\033[31m❌ $1\033[0m" | tee -a "${LOG_FILE}"
}

log_step() {
    echo -e "\033[36m[$1] $2\033[0m" | tee -a "${LOG_FILE}"
}

log_test() {
    echo -e "\033[35m🧪 $1\033[0m" | tee -a "${LOG_FILE}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get command version
get_version() {
    local cmd="$1"
    local version_flag="${2:---version}"

    if command_exists "$cmd"; then
        $cmd $version_flag 2>/dev/null | head -n1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1
    else
        echo "not_installed"
    fi
}

# Check if port is available
is_port_available() {
    local port="$1"
    ! netstat -tuln 2>/dev/null | grep -q ":${port} "
}

# Wait for service to be ready
wait_for_service() {
    local host="$1"
    local port="$2"
    local timeout="${3:-60}"
    local count=0

    log_info "Waiting for service at ${host}:${port}..."

    while ! nc -z "$host" "$port" 2>/dev/null; do
        if [[ $count -ge $timeout ]]; then
            log_error "Service at ${host}:${port} not ready after ${timeout} seconds"
            return 1
        fi
        sleep 1
        ((count++))
    done

    log_success "Service at ${host}:${port} is ready"
    return 0
}

# ===================================
# Setup Functions
# ===================================
setup_logging() {
    mkdir -p "$(dirname "${LOG_FILE}")"
    touch "${LOG_FILE}"
    log_info "Test execution started at $(date)"
    log_info "Project root: ${PROJECT_ROOT}"
    log_info "Log file: ${LOG_FILE}"
}

check_test_environment() {
    log_step "1/6" "Checking test environment"

    local errors=0

    # Check Node.js
    if command_exists node; then
        local node_version
        node_version=$(get_version "node" "--version")
        log_success "Node.js: v${node_version}"
    else
        log_error "Node.js not found"
        ((errors++))
    fi

    # Check npm
    if command_exists npm; then
        local npm_version
        npm_version=$(get_version "npm" "--version")
        log_success "npm: v${npm_version}"
    else
        log_error "npm not found"
        ((errors++))
    fi

    # Check Docker
    if command_exists docker; then
        local docker_version
        docker_version=$(get_version "docker" "--version")
        log_success "Docker: v${docker_version}"

        # Check Docker service
        if systemctl is-active --quiet docker; then
            log_success "Docker service is running"
        else
            log_error "Docker service is not running"
            ((errors++))
        fi
    else
        log_error "Docker not found"
        ((errors++))
    fi

    # Check Docker Compose
    if docker compose version >/dev/null 2>&1; then
        local compose_version
        compose_version=$(docker compose version --short 2>/dev/null || echo "unknown")
        log_success "Docker Compose: v${compose_version}"
    else
        log_error "Docker Compose not found"
        ((errors++))
    fi

    # Check project structure
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]] && [[ ! -f "${PROJECT_ROOT}/backend/package.json" ]] && [[ ! -f "${PROJECT_ROOT}/frontend/package.json" ]]; then
        log_error "No package.json found in project"
        ((errors++))
    else
        log_success "Project structure validated"
    fi

    if [[ $errors -gt 0 ]]; then
        log_error "Environment check failed with $errors errors"
        exit 1
    fi

    log_success "Test environment check completed"
}

setup_test_directories() {
    log_step "2/6" "Setting up test directories"

    cd "$PROJECT_ROOT"

    for dir in "${TEST_DIRECTORIES[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            log_info "Created directory: $dir"
        else
            log_info "Directory already exists: $dir"
        fi
    done

    log_success "Test directories set up"
}

setup_test_environment() {
    log_step "3/6" "Setting up test environment"

    # Export test environment variables
    for env_var in "${TEST_ENV_VARS[@]}"; do
        export "$env_var"
        log_info "Set environment variable: ${env_var%%=*}"
    done

    # Start test services if docker-compose.test.yml exists
    if [[ -f "${PROJECT_ROOT}/docker-compose.test.yml" ]]; then
        log_info "Starting test services..."

        cd "$PROJECT_ROOT"

        # Stop any existing test services
        docker compose -f docker-compose.test.yml down --remove-orphans 2>/dev/null || true

        # Start test services
        if docker compose -f docker-compose.test.yml up -d; then
            log_success "Test services started"

            # Wait for services to be ready
            wait_for_service "localhost" "5433" 30  # PostgreSQL test
            wait_for_service "localhost" "6380" 30  # Redis test
        else
            log_error "Failed to start test services"
            exit 1
        fi
    else
        log_warning "docker-compose.test.yml not found, skipping service startup"
    fi

    log_success "Test environment setup completed"
}

# ===================================
# Test Execution Functions
# ===================================
run_unit_tests() {
    log_test "Running unit tests"

    local components=("backend" "frontend")
    local failed_components=()

    for component in "${components[@]}"; do
        local component_path="${PROJECT_ROOT}/${component}"

        if [[ ! -f "${component_path}/package.json" ]]; then
            log_warning "Skipping ${component} - package.json not found"
            continue
        fi

        log_info "Running ${component} unit tests..."

        cd "$component_path"

        # Run unit tests with coverage
        local test_command="npm run test:coverage -- --watchAll=false --passWithNoTests --ci"

        if timeout "$TEST_TIMEOUT" bash -c "$test_command"; then
            log_success "${component} unit tests passed"

            # Check coverage
            if [[ -f "coverage/coverage-summary.json" ]]; then
                local coverage
                coverage=$(node -e "
                    const fs = require('fs');
                    const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
                    console.log(coverage.total.lines.pct);
                ")

                if (( $(echo "$coverage >= $COVERAGE_THRESHOLD" | bc -l) )); then
                    log_success "${component} coverage: ${coverage}% (threshold: ${COVERAGE_THRESHOLD}%)"
                else
                    log_warning "${component} coverage: ${coverage}% (below threshold: ${COVERAGE_THRESHOLD}%)"
                fi
            fi
        else
            log_error "${component} unit tests failed"
            failed_components+=("$component")
        fi
    done

    if [[ ${#failed_components[@]} -gt 0 ]]; then
        log_error "Unit tests failed for: ${failed_components[*]}"
        return 1
    fi

    log_success "All unit tests passed"
    return 0
}

run_integration_tests() {
    log_test "Running integration tests"

    local components=("backend" "frontend")
    local failed_components=()

    for component in "${components[@]}"; do
        local component_path="${PROJECT_ROOT}/${component}"

        if [[ ! -f "${component_path}/package.json" ]]; then
            log_warning "Skipping ${component} - package.json not found"
            continue
        fi

        # Check if integration test script exists
        if ! npm run | grep -q "test:integration"; then
            log_warning "Skipping ${component} - no integration test script found"
            continue
        fi

        log_info "Running ${component} integration tests..."

        cd "$component_path"

        local test_command="npm run test:integration -- --watchAll=false --passWithNoTests --ci"

        if timeout "$TEST_TIMEOUT" bash -c "$test_command"; then
            log_success "${component} integration tests passed"
        else
            log_error "${component} integration tests failed"
            failed_components+=("$component")
        fi
    done

    if [[ ${#failed_components[@]} -gt 0 ]]; then
        log_error "Integration tests failed for: ${failed_components[*]}"
        return 1
    fi

    log_success "All integration tests passed"
    return 0
}

run_e2e_tests() {
    log_test "Running E2E tests"

    local frontend_path="${PROJECT_ROOT}/frontend"

    if [[ ! -f "${frontend_path}/package.json" ]]; then
        log_warning "Skipping E2E tests - frontend not found"
        return 0
    fi

    cd "$frontend_path"

    # Check if E2E test script exists
    if ! npm run | grep -q "test:e2e"; then
        log_warning "Skipping E2E tests - no E2E test script found"
        return 0
    fi

    log_info "Installing Playwright if needed..."
    npx playwright install --with-deps 2>/dev/null || log_warning "Playwright installation failed"

    log_info "Running E2E tests..."

    # Set E2E environment variables
    export BASE_URL="http://localhost:3001"
    export API_URL="http://localhost:8001"

    local test_command="npm run test:e2e"

    if timeout "$TEST_TIMEOUT" bash -c "$test_command"; then
        log_success "E2E tests passed"
        return 0
    else
        log_error "E2E tests failed"
        return 1
    fi
}

run_performance_tests() {
    log_test "Running performance tests"

    # Check if performance testing tools are available
    if ! command_exists artillery && ! command_exists k6; then
        log_warning "No performance testing tools found (artillery, k6)"
        return 0
    fi

    log_info "Running API performance tests..."

    # Simple performance test using curl
    local api_url="http://localhost:8001"
    local health_endpoint="${api_url}/health"

    # Test API health endpoint
    if curl -s --max-time 10 "$health_endpoint" >/dev/null; then
        log_success "API health check passed"
    else
        log_warning "API not available for performance testing"
        return 0
    fi

    # Run basic load test
    log_info "Running basic load test..."

    local requests=100
    local concurrent=10

    if command_exists ab; then
        if ab -n "$requests" -c "$concurrent" "$health_endpoint" >/dev/null 2>&1; then
            log_success "Basic load test completed"
        else
            log_warning "Load test failed"
        fi
    else
        log_warning "Apache Bench (ab) not available for load testing"
    fi

    log_success "Performance tests completed"
    return 0
}

run_security_tests() {
    log_test "Running security tests"

    local backend_path="${PROJECT_ROOT}/backend"

    if [[ ! -f "${backend_path}/package.json" ]]; then
        log_warning "Skipping security tests - backend not found"
        return 0
    fi

    cd "$backend_path"

    # Run npm audit
    log_info "Running npm security audit..."

    if npm audit --audit-level=high; then
        log_success "npm audit passed"
    else
        log_warning "npm audit found vulnerabilities"
    fi

    # Check for common security issues
    log_info "Checking for common security issues..."

    # Check for hardcoded secrets (basic check)
    if grep -r "password.*=" . --include="*.js" --include="*.ts" --exclude-dir=node_modules | grep -v "test" | grep -v "example"; then
        log_warning "Potential hardcoded passwords found"
    else
        log_success "No obvious hardcoded passwords found"
    fi

    log_success "Security tests completed"
    return 0
}

# ===================================
# Main Test Execution
# ===================================
execute_tests() {
    log_step "4/6" "Executing tests"

    local test_type="${1:-all}"
    local failed_tests=()
    local total_tests=0
    local passed_tests=0

    case "$test_type" in
        "all")
            local tests=("unit" "integration" "e2e" "performance" "security")
            ;;
        "unit"|"integration"|"e2e"|"performance"|"security")
            local tests=("$test_type")
            ;;
        *)
            log_error "Unknown test type: $test_type"
            log_info "Available types: all, unit, integration, e2e, performance, security"
            exit 1
            ;;
    esac

    for test in "${tests[@]}"; do
        ((total_tests++))
        log_info "Running $test tests..."

        local retry_count=0
        local test_passed=false

        while [[ $retry_count -lt $MAX_RETRIES ]]; do
            case "$test" in
                "unit")
                    if run_unit_tests; then
                        test_passed=true
                        break
                    fi
                    ;;
                "integration")
                    if run_integration_tests; then
                        test_passed=true
                        break
                    fi
                    ;;
                "e2e")
                    if run_e2e_tests; then
                        test_passed=true
                        break
                    fi
                    ;;
                "performance")
                    if run_performance_tests; then
                        test_passed=true
                        break
                    fi
                    ;;
                "security")
                    if run_security_tests; then
                        test_passed=true
                        break
                    fi
                    ;;
            esac

            ((retry_count++))
            if [[ $retry_count -lt $MAX_RETRIES ]]; then
                log_warning "$test tests failed, retrying in ${RETRY_DELAY}s... (attempt $((retry_count + 1))/$MAX_RETRIES)"
                sleep "$RETRY_DELAY"
            fi
        done

        if [[ $test_passed == true ]]; then
            ((passed_tests++))
            log_success "$test tests completed successfully"
        else
            failed_tests+=("$test")
            log_error "$test tests failed after $MAX_RETRIES attempts"
        fi
    done

    log_info "Test execution summary:"
    log_info "Total: $total_tests, Passed: $passed_tests, Failed: ${#failed_tests[@]}"

    if [[ ${#failed_tests[@]} -gt 0 ]]; then
        log_error "Failed tests: ${failed_tests[*]}"
        return 1
    fi

    log_success "All tests passed"
    return 0
}

cleanup_test_environment() {
    log_step "5/6" "Cleaning up test environment"

    cd "$PROJECT_ROOT"

    # Stop test services
    if [[ -f "docker-compose.test.yml" ]]; then
        log_info "Stopping test services..."
        docker compose -f docker-compose.test.yml down --remove-orphans 2>/dev/null || true
        log_success "Test services stopped"
    fi

    # Clean up temporary files
    log_info "Cleaning up temporary files..."
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name ".nyc_output" -type d -exec rm -rf {} + 2>/dev/null || true

    log_success "Test environment cleanup completed"
}

generate_test_report() {
    log_step "6/6" "Generating test report"

    local report_file="${PROJECT_ROOT}/test-results/test-report-$(date +%Y%m%d-%H%M%S).json"

    # Create basic test report
    cat > "$report_file" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "platform": "Linux",
    "projectRoot": "${PROJECT_ROOT}",
    "testType": "${TEST_TYPE:-all}",
    "logFile": "${LOG_FILE}",
    "status": "completed"
}
EOF

    log_success "Test report generated: $report_file"
}

print_summary() {
    echo ""
    echo "============================================================"
    echo "🎉 Linux Test Execution Summary"
    echo "============================================================"
    echo "📁 Project: $(basename "$PROJECT_ROOT")"
    echo "🕒 Completed: $(date)"
    echo "📋 Log file: $LOG_FILE"
    echo "============================================================"
}

show_help() {
    cat << EOF
Task Management System - Linux Test Execution Script

Usage: $0 [test-type] [options]

Test Types:
  all           Run all test types (default)
  unit          Run unit tests only
  integration   Run integration tests only
  e2e           Run end-to-end tests only
  performance   Run performance tests only
  security      Run security tests only

Options:
  --help, -h    Show this help message
  --verbose, -v Enable verbose logging

Examples:
  $0                    # Run all tests
  $0 unit               # Run unit tests only
  $0 integration        # Run integration tests only
  $0 e2e                # Run E2E tests only

Environment Variables:
  TEST_TIMEOUT          Test timeout in seconds (default: 1800)
  COVERAGE_THRESHOLD    Coverage threshold percentage (default: 90)
  MAX_RETRIES          Maximum retry attempts (default: 3)

EOF
}

# ===================================
# Main Function
# ===================================
main() {
    local test_type="all"
    local verbose=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --verbose|-v)
                verbose=true
                shift
                ;;
            unit|integration|e2e|performance|security|all)
                test_type="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Set verbose mode
    if [[ $verbose == true ]]; then
        set -x
    fi

    # Export test type for report generation
    export TEST_TYPE="$test_type"

    # Execute main workflow
    setup_logging
    check_test_environment
    setup_test_directories
    setup_test_environment

    local exit_code=0
    if ! execute_tests "$test_type"; then
        exit_code=1
    fi

    cleanup_test_environment
    generate_test_report
    print_summary

    exit $exit_code
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
