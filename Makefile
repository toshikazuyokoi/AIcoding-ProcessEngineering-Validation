# ===================================
# Task Management System Makefile
# ===================================
# Generated for TSK-003-ENV-makefile
# Project: Task Management System
# Architecture: 4-layer (Presentation/Application/Domain/Infrastructure)
# Tech Stack: Node.js + TypeScript + React + PostgreSQL + Redis

# ===================================
# Configuration
# ===================================
.PHONY: help install build test clean dev start stop restart logs status
.DEFAULT_GOAL := help

# Project directories
BACKEND_DIR := backend
FRONTEND_DIR := frontend
SCRIPTS_DIR := scripts
DOCS_DIR := docs

# Docker configuration
COMPOSE_FILE := docker-compose.yml
COMPOSE_DEV_FILE := docker-compose.dev.yml
COMPOSE_TEST_FILE := docker-compose.test.yml
COMPOSE_PROD_FILE := docker-compose.prod.yml

# Node.js configuration
NODE_VERSION := 20.11.0
NPM_VERSION := 10.2.4

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[0;37m
NC := \033[0m # No Color

# ===================================
# Help
# ===================================
help: ## Show this help message
	@echo "$(CYAN)Task Management System - Makefile Commands$(NC)"
	@echo "$(CYAN)============================================$(NC)"
	@echo ""
	@echo "$(YELLOW)🚀 Quick Start:$(NC)"
	@echo "  make setup     - Complete project setup"
	@echo "  make dev       - Start development environment"
	@echo "  make test      - Run all tests"
	@echo ""
	@echo "$(YELLOW)📋 Available Commands:$(NC)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# ===================================
# Environment Setup
# ===================================
setup: ## Complete project setup (install + env + db)
	@echo "$(BLUE)🔧 Setting up Task Management System...$(NC)"
	@$(MAKE) check-requirements
	@$(MAKE) install
	@$(MAKE) env-setup
	@$(MAKE) db-setup
	@echo "$(GREEN)✅ Setup completed successfully!$(NC)"

check-requirements: ## Check system requirements
	@echo "$(BLUE)🔍 Checking system requirements...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js is required but not installed.$(NC)"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)❌ npm is required but not installed.$(NC)"; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)❌ Docker is required but not installed.$(NC)"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "$(RED)❌ Docker Compose is required but not installed.$(NC)"; exit 1; }
	@echo "$(GREEN)✅ All requirements satisfied$(NC)"

install: ## Install all dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	@$(MAKE) install-backend
	@$(MAKE) install-frontend
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

install-backend: ## Install backend dependencies
	@echo "$(BLUE)📦 Installing backend dependencies...$(NC)"
	@cd $(BACKEND_DIR) && npm install
	@echo "$(GREEN)✅ Backend dependencies installed$(NC)"

install-frontend: ## Install frontend dependencies
	@echo "$(BLUE)📦 Installing frontend dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✅ Frontend dependencies installed$(NC)"

env-setup: ## Setup environment variables
	@echo "$(BLUE)⚙️ Setting up environment variables...$(NC)"
	@if [ ! -f $(BACKEND_DIR)/.env ]; then \
		cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env; \
		echo "$(GREEN)✅ Backend .env created$(NC)"; \
	else \
		echo "$(YELLOW)⚠️ Backend .env already exists$(NC)"; \
	fi
	@if [ ! -f $(FRONTEND_DIR)/.env ]; then \
		cp $(FRONTEND_DIR)/.env.example $(FRONTEND_DIR)/.env; \
		echo "$(GREEN)✅ Frontend .env created$(NC)"; \
	else \
		echo "$(YELLOW)⚠️ Frontend .env already exists$(NC)"; \
	fi

# ===================================
# Database Operations
# ===================================
db-setup: ## Setup database (start containers + migrate + seed)
	@echo "$(BLUE)🗄️ Setting up database...$(NC)"
	@$(MAKE) db-start
	@sleep 5
	@$(MAKE) db-migrate
	@$(MAKE) db-seed
	@echo "$(GREEN)✅ Database setup completed$(NC)"

db-start: ## Start database containers
	@echo "$(BLUE)🚀 Starting database containers...$(NC)"
	@docker-compose -f $(COMPOSE_DEV_FILE) up -d postgres redis
	@echo "$(GREEN)✅ Database containers started$(NC)"

db-stop: ## Stop database containers
	@echo "$(BLUE)🛑 Stopping database containers...$(NC)"
	@docker-compose -f $(COMPOSE_DEV_FILE) stop postgres redis
	@echo "$(GREEN)✅ Database containers stopped$(NC)"

db-migrate: ## Run database migrations
	@echo "$(BLUE)🔄 Running database migrations...$(NC)"
	@cd $(BACKEND_DIR) && npx prisma migrate dev
	@echo "$(GREEN)✅ Database migrations completed$(NC)"

db-seed: ## Seed database with initial data
	@echo "$(BLUE)🌱 Seeding database...$(NC)"
	@cd $(BACKEND_DIR) && npx prisma db seed
	@echo "$(GREEN)✅ Database seeded$(NC)"

db-reset: ## Reset database (drop + migrate + seed)
	@echo "$(BLUE)🔄 Resetting database...$(NC)"
	@cd $(BACKEND_DIR) && npx prisma migrate reset --force
	@$(MAKE) db-seed
	@echo "$(GREEN)✅ Database reset completed$(NC)"

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)🎨 Opening Prisma Studio...$(NC)"
	@cd $(BACKEND_DIR) && npx prisma studio

# ===================================
# Development
# ===================================
dev: ## Start development environment
	@echo "$(BLUE)🚀 Starting development environment...$(NC)"
	@$(MAKE) db-start
	@sleep 3
	@echo "$(BLUE)🚀 Starting backend and frontend...$(NC)"
	@trap 'kill %1 %2' INT; \
	cd $(BACKEND_DIR) && npm run dev & \
	cd $(FRONTEND_DIR) && npm run dev & \
	wait

dev-backend: ## Start backend development server
	@echo "$(BLUE)🚀 Starting backend development server...$(NC)"
	@cd $(BACKEND_DIR) && npm run dev

dev-frontend: ## Start frontend development server
	@echo "$(BLUE)🚀 Starting frontend development server...$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev

dev-watch: ## Start development with file watching
	@echo "$(BLUE)🚀 Starting development with file watching...$(NC)"
	@$(MAKE) db-start
	@sleep 3
	@trap 'kill %1 %2' INT; \
	cd $(BACKEND_DIR) && npm run dev:watch & \
	cd $(FRONTEND_DIR) && npm run dev & \
	wait

# ===================================
# Build
# ===================================
build: ## Build all applications
	@echo "$(BLUE)🔨 Building applications...$(NC)"
	@$(MAKE) build-backend
	@$(MAKE) build-frontend
	@echo "$(GREEN)✅ Build completed$(NC)"

build-backend: ## Build backend application
	@echo "$(BLUE)🔨 Building backend...$(NC)"
	@cd $(BACKEND_DIR) && npm run build
	@echo "$(GREEN)✅ Backend build completed$(NC)"

build-frontend: ## Build frontend application
	@echo "$(BLUE)🔨 Building frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)✅ Frontend build completed$(NC)"

# ===================================
# Testing
# ===================================
test: ## Run all tests
	@echo "$(BLUE)🧪 Running all tests...$(NC)"
	@$(MAKE) test-backend
	@$(MAKE) test-frontend
	@echo "$(GREEN)✅ All tests completed$(NC)"

test-backend: ## Run backend tests
	@echo "$(BLUE)🧪 Running backend tests...$(NC)"
	@cd $(BACKEND_DIR) && npm test
	@echo "$(GREEN)✅ Backend tests completed$(NC)"

test-frontend: ## Run frontend tests
	@echo "$(BLUE)🧪 Running frontend tests...$(NC)"
	@cd $(FRONTEND_DIR) && npm test
	@echo "$(GREEN)✅ Frontend tests completed$(NC)"

test-coverage: ## Run tests with coverage
	@echo "$(BLUE)🧪 Running tests with coverage...$(NC)"
	@cd $(BACKEND_DIR) && npm run test:coverage
	@cd $(FRONTEND_DIR) && npm run test:coverage
	@echo "$(GREEN)✅ Coverage tests completed$(NC)"

test-e2e: ## Run E2E tests
	@echo "$(BLUE)🧪 Running E2E tests...$(NC)"
	@cd $(FRONTEND_DIR) && npm run test:e2e
	@echo "$(GREEN)✅ E2E tests completed$(NC)"

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)🧪 Running tests in watch mode...$(NC)"
	@trap 'kill %1 %2' INT; \
	cd $(BACKEND_DIR) && npm run test:watch & \
	cd $(FRONTEND_DIR) && npm run test:watch & \
	wait

# ===================================
# Code Quality
# ===================================
lint: ## Run linting
	@echo "$(BLUE)🔍 Running linting...$(NC)"
	@cd $(BACKEND_DIR) && npm run lint
	@cd $(FRONTEND_DIR) && npm run lint
	@echo "$(GREEN)✅ Linting completed$(NC)"

lint-fix: ## Fix linting issues
	@echo "$(BLUE)🔧 Fixing linting issues...$(NC)"
	@cd $(BACKEND_DIR) && npm run lint:fix
	@cd $(FRONTEND_DIR) && npm run lint:fix
	@echo "$(GREEN)✅ Linting fixes applied$(NC)"

format: ## Format code
	@echo "$(BLUE)💅 Formatting code...$(NC)"
	@cd $(BACKEND_DIR) && npm run format
	@cd $(FRONTEND_DIR) && npm run format
	@echo "$(GREEN)✅ Code formatting completed$(NC)"

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)🔍 Running type checking...$(NC)"
	@cd $(BACKEND_DIR) && npm run type-check
	@cd $(FRONTEND_DIR) && npm run type-check
	@echo "$(GREEN)✅ Type checking completed$(NC)"

quality-check: ## Run all quality checks
	@echo "$(BLUE)🔍 Running quality checks...$(NC)"
	@$(MAKE) lint
	@$(MAKE) type-check
	@$(MAKE) test-coverage
	@$(MAKE) security-audit
	@echo "$(GREEN)✅ Quality checks completed$(NC)"

# ===================================
# Security
# ===================================
security-audit: ## Run security audit
	@echo "$(BLUE)🔒 Running security audit...$(NC)"
	@cd $(BACKEND_DIR) && npm audit --audit-level moderate
	@cd $(FRONTEND_DIR) && npm audit --audit-level moderate
	@echo "$(GREEN)✅ Security audit completed$(NC)"

security-fix: ## Fix security vulnerabilities
	@echo "$(BLUE)🔧 Fixing security vulnerabilities...$(NC)"
	@cd $(BACKEND_DIR) && npm audit fix
	@cd $(FRONTEND_DIR) && npm audit fix
	@echo "$(GREEN)✅ Security fixes applied$(NC)"

# ===================================
# Docker Operations
# ===================================
docker-build: ## Build Docker images
	@echo "$(BLUE)🐳 Building Docker images...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✅ Docker images built$(NC)"

docker-up: ## Start all services with Docker
	@echo "$(BLUE)🐳 Starting all services...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ All services started$(NC)"

docker-down: ## Stop all services
	@echo "$(BLUE)🐳 Stopping all services...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ All services stopped$(NC)"

docker-restart: ## Restart all services
	@echo "$(BLUE)🐳 Restarting all services...$(NC)"
	@$(MAKE) docker-down
	@$(MAKE) docker-up
	@echo "$(GREEN)✅ All services restarted$(NC)"

docker-logs: ## Show Docker logs
	@echo "$(BLUE)📋 Showing Docker logs...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) logs -f

docker-status: ## Show Docker container status
	@echo "$(BLUE)📊 Docker container status:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) ps

docker-clean: ## Clean Docker resources
	@echo "$(BLUE)🧹 Cleaning Docker resources...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	@docker system prune -f
	@echo "$(GREEN)✅ Docker cleanup completed$(NC)"

# ===================================
# Production Operations
# ===================================
prod-build: ## Build for production
	@echo "$(BLUE)🏭 Building for production...$(NC)"
	@$(MAKE) build
	@docker-compose -f $(COMPOSE_PROD_FILE) build
	@echo "$(GREEN)✅ Production build completed$(NC)"

prod-up: ## Start production environment
	@echo "$(BLUE)🏭 Starting production environment...$(NC)"
	@docker-compose -f $(COMPOSE_PROD_FILE) up -d
	@echo "$(GREEN)✅ Production environment started$(NC)"

prod-down: ## Stop production environment
	@echo "$(BLUE)🏭 Stopping production environment...$(NC)"
	@docker-compose -f $(COMPOSE_PROD_FILE) down
	@echo "$(GREEN)✅ Production environment stopped$(NC)"

prod-logs: ## Show production logs
	@echo "$(BLUE)📋 Showing production logs...$(NC)"
	@docker-compose -f $(COMPOSE_PROD_FILE) logs -f

# ===================================
# Maintenance
# ===================================
clean: ## Clean build artifacts and dependencies
	@echo "$(BLUE)🧹 Cleaning build artifacts...$(NC)"
	@rm -rf $(BACKEND_DIR)/dist
	@rm -rf $(BACKEND_DIR)/node_modules
	@rm -rf $(FRONTEND_DIR)/dist
	@rm -rf $(FRONTEND_DIR)/build
	@rm -rf $(FRONTEND_DIR)/node_modules
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

clean-cache: ## Clean npm cache
	@echo "$(BLUE)🧹 Cleaning npm cache...$(NC)"
	@npm cache clean --force
	@echo "$(GREEN)✅ Cache cleanup completed$(NC)"

update-deps: ## Update dependencies
	@echo "$(BLUE)📦 Updating dependencies...$(NC)"
	@cd $(BACKEND_DIR) && npm update
	@cd $(FRONTEND_DIR) && npm update
	@echo "$(GREEN)✅ Dependencies updated$(NC)"

backup-db: ## Backup database
	@echo "$(BLUE)💾 Creating database backup...$(NC)"
	@mkdir -p backups
	@docker exec $$(docker-compose -f $(COMPOSE_FILE) ps -q postgres) pg_dump -U postgres taskdb > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Database backup created$(NC)"

restore-db: ## Restore database from backup (usage: make restore-db BACKUP_FILE=backup.sql)
	@echo "$(BLUE)🔄 Restoring database from backup...$(NC)"
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)❌ Please specify BACKUP_FILE parameter$(NC)"; \
		exit 1; \
	fi
	@docker exec -i $$(docker-compose -f $(COMPOSE_FILE) ps -q postgres) psql -U postgres -d taskdb < $(BACKUP_FILE)
	@echo "$(GREEN)✅ Database restored$(NC)"

# ===================================
# Monitoring & Health Checks
# ===================================
health: ## Check application health
	@echo "$(BLUE)🏥 Checking application health...$(NC)"
	@curl -f http://localhost:8000/health || echo "$(RED)❌ Backend health check failed$(NC)"
	@curl -f http://localhost:3000 || echo "$(RED)❌ Frontend health check failed$(NC)"
	@echo "$(GREEN)✅ Health checks completed$(NC)"

logs: ## Show application logs
	@echo "$(BLUE)📋 Showing application logs...$(NC)"
	@tail -f $(BACKEND_DIR)/logs/*.log $(FRONTEND_DIR)/logs/*.log 2>/dev/null || echo "$(YELLOW)⚠️ No log files found$(NC)"

monitor: ## Monitor system resources
	@echo "$(BLUE)📊 System resource monitoring:$(NC)"
	@echo "$(YELLOW)CPU Usage:$(NC)"
	@top -bn1 | grep "Cpu(s)" | awk '{print $$2}' | cut -d'%' -f1
	@echo "$(YELLOW)Memory Usage:$(NC)"
	@free -h | grep '^Mem:' | awk '{print $$3 "/" $$2}'
	@echo "$(YELLOW)Disk Usage:$(NC)"
	@df -h | grep '^/dev/'

# ===================================
# Documentation
# ===================================
docs-serve: ## Serve documentation locally
	@echo "$(BLUE)📚 Serving documentation...$(NC)"
	@if command -v python3 >/dev/null 2>&1; then \
		cd $(DOCS_DIR) && python3 -m http.server 8080; \
	elif command -v python >/dev/null 2>&1; then \
		cd $(DOCS_DIR) && python -m SimpleHTTPServer 8080; \
	else \
		echo "$(RED)❌ Python is required to serve documentation$(NC)"; \
	fi

docs-build: ## Build documentation
	@echo "$(BLUE)📚 Building documentation...$(NC)"
	@if [ -f $(DOCS_DIR)/package.json ]; then \
		cd $(DOCS_DIR) && npm install && npm run build; \
	else \
		echo "$(YELLOW)⚠️ No documentation build script found$(NC)"; \
	fi

# ===================================
# Utility Commands
# ===================================
version: ## Show version information
	@echo "$(CYAN)Task Management System - Version Information$(NC)"
	@echo "$(CYAN)===========================================$(NC)"
	@echo "$(YELLOW)Node.js:$(NC) $$(node --version)"
	@echo "$(YELLOW)npm:$(NC) $$(npm --version)"
	@echo "$(YELLOW)Docker:$(NC) $$(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
	@echo "$(YELLOW)Docker Compose:$(NC) $$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)"

info: ## Show project information
	@echo "$(CYAN)Task Management System - Project Information$(NC)"
	@echo "$(CYAN)===========================================$(NC)"
	@echo "$(YELLOW)Project:$(NC) Task Management System"
	@echo "$(YELLOW)Architecture:$(NC) 4-layer (Presentation/Application/Domain/Infrastructure)"
	@echo "$(YELLOW)Backend:$(NC) Node.js + TypeScript + Express + PostgreSQL"
	@echo "$(YELLOW)Frontend:$(NC) React + TypeScript + MUI"
	@echo "$(YELLOW)Database:$(NC) PostgreSQL + Redis"
	@echo "$(YELLOW)Testing:$(NC) Jest + Playwright"

ports: ## Show used ports
	@echo "$(CYAN)Task Management System - Port Usage$(NC)"
	@echo "$(CYAN)================================$(NC)"
	@echo "$(YELLOW)Frontend:$(NC) http://localhost:3000"
	@echo "$(YELLOW)Backend API:$(NC) http://localhost:8000"
	@echo "$(YELLOW)PostgreSQL:$(NC) localhost:5432"
	@echo "$(YELLOW)Redis:$(NC) localhost:6379"
	@echo "$(YELLOW)Prisma Studio:$(NC) http://localhost:5555"
	@echo "$(YELLOW)Documentation:$(NC) http://localhost:8080"
