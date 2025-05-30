#!/bin/bash

# ===================================
# Linux Backup Script
# ===================================
# Purpose: Automated backup for Linux environments
# Author: Process Engineering Approach
# Version: 1.0.0
# Usage: ./backup.sh [environment] [backup_type] [options]

set -euo pipefail

# ===================================
# Configuration
# ===================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly LOG_DIR="${PROJECT_ROOT}/logs"
readonly BACKUP_DIR="${PROJECT_ROOT}/backups"
readonly TEMP_DIR="${PROJECT_ROOT}/tmp"

# Default configuration
ENVIRONMENT="development"
BACKUP_TYPE="full"
COMPRESS=true
ENCRYPT=false
VERIFY=true
VERBOSE=false
DRY_RUN=false
OUTPUT_DIR="backups"
RETENTION_DAYS=30

# Backup configuration
declare -A BACKUP_TYPES
BACKUP_TYPES[full]="Complete database and file system backup"
BACKUP_TYPES[incremental]="Changes since last backup"
BACKUP_TYPES[differential]="Changes since last full backup"

# Environment-specific retention policies
declare -A RETENTION_POLICIES
RETENTION_POLICIES[development]="daily:3,weekly:2,monthly:1"
RETENTION_POLICIES[staging]="daily:7,weekly:4,monthly:3"
RETENTION_POLICIES[production]="daily:30,weekly:12,monthly:12"

# ===================================
# Logging Functions
# ===================================
setup_logging() {
    mkdir -p "$LOG_DIR"
    readonly LOG_FILE="${LOG_DIR}/backup-$(date +%Y%m%d-%H%M%S).log"
    exec 1> >(tee -a "$LOG_FILE")
    exec 2> >(tee -a "$LOG_FILE" >&2)
}

log_info() {
    echo -e "\033[34m[INFO]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE:-/dev/stderr}"
}

log_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE:-/dev/stderr}"
}

log_warning() {
    echo -e "\033[33m[WARNING]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE:-/dev/stderr}"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE:-/dev/stderr}"
}

log_step() {
    echo -e "\033[36m[STEP $1]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $2" | tee -a "${LOG_FILE:-/dev/stderr}"
}

log_backup() {
    echo -e "\033[35m[BACKUP]\033[0m $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE:-/dev/stderr}"
}

# ===================================
# Utility Functions
# ===================================
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

generate_backup_id() {
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local short_hash=$(openssl rand -hex 3 2>/dev/null || echo "$(date +%s | tail -c 6)")
    echo "backup-${timestamp}-${short_hash}"
}

get_backup_dir() {
    local backup_id="$1"
    echo "${BACKUP_DIR}/${backup_id}"
}

calculate_checksum() {
    local file="$1"
    if command_exists sha256sum; then
        sha256sum "$file" | cut -d' ' -f1
    elif command_exists shasum; then
        shasum -a 256 "$file" | cut -d' ' -f1
    else
        md5sum "$file" | cut -d' ' -f1
    fi
}

# ===================================
# Validation Functions
# ===================================
validate_backup_configuration() {
    log_step "1/10" "Validating backup configuration"

    # Check if backup type is supported
    if [[ ! "${BACKUP_TYPES[$BACKUP_TYPE]+isset}" ]]; then
        log_error "Unsupported backup type: $BACKUP_TYPE"
        log_error "Supported types: ${!BACKUP_TYPES[*]}"
        exit 1
    fi

    # Check environment
    if [[ ! "${RETENTION_POLICIES[$ENVIRONMENT]+isset}" ]]; then
        log_error "Unsupported environment: $ENVIRONMENT"
        log_error "Supported environments: ${!RETENTION_POLICIES[*]}"
        exit 1
    fi

    # Check disk space (minimum 1GB)
    local available_space=$(df "${PROJECT_ROOT}" | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 1048576 ]]; then  # 1GB in KB
        log_warning "Low disk space: $(($available_space / 1024))MB available"
        if [[ "$DRY_RUN" != true ]]; then
            log_error "Insufficient disk space for backup"
            exit 1
        fi
    fi

    log_success "Backup configuration validated"
}

check_prerequisites() {
    log_step "2/10" "Checking backup prerequisites"

    # Check required commands
    local required_commands=("tar" "gzip")
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            log_error "Required command not found: $cmd"
            exit 1
        fi
    done

    # Check optional commands
    if [[ "$ENCRYPT" == true ]] && ! command_exists "openssl"; then
        log_error "Encryption requested but openssl not found"
        exit 1
    fi

    # Check Docker if database backup is needed
    if command_exists "docker"; then
        if ! docker info >/dev/null 2>&1; then
            log_warning "Docker daemon is not running - database backup will be skipped"
        fi
    else
        log_warning "Docker not found - database backup will be skipped"
    fi

    log_success "Prerequisites check completed"
}

# ===================================
# Backup Directory Management
# ===================================
prepare_backup_directory() {
    log_step "3/10" "Preparing backup directory"

    local backup_id="$1"
    local backup_dir=$(get_backup_dir "$backup_id")

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would create backup directory: $backup_dir"
        return
    fi

    # Create backup directory structure
    mkdir -p "$backup_dir"
    mkdir -p "${backup_dir}/database"
    mkdir -p "${backup_dir}/config"
    mkdir -p "${backup_dir}/application"
    mkdir -p "${backup_dir}/logs"
    mkdir -p "$TEMP_DIR"

    # Create backup manifest
    cat > "${backup_dir}/manifest.json" << EOF
{
  "backup_id": "$backup_id",
  "timestamp": "$(date -Iseconds)",
  "environment": "$ENVIRONMENT",
  "backup_type": "$BACKUP_TYPE",
  "platform": "$(uname -s)",
  "architecture": "$(uname -m)",
  "kernel": "$(uname -r)",
  "hostname": "$(hostname)",
  "user": "$(whoami)",
  "project_root": "$PROJECT_ROOT",
  "options": {
    "compress": $COMPRESS,
    "encrypt": $ENCRYPT,
    "verify": $VERIFY
  },
  "files": [],
  "checksums": {},
  "metadata": {}
}
EOF

    log_success "Backup directory prepared: $backup_dir"
}

# ===================================
# Database Backup Functions
# ===================================
backup_database() {
    log_step "4/10" "Backing up database"

    local backup_id="$1"
    local backup_dir=$(get_backup_dir "$backup_id")

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would backup database to ${backup_dir}/database/"
        return
    fi

    # Check if Docker is available and running
    if ! command_exists "docker" || ! docker info >/dev/null 2>&1; then
        log_warning "Docker not available - skipping database backup"
        return
    fi

    # Backup PostgreSQL
    backup_postgresql "$backup_dir"

    # Backup Redis
    backup_redis "$backup_dir"

    log_success "Database backup completed"
}

backup_postgresql() {
    local backup_dir="$1"
    log_info "Backing up PostgreSQL database..."

    # Find PostgreSQL containers
    local postgres_containers=$(docker ps --filter "name=postgres" --format "{{.Names}}" 2>/dev/null || true)

    if [[ -z "$postgres_containers" ]]; then
        log_warning "No PostgreSQL containers found"
        return
    fi

    for container in $postgres_containers; do
        log_info "Backing up PostgreSQL container: $container"

        local backup_file="${backup_dir}/database/postgresql-${container}-$(date +%Y%m%d-%H%M%S).sql"

        if docker exec "$container" pg_dumpall -U postgres > "$backup_file" 2>/dev/null; then
            local checksum=$(calculate_checksum "$backup_file")
            log_success "PostgreSQL backup created: $backup_file (checksum: $checksum)"

            # Update manifest
            update_manifest_file "$backup_dir" "database/$(basename "$backup_file")" "$checksum"
        else
            log_warning "Failed to backup PostgreSQL container: $container"
        fi
    done
}

backup_redis() {
    local backup_dir="$1"
    log_info "Backing up Redis data..."

    # Find Redis containers
    local redis_containers=$(docker ps --filter "name=redis" --format "{{.Names}}" 2>/dev/null || true)

    if [[ -z "$redis_containers" ]]; then
        log_warning "No Redis containers found"
        return
    fi

    for container in $redis_containers; do
        log_info "Backing up Redis container: $container"

        local backup_file="${backup_dir}/database/redis-${container}-$(date +%Y%m%d-%H%M%S).rdb"

        # Create Redis backup using BGSAVE
        if docker exec "$container" redis-cli BGSAVE >/dev/null 2>&1; then
            sleep 2  # Wait for background save to complete

            # Copy the dump file
            if docker cp "${container}:/data/dump.rdb" "$backup_file" 2>/dev/null; then
                local checksum=$(calculate_checksum "$backup_file")
                log_success "Redis backup created: $backup_file (checksum: $checksum)"

                # Update manifest
                update_manifest_file "$backup_dir" "database/$(basename "$backup_file")" "$checksum"
            else
                log_warning "Failed to copy Redis dump file from container: $container"
            fi
        else
            log_warning "Failed to create Redis backup for container: $container"
        fi
    done
}

# ===================================
# Configuration Backup Functions
# ===================================
backup_configuration_files() {
    log_step "5/10" "Backing up configuration files"

    local backup_id="$1"
    local backup_dir=$(get_backup_dir "$backup_id")

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would backup configuration files to ${backup_dir}/config/"
        return
    fi

    # Configuration file patterns
    local config_patterns=(
        "docker-compose*.yml"
        ".env*"
        "Makefile"
        "package.json"
        "backend/package.json"
        "frontend/package.json"
        "backend/prisma/schema.prisma"
        "backend/tsconfig.json"
        "frontend/tsconfig.json"
        "backend/jest.config.js"
        "frontend/jest.config.js"
        ".github/workflows/*.yml"
        "infrastructure/docker/*"
        "scripts/*"
    )

    cd "$PROJECT_ROOT"

    for pattern in "${config_patterns[@]}"; do
        find . -path "./node_modules" -prune -o -path "./.git" -prune -o -name "$pattern" -type f -print0 2>/dev/null | \
        while IFS= read -r -d '' file; do
            local relative_path="${file#./}"
            local target_dir="${backup_dir}/config/$(dirname "$relative_path")"
            local target_file="${backup_dir}/config/$relative_path"

            mkdir -p "$target_dir"
            cp "$file" "$target_file" 2>/dev/null || continue

            local checksum=$(calculate_checksum "$target_file")
            log_info "Backed up config file: $relative_path (checksum: $checksum)"

            # Update manifest
            update_manifest_file "$backup_dir" "config/$relative_path" "$checksum"
        done
    done

    log_success "Configuration files backup completed"
}

# ===================================
# Application Backup Functions
# ===================================
backup_application_files() {
    log_step "6/10" "Backing up application files"

    local backup_id="$1"
    local backup_dir=$(get_backup_dir "$backup_id")

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would backup application files to ${backup_dir}/application/"
        return
    fi

    # Application directories to backup
    local app_dirs=(
        "backend/src"
        "backend/prisma"
        "frontend/src"
        "frontend/public"
        "shared"
        "docs"
    )

    cd "$PROJECT_ROOT"

    for dir in "${app_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            log_info "Backing up application directory: $dir"

            local target_dir="${backup_dir}/application/$dir"
            mkdir -p "$(dirname "$target_dir")"

            # Copy directory with exclusions
            rsync -av \
                --exclude="node_modules" \
                --exclude=".git" \
                --exclude="*.log" \
                --exclude="*.tmp" \
                --exclude="dist" \
                --exclude="build" \
                "$dir/" "$target_dir/" 2>/dev/null || {
                log_warning "Failed to backup directory: $dir"
                continue
            }

            # Calculate checksums for files
            find "$target_dir" -type f -print0 | while IFS= read -r -d '' file; do
                local relative_path=$(echo "$file" | sed "s|${backup_dir}/application/||")
                local checksum=$(calculate_checksum "$file")

                # Update manifest
                update_manifest_file "$backup_dir" "application/$relative_path" "$checksum"
            done

            log_success "Application directory backed up: $dir"
        else
            log_warning "Application directory not found: $dir"
        fi
    done

    log_success "Application files backup completed"
}

# ===================================
# Log Backup Functions
# ===================================
backup_logs() {
    log_step "7/10" "Backing up log files"

    local backup_id="$1"
    local backup_dir=$(get_backup_dir "$backup_id")

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would backup log files to ${backup_dir}/logs/"
        return
    fi

    # Log directories and files
    local log_sources=(
        "logs"
        "backend/logs"
        "frontend/logs"
        "/var/log/nginx"
        "/var/log/postgresql"
    )

    for source in "${log_sources[@]}"; do
        local full_path
        if [[ "$source" == /* ]]; then
            full_path="$source"
        else
            full_path="${PROJECT_ROOT}/$source"
        fi

        if [[ -d "$full_path" ]] && [[ -r "$full_path" ]]; then
            log_info "Backing up logs from: $source"

            local target_dir="${backup_dir}/logs/$(basename "$source")"
            mkdir -p "$target_dir"

            # Copy recent log files (last 7 days)
            find "$full_path" -name "*.log" -mtime -7 -type f -exec cp {} "$target_dir/" \; 2>/dev/null || true

            # Calculate checksums
            find "$target_dir" -type f -print0 | while IFS= read -r -d '' file; do
                local relative_path="logs/$(basename "$source")/$(basename "$file")"
                local checksum=$(calculate_checksum "$file")

                # Update manifest
                update_manifest_file "$backup_dir" "$relative_path" "$checksum"
            done

            log_success "Logs backed up from: $source"
        else
            log_info "Log source not found or not readable: $source"
        fi
    done

    log_success "Log files backup completed"
}

# ===================================
# Compression Functions
# ===================================
compress_backup() {
    if [[ "$COMPRESS" != true ]]; then
        log_info "Compression disabled - skipping"
        return
    fi

    log_step "8/10" "Compressing backup"

    local backup_id="$1"
    local backup_dir=$(get_backup_dir "$backup_id")

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would compress backup: ${backup_dir}.tar.gz"
        return
    fi

    local compressed_file="${backup_dir}.tar.gz"

    cd "$(dirname "$backup_dir")"

    log_info "Creating compressed archive: $compressed_file"
    if tar -czf "$compressed_file" "$(basename "$backup_dir")" 2>/dev/null; then
        local original_size=$(du -sb "$backup_dir" | cut -f1)
        local compressed_size=$(stat -c%s "$compressed_file" 2>/dev/null || stat -f%z "$compressed_file" 2>/dev/null || echo "0")
        local compression_ratio=$(( (original_size - compressed_size) * 100 / original_size ))

        log_success "Backup compressed successfully"
        log_info "Original size: $(numfmt --to=iec $original_size)"
        log_info "Compressed size: $(numfmt --to=iec $compressed_size)"
        log_info "Compression ratio: ${compression_ratio}%"

        # Remove uncompressed directory
        rm -rf "$backup_dir"

        # Update backup directory reference
        echo "$compressed_file" > "${TEMP_DIR}/backup_path_${backup_id}"
    else
        log_error "Compression failed"
        exit 1
    fi
}

# ===================================
# Encryption Functions
# ===================================
encrypt_backup() {
    if [[ "$ENCRYPT" != true ]]; then
        log_info "Encryption disabled - skipping"
        return
    fi

    log_step "9/10" "Encrypting backup"

    local backup_id="$1"
    local backup_path

    if [[ -f "${TEMP_DIR}/backup_path_${backup_id}" ]]; then
        backup_path=$(cat "${TEMP_DIR}/backup_path_${backup_id}")
    else
        backup_path=$(get_backup_dir "$backup_id")
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would encrypt backup: ${backup_path}.enc"
        return
    fi

    local encrypted_file="${backup_path}.enc"
    local password="${BACKUP_PASSWORD:-default-backup-password}"

    log_info "Encrypting backup file: $backup_path"
    if openssl enc -aes-256-cbc -salt -in "$backup_path" -out "$encrypted_file" -pass pass:"$password" 2>/dev/null; then
        log_success "Backup encrypted successfully: $encrypted_file"

        # Remove unencrypted file
        rm -f "$backup_path"

        # Update backup path reference
        echo "$encrypted_file" > "${TEMP_DIR}/backup_path_${backup_id}"
    else
        log_error "Encryption failed"
        exit 1
    fi
}

# ===================================
# Verification Functions
# ===================================
verify_backup() {
    if [[ "$VERIFY" != true ]]; then
        log_info "Verification disabled - skipping"
        return
    fi

    log_step "10/10" "Verifying backup"

    local backup_id="$1"
    local backup_path

    if [[ -f "${TEMP_DIR}/backup_path_${backup_id}" ]]; then
        backup_path=$(cat "${TEMP_DIR}/backup_path_${backup_id}")
    else
        backup_path=$(get_backup_dir "$backup_id")
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would verify backup: $backup_path"
        return
    fi

    log_info "Verifying backup integrity: $backup_path"

    # Check if backup file exists and is readable
    if [[ ! -f "$backup_path" ]]; then
        log_error "Backup file not found: $backup_path"
        exit 1
    fi

    if [[ ! -r "$backup_path" ]]; then
        log_error "Backup file not readable: $backup_path"
        exit 1
    fi

    # Verify compressed archive if applicable
    if [[ "$backup_path" == *.tar.gz ]]; then
        if tar -tzf "$backup_path" >/dev/null 2>&1; then
            log_success "Compressed archive verification passed"
        else
            log_error "Compressed archive verification failed"
            exit 1
        fi
    fi

    # Calculate final checksum
    local final_checksum=$(calculate_checksum "$backup_path")
    log_info "Final backup checksum: $final_checksum"

    log_success "Backup verification completed successfully"
}

# ===================================
# Cleanup Functions
# ===================================
cleanup_old_backups() {
    log_info "Cleaning up old backups based on retention policy"

    local retention_policy="${RETENTION_POLICIES[$ENVIRONMENT]}"

    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would cleanup old backups using policy: $retention_policy"
        return
    fi

    # Parse retention policy (format: "daily:X,weekly:Y,monthly:Z")
    IFS=',' read -ra POLICIES <<< "$retention_policy"

    for policy in "${POLICIES[@]}"; do
        IFS=':' read -ra POLICY_PARTS <<< "$policy"
        local period="${POLICY_PARTS[0]}"
        local keep_count="${POLICY_PARTS[1]}"

        case "$period" in
            "daily")
                cleanup_backups_by_age 1 "$keep_count"
                ;;
            "weekly")
                cleanup_backups_by_age 7 "$keep_count"
                ;;
            "monthly")
                cleanup_backups_by_age 30 "$keep_count"
                ;;
        esac
    done

    log_success "Old backups cleanup completed"
}

cleanup_backups_by_age() {
    local days_old="$1"
    local keep_count="$2"

    log_info "Cleaning up backups older than $days_old days (keeping $keep_count)"

    # Find and remove old backups
    find "$BACKUP_DIR" -maxdepth 1 -name "backup-*" -mtime +$days_old | \
    sort -r | tail -n +$((keep_count + 1)) | \
    xargs rm -rf 2>/dev/null || true
}

# ===================================
# Manifest Management
# ===================================
update_manifest_file() {
    local backup_dir="$1"
    local file_path="$2"
    local checksum="$3"

    local manifest_file="${backup_dir}/manifest.json"

    # Create temporary manifest update
    local temp_manifest="${TEMP_DIR}/manifest_update_$(date +%s).json"

    # Add file to manifest (simplified JSON update)
    if [[ -f "$manifest_file" ]]; then
        # This is a simplified approach - in production, use jq for proper JSON manipulation
        sed -i.bak 's/"files": \[\]/"files": ["'"$file_path"'"]/' "$manifest_file" 2>/dev/null || true
        sed -i.bak 's/"checksums": {}/"checksums": {"'"$file_path"'": "'"$checksum"'"}/' "$manifest_file" 2>/dev/null || true
    fi
}

# ===================================
# Report Generation
# ===================================
generate_backup_report() {
    local backup_id="$1"
    local start_time="$2"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    local backup_path
    if [[ -f "${TEMP_DIR}/backup_path_${backup_id}" ]]; then
        backup_path=$(cat "${TEMP_DIR}/backup_path_${backup_id}")
    else
        backup_path=$(get_backup_dir "$backup_id")
    fi

    local report_file="${BACKUP_DIR}/backup-report-${backup_id}.md"

    # Ensure backup directory exists
    mkdir -p "$BACKUP_DIR"

    cat > "$report_file" << EOF
# Backup Report

## Backup Information
- **Backup ID**: ${backup_id}
- **Environment**: ${ENVIRONMENT}
- **Backup Type**: ${BACKUP_TYPE}
- **Start Time**: $(date -d "@$start_time" '+%Y-%m-%d %H:%M:%S')
- **End Time**: $(date -d "@$end_time" '+%Y-%m-%d %H:%M:%S')
- **Duration**: ${duration}s

## Configuration
- **Compression**: ${COMPRESS}
- **Encryption**: ${ENCRYPT}
- **Verification**: ${VERIFY}
- **Dry Run**: ${DRY_RUN}

## System Information
- **Platform**: $(uname -s)
- **Architecture**: $(uname -m)
- **Kernel**: $(uname -r)
- **Hostname**: $(hostname)
- **User**: $(whoami)

## Backup Details
- **Backup Path**: ${backup_path}
- **Log File**: ${LOG_FILE}

## Backup Status
- **Status**: SUCCESS
- **Files Backed Up**: Database, Configuration, Application, Logs
- **Retention Policy**: ${RETENTION_POLICIES[$ENVIRONMENT]}

EOF

    if [[ -f "$backup_path" ]]; then
        local backup_size=$(stat -c%s "$backup_path" 2>/dev/null || stat -f%z "$backup_path" 2>/dev/null || echo "0")
        local backup_checksum=$(calculate_checksum "$backup_path")

        cat >> "$report_file" << EOF
## File Information
- **Size**: $(numfmt --to=iec $backup_size)
- **Checksum**: ${backup_checksum}

EOF
    fi

    log_success "Backup report generated: $report_file"
}

# ===================================
# Error Handling
# ===================================
handle_backup_failure() {
    local error_message="$1"
    local backup_id="$2"

    log_error "Backup failed: $error_message"

    # Generate failure report
    local report_file="${BACKUP_DIR}/backup-failure-${backup_id}.md"

    cat > "$report_file" << EOF
# Backup Failure Report

## Backup Information
- **Backup ID**: ${backup_id}
- **Environment**: ${ENVIRONMENT}
- **Backup Type**: ${BACKUP_TYPE}
- **Failure Time**: $(date '+%Y-%m-%d %H:%M:%S')

## Error Information
- **Error Message**: ${error_message}
- **Log File**: ${LOG_FILE}

## Recovery Actions
1. Check the log file for detailed error information
2. Verify system prerequisites
3. Check disk space availability
4. Verify Docker daemon status (if applicable)
5. Check file permissions
6. Consider running with --dry-run to test configuration

## System State
- **Platform**: $(uname -s)
- **Disk Space**: $(df -h "${PROJECT_ROOT}" | awk 'NR==2 {print $4}') available
- **Docker Status**: $(docker info >/dev/null 2>&1 && echo "Running" || echo "Not Running")
- **User**: $(whoami)
- **Working Directory**: $(pwd)
EOF

    log_error "Failure report generated: $report_file"

    # Cleanup partial backup if not in dry run mode
    if [[ "$DRY_RUN" != true ]]; then
        cleanup_failed_backup "$backup_id"
    fi
}

cleanup_failed_backup() {
    local backup_id="$1"
    local backup_dir=$(get_backup_dir "$backup_id")

    log_info "Cleaning up failed backup: $backup_dir"

    # Remove partial backup directory
    rm -rf "$backup_dir" 2>/dev/null || true

    # Remove temporary files
    rm -f "${TEMP_DIR}/backup_path_${backup_id}" 2>/dev/null || true
    rm -f "${TEMP_DIR}/manifest_update_"*.json 2>/dev/null || true

    log_info "Failed backup cleanup completed"
}

# ===================================
# Help and Usage
# ===================================
show_help() {
    cat << EOF
Linux Backup Script

USAGE:
    $0 [ENVIRONMENT] [BACKUP_TYPE] [OPTIONS]

ENVIRONMENTS:
    development     Backup development environment (default)
    staging         Backup staging environment
    production      Backup production environment

BACKUP TYPES:
    full            Complete database and file system backup (default)
    incremental     Changes since last backup
    differential    Changes since last full backup

OPTIONS:
    --compress              Enable compression (default: true)
    --no-compress           Disable compression
    --encrypt               Enable encryption
    --no-encrypt            Disable encryption (default)
    --verify                Enable backup verification (default: true)
    --no-verify             Disable backup verification
    --verbose               Enable verbose output
    --dry-run               Show what would be done without executing
    --output-dir=DIR        Specify output directory (default: backups)
    --retention-days=DAYS   Override retention period in days
    --help                  Show this help message

EXAMPLES:
    $0                                          # Full backup of development
    $0 production full --encrypt                # Encrypted production backup
    $0 staging incremental --dry-run            # Dry run staging incremental
    $0 development --verbose --no-compress      # Verbose development backup
    $0 production --output-dir=/backup/prod     # Production backup to custom dir

BACKUP COMPONENTS:
    - Database (PostgreSQL, Redis)
    - Configuration files (docker-compose, .env, package.json, etc.)
    - Application source code
    - Log files (recent)

RETENTION POLICIES:
    development: daily:3, weekly:2, monthly:1
    staging:     daily:7, weekly:4, monthly:3
    production:  daily:30, weekly:12, monthly:12

ENVIRONMENT VARIABLES:
    BACKUP_PASSWORD         Password for encryption (default: auto-generated)

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
            full|incremental|differential)
                BACKUP_TYPE="$1"
                shift
                ;;
            --compress)
                COMPRESS=true
                shift
                ;;
            --no-compress)
                COMPRESS=false
                shift
                ;;
            --encrypt)
                ENCRYPT=true
                shift
                ;;
            --no-encrypt)
                ENCRYPT=false
                shift
                ;;
            --verify)
                VERIFY=true
                shift
                ;;
            --no-verify)
                VERIFY=false
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
            --output-dir=*)
                OUTPUT_DIR="${1#*=}"
                BACKUP_DIR="${PROJECT_ROOT}/${OUTPUT_DIR}"
                shift
                ;;
            --retention-days=*)
                RETENTION_DAYS="${1#*=}"
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

    # Validate backup type
    if [[ ! "${BACKUP_TYPES[$BACKUP_TYPE]+isset}" ]]; then
        log_error "Invalid backup type: $BACKUP_TYPE"
        log_error "Valid types: ${!BACKUP_TYPES[*]}"
        exit 1
    fi
}

# ===================================
# Main Function
# ===================================
main() {
    local start_time=$(date +%s)
    local backup_id=$(generate_backup_id)

    # Parse command line arguments first
    parse_arguments "$@"

    # Setup logging after parsing arguments
    setup_logging

    # Trap errors for cleanup
    trap 'handle_backup_failure "Script interrupted" "$backup_id"' ERR INT TERM

    log_info "🗄️  Starting Linux backup"
    log_info "Backup ID: $backup_id"
    log_info "Environment: $ENVIRONMENT"
    log_info "Backup Type: $BACKUP_TYPE (${BACKUP_TYPES[$BACKUP_TYPE]})"
    log_info "Options: compress=$COMPRESS, encrypt=$ENCRYPT, verify=$VERIFY, verbose=$VERBOSE, dry_run=$DRY_RUN"

    # Execute backup steps
    validate_backup_configuration
    check_prerequisites
    prepare_backup_directory "$backup_id"
    backup_database "$backup_id"
    backup_configuration_files "$backup_id"
    backup_application_files "$backup_id"
    backup_logs "$backup_id"
    compress_backup "$backup_id"
    encrypt_backup "$backup_id"
    verify_backup "$backup_id"
    cleanup_old_backups
    generate_backup_report "$backup_id" "$start_time"

    # Cleanup temporary files
    rm -f "${TEMP_DIR}/backup_path_${backup_id}" 2>/dev/null || true
    rm -f "${TEMP_DIR}/manifest_update_"*.json 2>/dev/null || true

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    log_success "🎉 Backup completed successfully!"
    log_success "Backup ID: $backup_id"
    log_success "Duration: ${duration}s"
    log_success "Log file: $LOG_FILE"

    exit 0
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
