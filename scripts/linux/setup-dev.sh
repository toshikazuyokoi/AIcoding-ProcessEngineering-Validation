#!/bin/bash

# ===================================
# Task Management System - Linux Development Environment Setup
# ===================================
# Generated for TSK-024-SCR-setup-linux
# Project: Task Management System
# Component: Linux Development Environment Setup
# Purpose: Automated development environment setup for Linux systems

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# ===================================
# Configuration
# ===================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly LOG_FILE="${PROJECT_ROOT}/logs/setup-dev-$(date +%Y%m%d-%H%M%S).log"

# Version requirements
readonly NODE_VERSION="20.11.0"
readonly NPM_VERSION="10.2.4"
readonly DOCKER_MIN_VERSION="24.0.0"
readonly DOCKER_COMPOSE_MIN_VERSION="2.20.0"

# Required packages
readonly REQUIRED_PACKAGES=(
    "curl"
    "wget"
    "git"
    "build-essential"
    "ca-certificates"
    "gnupg"
    "lsb-release"
    "software-properties-common"
    "apt-transport-https"
)

# Required ports
readonly REQUIRED_PORTS=(3000 8000 5432 6379)

# Environment files
readonly ENV_FILES=(
    "backend/.env.example:backend/.env"
    "frontend/.env.example:frontend/.env"
)

# Directories to create
readonly DIRECTORIES=(
    "logs"
    "coverage"
    "test-results"
    "backup"
    "uploads"
    "deployment-reports"
    "backups"
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

# Compare versions (returns 0 if version1 >= version2)
version_gte() {
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

# Check if port is available
is_port_available() {
    local port="$1"
    ! netstat -tuln 2>/dev/null | grep -q ":${port} "
}

# ===================================
# Setup Functions
# ===================================
setup_logging() {
    mkdir -p "$(dirname "${LOG_FILE}")"
    touch "${LOG_FILE}"
    log_info "Setup started at $(date)"
    log_info "Project root: ${PROJECT_ROOT}"
    log_info "Log file: ${LOG_FILE}"
}

detect_linux_distribution() {
    log_step "1/9" "Detecting Linux distribution"

    if [[ -f /etc/os-release ]]; then
        source /etc/os-release
        log_info "Distribution: ${PRETTY_NAME:-${NAME:-Unknown}}"
        log_info "Version: ${VERSION:-Unknown}"

        # Set package manager based on distribution
        case "${ID:-unknown}" in
            ubuntu|debian)
                PACKAGE_MANAGER="apt"
                PACKAGE_UPDATE="apt update"
                PACKAGE_INSTALL="apt install -y"
                ;;
            centos|rhel|fedora)
                if command_exists dnf; then
                    PACKAGE_MANAGER="dnf"
                    PACKAGE_UPDATE="dnf check-update || true"
                    PACKAGE_INSTALL="dnf install -y"
                else
                    PACKAGE_MANAGER="yum"
                    PACKAGE_UPDATE="yum check-update || true"
                    PACKAGE_INSTALL="yum install -y"
                fi
                ;;
            arch)
                PACKAGE_MANAGER="pacman"
                PACKAGE_UPDATE="pacman -Sy"
                PACKAGE_INSTALL="pacman -S --noconfirm"
                ;;
            *)
                log_warning "Unknown distribution: ${ID:-unknown}"
                log_warning "Assuming apt package manager"
                PACKAGE_MANAGER="apt"
                PACKAGE_UPDATE="apt update"
                PACKAGE_INSTALL="apt install -y"
                ;;
        esac

        log_success "Package manager: ${PACKAGE_MANAGER}"
    else
        log_error "/etc/os-release not found"
        exit 1
    fi
}

check_system_requirements() {
    log_step "2/9" "Checking system requirements"

    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. Consider using a non-root user for development."
    fi

    # Check available disk space (minimum 5GB)
    local available_space
    available_space=$(df "${PROJECT_ROOT}" | awk 'NR==2 {print $4}')
    local available_gb=$((available_space / 1024 / 1024))

    if [[ $available_gb -lt 5 ]]; then
        log_error "Insufficient disk space. Available: ${available_gb}GB, Required: 5GB"
        exit 1
    else
        log_success "Disk space: ${available_gb}GB available"
    fi

    # Check memory (minimum 2GB)
    local total_memory
    total_memory=$(free -m | awk 'NR==2{print $2}')
    local total_gb=$((total_memory / 1024))

    if [[ $total_gb -lt 2 ]]; then
        log_warning "Low memory detected: ${total_gb}GB. Recommended: 4GB+"
    else
        log_success "Memory: ${total_gb}GB available"
    fi
}

install_system_packages() {
    log_step "3/9" "Installing system packages"

    # Update package lists
    log_info "Updating package lists..."
    if ! sudo $PACKAGE_UPDATE; then
        log_error "Failed to update package lists"
        exit 1
    fi

    # Install required packages
    local missing_packages=()
    for package in "${REQUIRED_PACKAGES[@]}"; do
        if ! dpkg -l | grep -q "^ii  $package "; then
            missing_packages+=("$package")
        fi
    done

    if [[ ${#missing_packages[@]} -gt 0 ]]; then
        log_info "Installing missing packages: ${missing_packages[*]}"
        if ! sudo $PACKAGE_INSTALL "${missing_packages[@]}"; then
            log_error "Failed to install system packages"
            exit 1
        fi
        log_success "System packages installed"
    else
        log_success "All required system packages are already installed"
    fi
}

install_nodejs() {
    log_step "4/9" "Installing Node.js"

    local current_version
    current_version=$(get_version "node" "--version")

    if [[ "$current_version" != "not_installed" ]] && version_gte "$current_version" "$NODE_VERSION"; then
        log_success "Node.js is already installed: v${current_version}"
        return
    fi

    # Install Node.js using NodeSource repository
    log_info "Installing Node.js ${NODE_VERSION}..."

    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

    # Install Node.js
    if ! sudo $PACKAGE_INSTALL nodejs; then
        log_error "Failed to install Node.js"
        exit 1
    fi

    # Verify installation
    local installed_version
    installed_version=$(get_version "node" "--version")
    if version_gte "$installed_version" "$NODE_VERSION"; then
        log_success "Node.js installed: v${installed_version}"
    else
        log_error "Node.js installation failed or version mismatch"
        exit 1
    fi

    # Update npm to latest version
    log_info "Updating npm..."
    if ! sudo npm install -g npm@latest; then
        log_warning "Failed to update npm"
    else
        local npm_version
        npm_version=$(get_version "npm" "--version")
        log_success "npm updated: v${npm_version}"
    fi
}

install_docker() {
    log_step "5/9" "Installing Docker"

    local current_version
    current_version=$(get_version "docker" "--version")

    if [[ "$current_version" != "not_installed" ]] && version_gte "$current_version" "$DOCKER_MIN_VERSION"; then
        log_success "Docker is already installed: v${current_version}"

        # Check if Docker service is running
        if systemctl is-active --quiet docker; then
            log_success "Docker service is running"
        else
            log_info "Starting Docker service..."
            sudo systemctl start docker
            sudo systemctl enable docker
            log_success "Docker service started and enabled"
        fi
        return
    fi

    log_info "Installing Docker..."

    # Remove old versions
    sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Update package lists
    sudo apt update

    # Install Docker
    if ! sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin; then
        log_error "Failed to install Docker"
        exit 1
    fi

    # Add current user to docker group
    sudo usermod -aG docker "$USER"

    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker

    # Verify installation
    local installed_version
    installed_version=$(get_version "docker" "--version")
    if version_gte "$installed_version" "$DOCKER_MIN_VERSION"; then
        log_success "Docker installed: v${installed_version}"
        log_warning "Please log out and log back in for Docker group membership to take effect"
    else
        log_error "Docker installation failed or version mismatch"
        exit 1
    fi
}

check_ports() {
    log_step "6/9" "Checking required ports"

    local blocked_ports=()
    for port in "${REQUIRED_PORTS[@]}"; do
        if ! is_port_available "$port"; then
            blocked_ports+=("$port")
        fi
    done

    if [[ ${#blocked_ports[@]} -gt 0 ]]; then
        log_warning "The following ports are in use: ${blocked_ports[*]}"
        log_warning "Please stop services using these ports or they will conflict with the application"

        # Show what's using the ports
        for port in "${blocked_ports[@]}"; do
            local process
            process=$(netstat -tulpn 2>/dev/null | grep ":${port} " | awk '{print $7}' | head -n1)
            if [[ -n "$process" ]]; then
                log_info "Port ${port} is used by: ${process}"
            fi
        done
    else
        log_success "All required ports are available: ${REQUIRED_PORTS[*]}"
    fi
}

setup_directories() {
    log_step "7/9" "Setting up project directories"

    cd "$PROJECT_ROOT"

    for dir in "${DIRECTORIES[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            log_info "Created directory: $dir"
        else
            log_info "Directory already exists: $dir"
        fi
    done

    log_success "Project directories set up"
}

setup_environment_files() {
    log_step "8/9" "Setting up environment files"

    cd "$PROJECT_ROOT"

    for env_mapping in "${ENV_FILES[@]}"; do
        local source="${env_mapping%:*}"
        local target="${env_mapping#*:}"

        if [[ ! -f "$source" ]]; then
            log_warning "Environment template not found: $source"
            continue
        fi

        if [[ ! -f "$target" ]]; then
            cp "$source" "$target"
            log_success "Created environment file: $target"
        else
            log_info "Environment file already exists: $target"
        fi
    done
}

install_dependencies() {
    log_step "9/9" "Installing project dependencies"

    cd "$PROJECT_ROOT"

    # Install backend dependencies
    if [[ -f "backend/package.json" ]]; then
        log_info "Installing backend dependencies..."
        cd backend
        if npm ci --silent; then
            log_success "Backend dependencies installed"
        else
            log_error "Failed to install backend dependencies"
            exit 1
        fi
        cd ..
    else
        log_warning "Backend package.json not found"
    fi

    # Install frontend dependencies
    if [[ -f "frontend/package.json" ]]; then
        log_info "Installing frontend dependencies..."
        cd frontend
        if npm ci --silent; then
            log_success "Frontend dependencies installed"
        else
            log_error "Failed to install frontend dependencies"
            exit 1
        fi
        cd ..
    else
        log_warning "Frontend package.json not found"
    fi

    # Install root dependencies if package.json exists
    if [[ -f "package.json" ]]; then
        log_info "Installing root dependencies..."
        if npm ci --silent; then
            log_success "Root dependencies installed"
        else
            log_warning "Failed to install root dependencies"
        fi
    fi
}

verify_setup() {
    log_info "Verifying setup..."

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

    return $errors
}

print_summary() {
    echo ""
    echo "============================================================"
    log_success "🎉 Linux Development Environment Setup Complete!"
    echo "============================================================"
    echo ""
    echo "📊 Setup Summary:"
    echo "  Platform: Linux ($(lsb_release -d 2>/dev/null | cut -f2 || echo "Unknown"))"
    echo "  Project Root: ${PROJECT_ROOT}"
    echo "  Log File: ${LOG_FILE}"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Log out and log back in (for Docker group membership)"
    echo "  2. Start the development environment:"
    echo "     cd ${PROJECT_ROOT}"
    echo "     docker-compose -f docker-compose.dev.yml up -d"
    echo "  3. Start the application:"
    echo "     npm run dev"
    echo ""
    echo "📁 Access URLs:"
    echo "  • Frontend: http://localhost:3000"
    echo "  • Backend API: http://localhost:8000"
    echo "  • API Documentation: http://localhost:8000/docs"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  • Check services: docker-compose -f docker-compose.dev.yml ps"
    echo "  • View logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "  • Stop services: docker-compose -f docker-compose.dev.yml down"
    echo ""
    echo "============================================================"
}

# ===================================
# Main Execution
# ===================================
main() {
    # Parse command line arguments
    local skip_deps=false
    local verbose=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-deps)
                skip_deps=true
                shift
                ;;
            --verbose|-v)
                verbose=true
                shift
                ;;
            --help|-h)
                echo "Linux Development Environment Setup"
                echo ""
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --skip-deps    Skip dependency installation"
                echo "  --verbose, -v  Enable verbose logging"
                echo "  --help, -h     Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                    # Full setup"
                echo "  $0 --skip-deps       # Setup without installing dependencies"
                echo "  $0 --verbose          # Setup with verbose logging"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Set verbose mode
    if [[ "$verbose" == true ]]; then
        set -x
    fi

    # Start setup
    setup_logging

    log_info "🚀 Starting Linux development environment setup"
    log_info "Options: skip_deps=$skip_deps, verbose=$verbose"

    detect_linux_distribution
    check_system_requirements
    install_system_packages
    install_nodejs
    install_docker
    check_ports
    setup_directories
    setup_environment_files

    if [[ "$skip_deps" != true ]]; then
        install_dependencies
    else
        log_info "Skipping dependency installation (--skip-deps)"
    fi

    if verify_setup; then
        print_summary
        log_success "Setup completed successfully!"
        exit 0
    else
        log_error "Setup completed with errors. Please check the log file: ${LOG_FILE}"
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
