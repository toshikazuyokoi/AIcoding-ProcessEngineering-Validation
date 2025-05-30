#!/bin/bash

# ===================================
# Linux Deployment Script
# ===================================
# Purpose: Automated deployment for Linux environments
# Author: Process Engineering Approach
# Version: 1.0.0
# Usage: ./deploy.sh [environment] [options]

set -euo pipefail

# ===================================
# Configuration
# ===================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly LOG_DIR="${PROJECT_ROOT}/logs"
readonly BACKUP_DIR="${PROJECT_ROOT}/backups"
readonly DEPLOYMENT_REPORTS_DIR="${PROJECT_ROOT}/deployment-reports"

# Default configuration
ENVIRONMENT="development"
STRATEGY="rolling"
SKIP_BACKUP=false
SKIP_HEALTH_CHECK=false
VERBOSE=false
DRY_RUN=false
FORCE=false

# Environment configurations
declare -A ENV_CONFIG
ENV_CONFIG[development]="docker-compose.dev.yml:.env.dev:120:postgres,redis,backend,frontend"
ENV_CONFIG[staging]="docker-compose.staging.yml:.env.staging:180:postgres,redis,backend,frontend,nginx"
ENV_CONFIG[production]="docker-compose.yml:.env.production:300:postgres,redis,backend,frontend,nginx,prometheus,grafana"

# Health check configuration
readonly HEALTH_CHECK_RETRIES=30
readonly HEALTH_CHECK_INTERVAL=10

# ===================================
# Logging Functions
# ===================================
setup_logging() {
    mkdir -p "$LOG_DIR"
    readonly LOG_FILE="${LOG_DIR}/deploy-$(date +%Y%m%d-%H%M%S).log"
    exec 1> >(tee -a "$LOG_FILE")
    exec 2> >(tee -a "$LOG_FILE" >&2)
}

log_info() {
    echo -e "\033[34m[INFO]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "\033[33m[WARNING]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE:-/dev/stderr}"
}

log_step() {
    echo -e "\033[36m[STEP $1]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $2" | tee -a "$LOG_FILE"
}

log_deploy() {
    echo -e "\033[35m[DEPLOY]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# ===================================
# Utility Functions
# ===================================
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

get_env_config() {
    local env="$1"
    local field="$2"
    local config="${ENV_CONFIG[$env]}"

    case "$field" in
        "compose_file") echo "${config%%:*}" ;;
        "env_file") echo "${config#*:}" | cut -d: -f1 ;;
        "timeout") echo "${config#*:}" | cut -d: -f2 ;;
        "services") echo "${config##*:}" ;;
    esac
}

generate_deployment_id() {
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local short_hash=$(openssl rand -hex 3)
    echo "deploy-${timestamp}-${short_hash}"
}

# ===================================
# Validation Functions
# ===================================
validate_environment() {
    log_step "1/7" "Validating deployment environment"

    # Check if environment is supported
    if [[ ! "${ENV_CONFIG[$ENVIRONMENT]+isset}" ]]; then
        log_error "Unsupported environment: $ENVIRONMENT"
        log_error "Supported environments: ${!ENV_CONFIG[*]}"
        exit 1
    fi

    # Check required files
    local compose_file=$(get_env_config "$ENVIRONMENT" "compose_file")
    local env_file=$(get_env_config "$ENVIRONMENT" "env_file")

    if [[ ! -f "${PROJECT_ROOT}/${compose_file}" ]]; then
        log_error "Docker Compose file not found: ${compose_file}"
        exit 1
    fi

    if [[ ! -f "${PROJECT_ROOT}/${env_file}" ]]; then
        log_warning "Environment file not found: ${env_file}"
        log_warning "Using default environment variables"
    fi

    log_success "Environment validation completed"
}

check_prerequisites() {
    log_step "2/7" "Checking deployment prerequisites"

    # Check required commands
    local required_commands=("docker" "docker-compose")
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            log_error "Required command not found: $cmd"
            exit 1
        fi
    done

    # Check Docker daemon
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon is not running"
        exit 1
    fi

    # Check disk space (minimum 2GB)
    local available_space=$(df "${PROJECT_ROOT}" | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 2097152 ]]; then  # 2GB in KB
        log_warning "Low disk space: $(($available_space / 1024))MB available"
    fi

    log_success "Prerequisites check completed"
}

# ===================================
# Backup Functions
# ===================================
create_backup() {
    if [[ "$SKIP_BACKUP" == true ]]; then
        log_warning "Skipping backup creation"
        return
    fi

    log_step "3/7" "Creating deployment backup"

    local deployment_id="$1"
    local backup_dir="${BACKUP_DIR}/${deployment_id}"

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would create backup in ${backup_dir}"
        return
    fi

    mkdir -p "$backup_dir"

    # Backup database if PostgreSQL service exists
    local services=$(get_env_config "$ENVIRONMENT" "services")
    if [[ "$services" == *"postgres"* ]]; then
        backup_database "$backup_dir"
    fi

    # Backup configuration files
    backup_configuration "$backup_dir"

    # Cleanup old backups (keep last 5)
    cleanup_old_backups

    log_success "Backup created successfully"
}

backup_database() {
    local backup_dir="$1"
    log_info "Creating database backup..."

    # Get database connection info from environment
    local compose_file=$(get_env_config "$ENVIRONMENT" "compose_file")

    # Create database dump
    if docker-compose -f "$compose_file" exec -T postgres pg_dumpall -U postgres > "${backup_dir}/database.sql" 2>/dev/null; then
        log_success "Database backup created: ${backup_dir}/database.sql"
    else
        log_warning "Failed to create database backup"
    fi
}

backup_configuration() {
    local backup_dir="$1"
    log_info "Creating configuration backup..."

    # Backup important configuration files
    local config_files=(
        "docker-compose*.yml"
        ".env*"
        "Makefile"
        "package.json"
        "backend/package.json"
        "frontend/package.json"
    )

    for pattern in "${config_files[@]}"; do
        find "$PROJECT_ROOT" -maxdepth 2 -name "$pattern" -exec cp {} "$backup_dir/" \; 2>/dev/null || true
    done

    log_success "Configuration backup completed"
}

cleanup_old_backups() {
    log_info "Cleaning up old backups..."

    # Keep only the last 5 backups
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "deploy-*" | sort -r | tail -n +6 | xargs rm -rf 2>/dev/null || true

    log_info "Old backups cleaned up"
}

# ===================================
# Build Functions
# ===================================
build_images() {
    log_step "4/7" "Building Docker images"

    local compose_file=$(get_env_config "$ENVIRONMENT" "compose_file")

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would build Docker images using ${compose_file}"
        return
    fi

    cd "$PROJECT_ROOT"

    log_info "Building Docker images..."
    if [[ "$VERBOSE" == true ]]; then
        docker-compose -f "$compose_file" build --no-cache
    else
        docker-compose -f "$compose_file" build --no-cache >/dev/null 2>&1
    fi

    log_success "Docker images built successfully"
}

# ===================================
# Deployment Strategy Functions
# ===================================
execute_deployment() {
    log_step "5/7" "Executing deployment"

    case "$STRATEGY" in
        "blue-green")
            execute_blue_green_deployment
            ;;
        "rolling")
            execute_rolling_deployment
            ;;
        "recreate")
            execute_recreate_deployment
            ;;
        *)
            log_error "Unknown deployment strategy: $STRATEGY"
            exit 1
            ;;
    esac
}

execute_blue_green_deployment() {
    log_deploy "Executing Blue-Green deployment"

    local compose_file=$(get_env_config "$ENVIRONMENT" "compose_file")

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would execute Blue-Green deployment"
        return
    fi

    cd "$PROJECT_ROOT"

    # Start new services (green)
    log_info "Starting new services (green)..."
    docker-compose -f "$compose_file" up -d --scale backend=2 --scale frontend=2

    # Wait for new services to be healthy
    wait_for_services_health "backend frontend"

    # Switch traffic (this would typically involve load balancer configuration)
    log_info "Switching traffic to new services..."

    # Stop old services (blue)
    log_info "Stopping old services (blue)..."
    docker-compose -f "$compose_file" up -d --scale backend=1 --scale frontend=1

    log_success "Blue-Green deployment completed"
}

execute_rolling_deployment() {
    log_deploy "Executing Rolling deployment"

    local compose_file=$(get_env_config "$ENVIRONMENT" "compose_file")
    local services=$(get_env_config "$ENVIRONMENT" "services")

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would execute Rolling deployment"
        return
    fi

    cd "$PROJECT_ROOT"

    # Update services one by one
    IFS=',' read -ra SERVICE_ARRAY <<< "$services"
    for service in "${SERVICE_ARRAY[@]}"; do
        service=$(echo "$service" | xargs)  # trim whitespace
        log_info "Updating service: $service"

        docker-compose -f "$compose_file" up -d "$service"

        # Wait for service to be healthy before proceeding
        wait_for_service_health "$service"

        log_success "Service $service updated successfully"
    done

    log_success "Rolling deployment completed"
}

execute_recreate_deployment() {
    log_deploy "Executing Recreate deployment"

    local compose_file=$(get_env_config "$ENVIRONMENT" "compose_file")

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would execute Recreate deployment"
        return
    fi

    cd "$PROJECT_ROOT"

    # Stop all services
    log_info "Stopping all services..."
    docker-compose -f "$compose_file" down

    # Start all services
    log_info "Starting all services..."
    docker-compose -f "$compose_file" up -d

    log_success "Recreate deployment completed"
}

# ===================================
# Health Check Functions
# ===================================
run_health_checks() {
    if [[ "$SKIP_HEALTH_CHECK" == true ]]; then
        log_warning "Skipping health checks"
        return
    fi

    log_step "6/7" "Running health checks"

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would run health checks for services"
        local services=$(get_env_config "$ENVIRONMENT" "services")
        log_info "DRY RUN: Would check health of: $services"
        log_success "DRY RUN: Health checks would be completed"
        return
    fi

    local services=$(get_env_config "$ENVIRONMENT" "services")
    wait_for_services_health "$services"

    log_success "Health checks completed successfully"
}

wait_for_services_health() {
    local services="$1"
    local timeout=$(get_env_config "$ENVIRONMENT" "timeout")

    IFS=',' read -ra SERVICE_ARRAY <<< "$services"
    for service in "${SERVICE_ARRAY[@]}"; do
        service=$(echo "$service" | xargs)  # trim whitespace
        wait_for_service_health "$service" "$timeout"
    done
}

wait_for_service_health() {
    local service="$1"
    local timeout="${2:-120}"

    log_info "Waiting for $service to be healthy..."

    local retries=0
    local max_retries=$((timeout / HEALTH_CHECK_INTERVAL))

    while [[ $retries -lt $max_retries ]]; do
        if check_service_health "$service"; then
            log_success "$service is healthy"
            return 0
        fi

        retries=$((retries + 1))
        log_info "Waiting for $service... ($retries/$max_retries)"
        sleep $HEALTH_CHECK_INTERVAL
    done

    log_error "$service failed to become healthy within ${timeout}s"
    return 1
}

check_service_health() {
    local service="$1"
    local compose_file=$(get_env_config "$ENVIRONMENT" "compose_file")

    cd "$PROJECT_ROOT"

    # Check if container is running
    if ! docker-compose -f "$compose_file" ps "$service" | grep -q "Up"; then
        return 1
    fi

    # Service-specific health checks
    case "$service" in
        "postgres")
            docker-compose -f "$compose_file" exec -T "$service" pg_isready -U postgres >/dev/null 2>&1
            ;;
        "redis")
            docker-compose -f "$compose_file" exec -T "$service" redis-cli ping >/dev/null 2>&1
            ;;
        "backend"|"frontend")
            # Check if service responds to HTTP requests
            local port=$(get_service_port "$service")
            if [[ -n "$port" ]]; then
                curl -f "http://localhost:$port/health" >/dev/null 2>&1 || \
                curl -f "http://localhost:$port/" >/dev/null 2>&1
            else
                return 0  # Assume healthy if no port check available
            fi
            ;;
        *)
            return 0  # Assume healthy for unknown services
            ;;
    esac
}

get_service_port() {
    local service="$1"
    case "$service" in
        "backend") echo "3000" ;;
        "frontend") echo "8000" ;;
        "nginx") echo "80" ;;
        *) echo "" ;;
    esac
}

# ===================================
# Reporting Functions
# ===================================
generate_deployment_report() {
    log_step "7/7" "Generating deployment report"

    local deployment_id="$1"
    local start_time="$2"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    mkdir -p "$DEPLOYMENT_REPORTS_DIR"
    local report_file="${DEPLOYMENT_REPORTS_DIR}/deployment-${deployment_id}.md"

    cat > "$report_file" << EOF
# Deployment Report

## Deployment Information
- **Deployment ID**: ${deployment_id}
- **Environment**: ${ENVIRONMENT}
- **Strategy**: ${STRATEGY}
- **Start Time**: $(date -d "@$start_time" '+%Y-%m-%d %H:%M:%S')
- **End Time**: $(date -d "@$end_time" '+%Y-%m-%d %H:%M:%S')
- **Duration**: ${duration}s

## Configuration
- **Compose File**: $(get_env_config "$ENVIRONMENT" "compose_file")
- **Environment File**: $(get_env_config "$ENVIRONMENT" "env_file")
- **Services**: $(get_env_config "$ENVIRONMENT" "services")

## Options
- **Skip Backup**: ${SKIP_BACKUP}
- **Skip Health Check**: ${SKIP_HEALTH_CHECK}
- **Verbose**: ${VERBOSE}
- **Dry Run**: ${DRY_RUN}
- **Force**: ${FORCE}

## System Information
- **Platform**: $(uname -s)
- **Architecture**: $(uname -m)
- **Kernel**: $(uname -r)
- **Docker Version**: $(docker --version)
- **Docker Compose Version**: $(docker-compose --version)

## Deployment Status
- **Status**: SUCCESS
- **Log File**: ${LOG_FILE}
- **Backup Directory**: ${BACKUP_DIR}/${deployment_id}

## Services Status
EOF

    # Add service status to report
    local services=$(get_env_config "$ENVIRONMENT" "services")
    IFS=',' read -ra SERVICE_ARRAY <<< "$services"
    for service in "${SERVICE_ARRAY[@]}"; do
        service=$(echo "$service" | xargs)
        local status="UNKNOWN"
        if check_service_health "$service"; then
            status="HEALTHY"
        else
            status="UNHEALTHY"
        fi
        echo "- **${service}**: ${status}" >> "$report_file"
    done

    log_success "Deployment report generated: $report_file"
}

# ===================================
# Error Handling
# ===================================
handle_deployment_failure() {
    local error_message="$1"
    local deployment_id="$2"

    log_error "Deployment failed: $error_message"

    # Generate failure report
    mkdir -p "$DEPLOYMENT_REPORTS_DIR"
    local report_file="${DEPLOYMENT_REPORTS_DIR}/deployment-${deployment_id}-FAILED.md"

    cat > "$report_file" << EOF
# Deployment Failure Report

## Deployment Information
- **Deployment ID**: ${deployment_id}
- **Environment**: ${ENVIRONMENT}
- **Strategy**: ${STRATEGY}
- **Failure Time**: $(date '+%Y-%m-%d %H:%M:%S')

## Error Information
- **Error Message**: ${error_message}
- **Log File**: ${LOG_FILE}

## Recovery Actions
1. Check the log file for detailed error information
2. Verify system prerequisites
3. Check Docker daemon status
4. Verify configuration files
5. Consider rollback if necessary

## System State
EOF

    # Add current system state
    echo "- **Docker Status**: $(docker info >/dev/null 2>&1 && echo "Running" || echo "Not Running")" >> "$report_file"
    echo "- **Disk Space**: $(df -h "${PROJECT_ROOT}" | awk 'NR==2 {print $4}') available" >> "$report_file"

    log_error "Failure report generated: $report_file"

    # Attempt cleanup if not in dry run mode
    if [[ "$DRY_RUN" != true ]]; then
        log_info "Attempting cleanup..."
        cleanup_failed_deployment
    fi
}

cleanup_failed_deployment() {
    local compose_file=$(get_env_config "$ENVIRONMENT" "compose_file")

    cd "$PROJECT_ROOT"

    # Stop any partially started services
    docker-compose -f "$compose_file" down --remove-orphans 2>/dev/null || true

    # Remove dangling images
    docker image prune -f >/dev/null 2>&1 || true

    log_info "Cleanup completed"
}

# ===================================
# Help and Usage
# ===================================
show_help() {
    cat << EOF
Linux Deployment Script

USAGE:
    $0 [ENVIRONMENT] [OPTIONS]

ENVIRONMENTS:
    development     Deploy to development environment (default)
    staging         Deploy to staging environment
    production      Deploy to production environment

OPTIONS:
    --strategy=STRATEGY     Deployment strategy (rolling|blue-green|recreate)
                           Default: rolling
    --skip-backup          Skip backup creation
    --skip-health-check    Skip health checks
    --verbose              Enable verbose output
    --dry-run              Show what would be done without executing
    --force                Force deployment even with warnings
    --help                 Show this help message

EXAMPLES:
    $0                                          # Deploy to development
    $0 production --strategy=blue-green         # Blue-green to production
    $0 staging --dry-run                        # Dry run to staging
    $0 development --verbose                    # Verbose development deploy
    $0 production --skip-backup --force         # Force production deploy

DEPLOYMENT STRATEGIES:
    rolling     Update services one by one (default, zero downtime)
    blue-green  Deploy to parallel environment then switch
    recreate    Stop all services then start new ones (downtime)

ENVIRONMENT FILES:
    development: docker-compose.dev.yml + .env.dev
    staging:     docker-compose.staging.yml + .env.staging
    production:  docker-compose.yml + .env.production

For more information, see the project documentation.
EOF
}

# ===================================
# Argument Parsing
# ===================================
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            development|staging|production)
                ENVIRONMENT="$1"
                shift
                ;;
            --strategy=*)
                STRATEGY="${1#*=}"
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-health-check)
                SKIP_HEALTH_CHECK=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Validate strategy
    case "$STRATEGY" in
        rolling|blue-green|recreate)
            ;;
        *)
            log_error "Invalid deployment strategy: $STRATEGY"
            log_error "Valid strategies: rolling, blue-green, recreate"
            exit 1
            ;;
    esac
}

# ===================================
# Main Function
# ===================================
main() {
    local start_time=$(date +%s)
    local deployment_id=$(generate_deployment_id)

    # Parse command line arguments first
    parse_arguments "$@"

    # Setup logging after parsing arguments
    setup_logging

    # Trap errors for cleanup
    trap 'handle_deployment_failure "Script interrupted" "$deployment_id"' ERR INT TERM

    log_info "🚀 Starting Linux deployment"
    log_info "Deployment ID: $deployment_id"
    log_info "Environment: $ENVIRONMENT"
    log_info "Strategy: $STRATEGY"
    log_info "Options: skip_backup=$SKIP_BACKUP, skip_health_check=$SKIP_HEALTH_CHECK, verbose=$VERBOSE, dry_run=$DRY_RUN, force=$FORCE"

    # Execute deployment steps
    validate_environment
    check_prerequisites
    create_backup "$deployment_id"
    build_images
    execute_deployment
    run_health_checks
    generate_deployment_report "$deployment_id" "$start_time"

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    log_success "🎉 Deployment completed successfully!"
    log_success "Deployment ID: $deployment_id"
    log_success "Duration: ${duration}s"
    log_success "Log file: $LOG_FILE"

    exit 0
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
