# ===================================
# Task Management System - Frontend Dockerfile
# ===================================
# Generated for TSK-009-ENV-frontend-dockerfile
# Project: Task Management System
# Component: Frontend React Application
# Purpose: Multi-stage build for development, test, and production environments

# ===================================
# Base Stage - Common Dependencies
# ===================================
FROM node:20.11.0-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for security and performance
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S frontend -u 1001 -G nodejs

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# ===================================
# Dependencies Stage - Install Dependencies
# ===================================
FROM base AS dependencies

# Install production dependencies only
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Install development dependencies in separate layer
FROM base AS dev-dependencies
RUN npm ci --silent && \
    npm cache clean --force

# ===================================
# Development Stage
# ===================================
FROM dev-dependencies AS development

# Set development environment
ENV NODE_ENV=development
ENV PORT=3000
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV FAST_REFRESH=true

# Copy source code
COPY --chown=frontend:nodejs . .

# Create necessary directories
RUN mkdir -p build dist coverage && \
    chown -R frontend:nodejs build dist coverage

# Switch to non-root user
USER frontend

# Expose development port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start development server with hot reload
CMD ["dumb-init", "npm", "run", "dev"]

# ===================================
# Test Stage
# ===================================
FROM dev-dependencies AS test

# Set test environment
ENV NODE_ENV=test
ENV CI=true
ENV COVERAGE_THRESHOLD=90
ENV JEST_WORKERS=2
ENV GENERATE_SOURCEMAP=false

# Copy source code
COPY --chown=frontend:nodejs . .

# Create test directories
RUN mkdir -p coverage test-results && \
    chown -R frontend:nodejs coverage test-results

# Switch to non-root user
USER frontend

# Health check for test environment
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Run tests with coverage
CMD ["dumb-init", "npm", "run", "test:ci"]

# ===================================
# E2E Test Stage
# ===================================
FROM dev-dependencies AS e2e

# Install Playwright browsers
RUN npx playwright install --with-deps chromium firefox webkit

# Set E2E test environment
ENV NODE_ENV=test
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV HEADLESS=true
ENV TIMEOUT=60000

# Copy source code
COPY --chown=frontend:nodejs . .

# Create E2E test directories
RUN mkdir -p test-results playwright-report && \
    chown -R frontend:nodejs test-results playwright-report

# Switch to non-root user
USER frontend

# Run E2E tests
CMD ["dumb-init", "npm", "run", "test:e2e:ci"]

# ===================================
# Build Stage - Compile React App
# ===================================
FROM dev-dependencies AS build

# Set build environment
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false

# Copy source code
COPY --chown=frontend:nodejs . .

# Build React application
RUN npm run build && \
    npm cache clean --force

# ===================================
# Production Stage - Nginx Serve
# ===================================
FROM nginx:1.25.3-alpine AS production

# Install security tools
RUN apk add --no-cache \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S frontend -u 1001 -G nginx-app

# Copy built application from build stage
COPY --from=build --chown=frontend:nginx-app /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --chown=frontend:nginx-app nginx.conf /etc/nginx/nginx.conf
COPY --chown=frontend:nginx-app nginx-default.conf /etc/nginx/conf.d/default.conf

# Create necessary directories
RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run && \
    chown -R frontend:nginx-app /var/log/nginx /var/cache/nginx /var/run /usr/share/nginx/html

# Switch to non-root user
USER frontend

# Expose production port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
