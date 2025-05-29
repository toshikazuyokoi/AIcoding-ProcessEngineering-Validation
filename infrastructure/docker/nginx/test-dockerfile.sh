#!/bin/bash

# ===================================
# Task Management System - Nginx Dockerfile Test Script
# ===================================
# Generated for TSK-015-INF-nginx-dockerfile
# Project: Task Management System
# Component: Nginx Dockerfile Testing
# Purpose: Comprehensive testing of Nginx Docker builds and functionality

set -euo pipefail

# ===================================
# Configuration
# ===================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
TEST_IMAGE_PREFIX="task-management-nginx-test"
TEST_CONTAINER_PREFIX="nginx-test"
TEST_RESULTS_DIR="${SCRIPT_DIR}/test-results"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===================================
# Helper Functions
# ===================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

cleanup() {
    log_info "Cleaning up test containers and images..."
    
    # Stop and remove test containers
    docker ps -a --filter "name=${TEST_CONTAINER_PREFIX}" --format "{{.Names}}" | while read -r container; do
        if [ -n "$container" ]; then
            docker stop "$container" >/dev/null 2>&1 || true
            docker rm "$container" >/dev/null 2>&1 || true
        fi
    done
    
    # Remove test images
    docker images --filter "reference=${TEST_IMAGE_PREFIX}*" --format "{{.Repository}}:{{.Tag}}" | while read -r image; do
        if [ -n "$image" ]; then
            docker rmi "$image" >/dev/null 2>&1 || true
        fi
    done
}

# ===================================
# Test Functions
# ===================================
test_dockerfile_syntax() {
    log_info "Testing Dockerfile syntax..."
    
    if docker build --no-cache -f "${SCRIPT_DIR}/Dockerfile" -t "${TEST_IMAGE_PREFIX}:syntax-test" "${SCRIPT_DIR}" >/dev/null 2>&1; then
        log_success "Dockerfile syntax is valid"
        return 0
    else
        log_error "Dockerfile syntax is invalid"
        return 1
    fi
}

test_multi_stage_builds() {
    log_info "Testing multi-stage builds..."
    
    local stages=("development" "test" "production")
    local success=0
    
    for stage in "${stages[@]}"; do
        log_info "Building ${stage} stage..."
        
        if docker build --no-cache --target "${stage}" \
           -f "${SCRIPT_DIR}/Dockerfile" \
           -t "${TEST_IMAGE_PREFIX}:${stage}" \
           "${SCRIPT_DIR}" >/dev/null 2>&1; then
            log_success "${stage} stage build successful"
            ((success++))
        else
            log_error "${stage} stage build failed"
        fi
    done
    
    if [ $success -eq ${#stages[@]} ]; then
        log_success "All multi-stage builds completed successfully"
        return 0
    else
        log_error "Some multi-stage builds failed"
        return 1
    fi
}

test_container_startup() {
    log_info "Testing container startup..."
    
    local stages=("development" "test" "production")
    local success=0
    
    for stage in "${stages[@]}"; do
        log_info "Testing ${stage} container startup..."
        
        local container_name="${TEST_CONTAINER_PREFIX}-${stage}"
        
        # Start container
        if docker run -d --name "${container_name}" \
           -p "808${success}:80" \
           "${TEST_IMAGE_PREFIX}:${stage}" >/dev/null 2>&1; then
            
            # Wait for container to be ready
            sleep 5
            
            # Check if container is running
            if docker ps --filter "name=${container_name}" --filter "status=running" | grep -q "${container_name}"; then
                log_success "${stage} container started successfully"
                ((success++))
            else
                log_error "${stage} container failed to start"
            fi
        else
            log_error "Failed to start ${stage} container"
        fi
    done
    
    if [ $success -eq ${#stages[@]} ]; then
        log_success "All containers started successfully"
        return 0
    else
        log_error "Some containers failed to start"
        return 1
    fi
}

test_health_checks() {
    log_info "Testing health checks..."
    
    local stages=("development" "test" "production")
    local success=0
    
    for stage in "${stages[@]}"; do
        log_info "Testing ${stage} health check..."
        
        local container_name="${TEST_CONTAINER_PREFIX}-${stage}"
        local port="808${success}"
        
        # Wait for health check to pass
        local max_attempts=10
        local attempt=0
        
        while [ $attempt -lt $max_attempts ]; do
            if curl -f "http://localhost:${port}/health" >/dev/null 2>&1; then
                log_success "${stage} health check passed"
                ((success++))
                break
            fi
            
            ((attempt++))
            sleep 3
        done
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "${stage} health check failed after ${max_attempts} attempts"
        fi
    done
    
    if [ $success -eq ${#stages[@]} ]; then
        log_success "All health checks passed"
        return 0
    else
        log_error "Some health checks failed"
        return 1
    fi
}

test_security_configuration() {
    log_info "Testing security configuration..."
    
    local container_name="${TEST_CONTAINER_PREFIX}-production"
    local success=0
    
    # Test non-root user
    local user_info
    user_info=$(docker exec "${container_name}" id 2>/dev/null || echo "")
    
    if echo "$user_info" | grep -q "uid=1001(nginx-user)"; then
        log_success "Container running as non-root user"
        ((success++))
    else
        log_error "Container not running as expected non-root user"
    fi
    
    # Test SSL certificate generation
    if docker exec "${container_name}" test -f /etc/nginx/ssl/cert.pem 2>/dev/null; then
        log_success "SSL certificate exists"
        ((success++))
    else
        log_error "SSL certificate not found"
    fi
    
    if [ $success -eq 2 ]; then
        log_success "Security configuration tests passed"
        return 0
    else
        log_error "Security configuration tests failed"
        return 1
    fi
}

# ===================================
# Main Test Execution
# ===================================
main() {
    log_info "Starting Nginx Dockerfile tests..."
    
    # Create test results directory
    mkdir -p "${TEST_RESULTS_DIR}"
    
    # Cleanup before starting
    cleanup
    
    local total_tests=0
    local passed_tests=0
    
    # Run tests
    tests=(
        "test_dockerfile_syntax"
        "test_multi_stage_builds"
        "test_container_startup"
        "test_health_checks"
        "test_security_configuration"
    )
    
    for test in "${tests[@]}"; do
        ((total_tests++))
        log_info "Running ${test}..."
        
        if $test; then
            ((passed_tests++))
        fi
        
        echo ""
    done
    
    # Cleanup after tests
    cleanup
    
    # Report results
    log_info "Test Results:"
    log_info "Total tests: ${total_tests}"
    log_info "Passed tests: ${passed_tests}"
    log_info "Failed tests: $((total_tests - passed_tests))"
    
    if [ $passed_tests -eq $total_tests ]; then
        log_success "All tests passed!"
        exit 0
    else
        log_error "Some tests failed!"
        exit 1
    fi
}

# ===================================
# Script Entry Point
# ===================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
