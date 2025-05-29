# ===================================
# Task Management System - Nginx Dockerfile
# ===================================
# Generated for TSK-015-INF-nginx-dockerfile
# Project: Task Management System
# Component: Nginx Reverse Proxy & Load Balancer
# Purpose: Multi-stage build for development, test, and production environments

# ===================================
# Base Stage - Common Dependencies
# ===================================
FROM nginx:1.25.3-alpine AS base

# Install system dependencies for security and performance
RUN apk add --no-cache \
    curl \
    ca-certificates \
    openssl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-user -u 1001 -G nginx-app

# Create necessary directories
RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run /etc/nginx/ssl && \
    chown -R nginx-user:nginx-app /var/log/nginx /var/cache/nginx /var/run /etc/nginx/ssl

# ===================================
# Development Stage
# ===================================
FROM base AS development

# Set development environment
ENV NGINX_ENV=development
ENV NGINX_LOG_LEVEL=debug

# Copy nginx configuration
COPY --chown=nginx-user:nginx-app nginx.conf /etc/nginx/nginx.conf

# Generate self-signed SSL certificates for development
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" && \
    chown -R nginx-user:nginx-app /etc/nginx/ssl

# Switch to non-root user
USER nginx-user

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

# ===================================
# Test Stage
# ===================================
FROM base AS test

# Set test environment
ENV NGINX_ENV=test
ENV NGINX_LOG_LEVEL=warn

# Copy nginx configuration
COPY --chown=nginx-user:nginx-app nginx.conf /etc/nginx/nginx.conf

# Generate self-signed SSL certificates for testing
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=TestOrg/CN=test.localhost" && \
    chown -R nginx-user:nginx-app /etc/nginx/ssl

# Create test directories
RUN mkdir -p /var/log/nginx/test && \
    chown -R nginx-user:nginx-app /var/log/nginx/test

# Switch to non-root user
USER nginx-user

# Expose test ports
EXPOSE 80 443

# Health check for test environment
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx for testing
CMD ["nginx", "-g", "daemon off;"]

# ===================================
# Production Stage
# ===================================
FROM base AS production

# Set production environment
ENV NGINX_ENV=production
ENV NGINX_LOG_LEVEL=error

# Copy nginx configuration
COPY --chown=nginx-user:nginx-app nginx.conf /etc/nginx/nginx.conf

# Create production directories
RUN mkdir -p /var/log/nginx/production && \
    chown -R nginx-user:nginx-app /var/log/nginx/production

# Switch to non-root user
USER nginx-user

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Health check for production
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx in production mode
CMD ["nginx", "-g", "daemon off;"]
