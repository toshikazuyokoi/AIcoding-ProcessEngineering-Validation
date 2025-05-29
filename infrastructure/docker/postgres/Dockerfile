# ===================================
# Task Management System - PostgreSQL Dockerfile
# ===================================
# Generated for TSK-012-INF-postgres-dockerfile
# Project: Task Management System
# Component: PostgreSQL Database Server
# Purpose: Custom PostgreSQL image with security, performance, and monitoring enhancements

# ===================================
# Base Stage - PostgreSQL 16.1 Alpine
# ===================================
FROM postgres:16.1-alpine AS base

# Set metadata
LABEL maintainer="Task Management System Team"
LABEL version="1.0.0"
LABEL description="Custom PostgreSQL 16.1 with security and performance optimizations"

# Install system dependencies and tools
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata \
    bash \
    postgresql-contrib \
    postgresql-client \
    pg_stat_statements \
    && rm -rf /var/cache/apk/*

# ===================================
# Development Stage
# ===================================
FROM base AS development

# Set development environment
ENV POSTGRES_DB=taskdb_dev
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=dev_password_123
ENV POSTGRES_INITDB_ARGS="--encoding=UTF-8 --locale=C"
ENV TZ=Asia/Tokyo

# Development-specific PostgreSQL configuration
COPY ./config/postgresql-dev.conf /etc/postgresql/postgresql.conf
COPY ./config/pg_hba-dev.conf /etc/postgresql/pg_hba.conf

# Copy development initialization scripts
COPY ./init/init-dev.sql /docker-entrypoint-initdb.d/01-init-dev.sql
COPY ./init/extensions-dev.sql /docker-entrypoint-initdb.d/02-extensions-dev.sql
COPY ./init/users-dev.sql /docker-entrypoint-initdb.d/03-users-dev.sql
COPY ./init/permissions-dev.sql /docker-entrypoint-initdb.d/04-permissions-dev.sql

# Development monitoring and debugging tools
RUN apk add --no-cache \
    postgresql-dev \
    build-base \
    && rm -rf /var/cache/apk/*

# Create development directories
RUN mkdir -p /var/log/postgresql /var/lib/postgresql/backups \
    && chown -R postgres:postgres /var/log/postgresql /var/lib/postgresql/backups

# Health check for development
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

# Expose PostgreSQL port
EXPOSE 5432

# ===================================
# Test Stage
# ===================================
FROM base AS test

# Set test environment
ENV POSTGRES_DB=taskdb_test
ENV POSTGRES_USER=test_user
ENV POSTGRES_PASSWORD=test_password_123
ENV POSTGRES_INITDB_ARGS="--encoding=UTF-8 --locale=C"
ENV TZ=UTC

# Test-specific PostgreSQL configuration
COPY ./config/postgresql-test.conf /etc/postgresql/postgresql.conf
COPY ./config/pg_hba-test.conf /etc/postgresql/pg_hba.conf

# Copy test initialization scripts
COPY ./init/init-test.sql /docker-entrypoint-initdb.d/01-init-test.sql
COPY ./init/extensions-test.sql /docker-entrypoint-initdb.d/02-extensions-test.sql
COPY ./init/users-test.sql /docker-entrypoint-initdb.d/03-users-test.sql
COPY ./init/test-data.sql /docker-entrypoint-initdb.d/04-test-data.sql

# Test-specific optimizations
RUN echo "fsync = off" >> /usr/local/share/postgresql/postgresql.conf.sample \
    && echo "synchronous_commit = off" >> /usr/local/share/postgresql/postgresql.conf.sample \
    && echo "full_page_writes = off" >> /usr/local/share/postgresql/postgresql.conf.sample

# Create test directories
RUN mkdir -p /var/log/postgresql /tmp/test-results \
    && chown -R postgres:postgres /var/log/postgresql /tmp/test-results

# Health check for test
HEALTHCHECK --interval=5s --timeout=3s --start-period=15s --retries=5 \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

# Expose PostgreSQL port (different port for test isolation)
EXPOSE 5432

# ===================================
# Production Stage
# ===================================
FROM base AS production

# Set production environment
ENV POSTGRES_DB=taskdb
ENV POSTGRES_USER=postgres
ENV POSTGRES_INITDB_ARGS="--encoding=UTF-8 --locale=C"
ENV TZ=UTC

# Production-specific PostgreSQL configuration
COPY ./config/postgresql-prod.conf /etc/postgresql/postgresql.conf
COPY ./config/pg_hba-prod.conf /etc/postgresql/pg_hba.conf

# Copy production initialization scripts
COPY ./init/init-prod.sql /docker-entrypoint-initdb.d/01-init-prod.sql
COPY ./init/extensions-prod.sql /docker-entrypoint-initdb.d/02-extensions-prod.sql
COPY ./init/users-prod.sql /docker-entrypoint-initdb.d/03-users-prod.sql
COPY ./init/permissions-prod.sql /docker-entrypoint-initdb.d/04-permissions-prod.sql
COPY ./init/monitoring-prod.sql /docker-entrypoint-initdb.d/05-monitoring-prod.sql

# Production security and monitoring tools
RUN apk add --no-cache \
    logrotate \
    && rm -rf /var/cache/apk/*

# Create production directories with proper permissions
RUN mkdir -p \
    /var/log/postgresql \
    /var/lib/postgresql/backups \
    /var/lib/postgresql/archive \
    /var/lib/postgresql/scripts \
    && chown -R postgres:postgres \
    /var/log/postgresql \
    /var/lib/postgresql/backups \
    /var/lib/postgresql/archive \
    /var/lib/postgresql/scripts

# Copy production scripts
COPY ./scripts/backup.sh /var/lib/postgresql/scripts/backup.sh
COPY ./scripts/restore.sh /var/lib/postgresql/scripts/restore.sh
COPY ./scripts/maintenance.sh /var/lib/postgresql/scripts/maintenance.sh
COPY ./scripts/monitoring.sh /var/lib/postgresql/scripts/monitoring.sh

# Set script permissions
RUN chmod +x /var/lib/postgresql/scripts/*.sh \
    && chown postgres:postgres /var/lib/postgresql/scripts/*.sh

# Configure log rotation
COPY ./config/logrotate-postgres /etc/logrotate.d/postgresql

# Security hardening
RUN echo "postgres:*:*:*:*" > /etc/postgresql/.pgpass \
    && chmod 600 /etc/postgresql/.pgpass \
    && chown postgres:postgres /etc/postgresql/.pgpass

# Health check for production
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

# Expose PostgreSQL port
EXPOSE 5432

# ===================================
# Backup Stage
# ===================================
FROM production AS backup

# Backup-specific environment
ENV BACKUP_SCHEDULE="0 2 * * *"
ENV BACKUP_RETENTION_DAYS=30
ENV BACKUP_COMPRESSION=true

# Install backup tools
RUN apk add --no-cache \
    cron \
    gzip \
    aws-cli \
    && rm -rf /var/cache/apk/*

# Copy backup scripts
COPY ./scripts/backup-cron.sh /var/lib/postgresql/scripts/backup-cron.sh
COPY ./scripts/cleanup-backups.sh /var/lib/postgresql/scripts/cleanup-backups.sh
COPY ./scripts/upload-backup.sh /var/lib/postgresql/scripts/upload-backup.sh

# Set backup script permissions
RUN chmod +x /var/lib/postgresql/scripts/backup-*.sh \
    && chmod +x /var/lib/postgresql/scripts/cleanup-*.sh \
    && chmod +x /var/lib/postgresql/scripts/upload-*.sh

# Configure cron for automated backups
RUN echo "$BACKUP_SCHEDULE /var/lib/postgresql/scripts/backup-cron.sh" > /etc/crontabs/postgres \
    && chown postgres:postgres /etc/crontabs/postgres

# Create backup directories
RUN mkdir -p /var/lib/postgresql/backups/daily \
    /var/lib/postgresql/backups/weekly \
    /var/lib/postgresql/backups/monthly \
    && chown -R postgres:postgres /var/lib/postgresql/backups

# Backup health check
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=2 \
    CMD test -f /var/lib/postgresql/backups/latest.sql || exit 1

# Start cron daemon and PostgreSQL
CMD ["sh", "-c", "crond && docker-entrypoint.sh postgres"]

# ===================================
# Monitoring Stage
# ===================================
FROM production AS monitoring

# Monitoring-specific environment
ENV MONITORING_ENABLED=true
ENV METRICS_PORT=9187

# Install monitoring tools
RUN apk add --no-cache \
    prometheus-postgres-exporter \
    && rm -rf /var/cache/apk/*

# Copy monitoring configuration
COPY ./config/postgres-exporter.yml /etc/postgres-exporter/postgres-exporter.yml

# Copy monitoring scripts
COPY ./scripts/metrics-collector.sh /var/lib/postgresql/scripts/metrics-collector.sh
COPY ./scripts/alert-handler.sh /var/lib/postgresql/scripts/alert-handler.sh

# Set monitoring script permissions
RUN chmod +x /var/lib/postgresql/scripts/metrics-*.sh \
    && chmod +x /var/lib/postgresql/scripts/alert-*.sh

# Create monitoring directories
RUN mkdir -p /var/lib/postgresql/metrics \
    /var/log/postgresql/metrics \
    && chown -R postgres:postgres /var/lib/postgresql/metrics \
    /var/log/postgresql/metrics

# Expose monitoring port
EXPOSE 9187

# Monitoring health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9187/metrics || exit 1

# Start monitoring and PostgreSQL
CMD ["sh", "-c", "postgres_exporter --config.file=/etc/postgres-exporter/postgres-exporter.yml & docker-entrypoint.sh postgres"]
