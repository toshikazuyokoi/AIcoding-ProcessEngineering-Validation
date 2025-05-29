# ===================================
# Task Management System - Backend Dockerfile
# ===================================
# Generated for TSK-007-ENV-backend-dockerfile
# Project: Task Management System
# Component: Backend API Server
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
    adduser -S backend -u 1001 -G nodejs

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# ===================================
# Dependencies Stage - Install Dependencies
# ===================================
FROM base AS dependencies

# Install all dependencies (including devDependencies)
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
ENV PORT=8000
ENV LOG_LEVEL=debug

# Copy source code
COPY --chown=backend:nodejs . .

# Create necessary directories
RUN mkdir -p logs dist && \
    chown -R backend:nodejs logs dist

# Switch to non-root user
USER backend

# Expose development port and debugger port
EXPOSE 8000 9229

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start development server with hot reload and debugging
CMD ["dumb-init", "npm", "run", "dev:debug"]

# ===================================
# Test Stage
# ===================================
FROM dev-dependencies AS test

# Set test environment
ENV NODE_ENV=test
ENV PORT=8001
ENV LOG_LEVEL=error
ENV CI=true

# Copy source code
COPY --chown=backend:nodejs . .

# Create test directories
RUN mkdir -p logs coverage test-results && \
    chown -R backend:nodejs logs coverage test-results

# Switch to non-root user
USER backend

# Expose test port
EXPOSE 8001

# Health check for test environment
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Run tests with coverage
CMD ["dumb-init", "npm", "run", "test:ci"]

# ===================================
# Build Stage - Compile TypeScript
# ===================================
FROM dev-dependencies AS build

# Set build environment
ENV NODE_ENV=production

# Copy source code
COPY --chown=backend:nodejs . .

# Build TypeScript to JavaScript
RUN npm run build && \
    npm prune --production && \
    npm cache clean --force

# ===================================
# Production Stage
# ===================================
FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=8000
ENV LOG_LEVEL=info

# Security: Run as non-root user
USER backend

# Copy production dependencies
COPY --from=dependencies --chown=backend:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=backend:nodejs /app/dist ./dist
COPY --from=build --chown=backend:nodejs /app/package*.json ./

# Copy necessary configuration files
COPY --chown=backend:nodejs prisma ./prisma/

# Create logs directory
RUN mkdir -p logs && \
    chown -R backend:nodejs logs

# Expose production port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start production server
CMD ["dumb-init", "node", "dist/index.js"]
