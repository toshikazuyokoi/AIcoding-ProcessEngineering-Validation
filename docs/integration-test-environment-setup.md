# Integration Test Environment Setup Guide

## 📋 **Document Information**

### **Document ID**: INT-ENV-SETUP-001
### **Created**: 2024-12-19
### **Last Updated**: 2024-12-19
### **Related Documents**: 
- TSK-IT-000-001-TestEnvironment
- integration-test-system-design.md
- integration-test-detailed-design.md

---

## 🎯 **Overview**

This document provides comprehensive instructions for setting up and managing the integration test environment for the Task Management System. The environment is designed to support both integration testing and E2E testing with complete isolation from production and development environments.

## 🏗️ **Architecture Overview**

### **Environment Components**
- **PostgreSQL Database**: Dedicated integration test database (port 5434)
- **Redis Cache**: Dedicated integration test cache (port 6381)
- **Backend Service**: Node.js API server for integration testing
- **Frontend Service**: React application for E2E testing
- **E2E Test Runner**: Playwright-based E2E test execution
- **Test Data Seeder**: Automated test data generation
- **Test Reporter**: Consolidated test result reporting

### **Network Configuration**
- **Network**: `integration-test-network` (172.22.0.0/16)
- **Isolation**: Complete network isolation from other environments
- **Port Mapping**: Dedicated ports to avoid conflicts

---

## 🚀 **Quick Start**

### **Prerequisites**
- Docker Desktop 4.20+ installed and running
- Docker Compose 2.20+ available
- At least 4GB RAM available for containers
- At least 10GB disk space available

### **Environment Setup**
```bash
# Start integration test environment
scripts\integration-test-env-setup.bat

# Wait for services to be ready (approximately 2-3 minutes)
# Check service health
docker-compose -f docker-compose.integration-test.yml ps
```

### **Environment Teardown**
```bash
# Stop integration test environment
scripts\integration-test-env-teardown.bat
```

---

## 📁 **File Structure**

```
project-root/
├── docker-compose.integration-test.yml    # Main Docker Compose configuration
├── .env.integration                        # Environment variables
├── scripts/
│   ├── integration-test-env-setup.bat     # Environment startup script
│   └── integration-test-env-teardown.bat  # Environment cleanup script
├── tests/
│   ├── support/
│   │   ├── database/
│   │   │   └── init-integration.sql       # Database initialization
│   │   └── reporting/
│   │       └── generate-integration-report.js
│   ├── integration/                       # Integration test files
│   └── e2e/                              # E2E test files
└── docs/
    └── integration-test-environment-setup.md
```

---

## ⚙️ **Configuration Details**

### **Database Configuration**
- **Host**: localhost
- **Port**: 5434
- **Database**: taskdb_integration
- **Username**: integration_user
- **Password**: integration_password_123
- **Connection URL**: `postgresql://integration_user:integration_password_123@localhost:5434/taskdb_integration`

### **Redis Configuration**
- **Host**: localhost
- **Port**: 6381
- **Password**: (none)
- **Connection URL**: `redis://localhost:6381`

### **Application Configuration**
- **Backend API**: http://localhost:8002
- **Frontend**: http://localhost:3000
- **Environment**: integration
- **Log Level**: warn

---

## 🧪 **Running Tests**

### **Integration Tests**
```bash
# Backend integration tests
docker-compose -f docker-compose.integration-test.yml run --rm backend-integration npm run test:integration

# Frontend integration tests
docker-compose -f docker-compose.integration-test.yml run --rm frontend-integration npm run test:integration
```

### **E2E Tests**
```bash
# Full E2E test suite
docker-compose -f docker-compose.integration-test.yml run --rm e2e-integration npm run test:e2e:integration

# Specific E2E test file
docker-compose -f docker-compose.integration-test.yml run --rm e2e-integration npm run test:e2e:integration -- tests/e2e/auth.e2e.test.ts
```

### **Test Reports**
```bash
# Generate comprehensive test report
docker-compose -f docker-compose.integration-test.yml run --rm integration-reporter

# View test coverage
docker-compose -f docker-compose.integration-test.yml exec backend-integration npm run coverage:view
```

---

## 🔍 **Monitoring and Debugging**

### **Service Health Checks**
```bash
# Check all services status
docker-compose -f docker-compose.integration-test.yml ps

# Check specific service health
docker-compose -f docker-compose.integration-test.yml exec postgres-integration pg_isready -U integration_user -d taskdb_integration
docker-compose -f docker-compose.integration-test.yml exec redis-integration redis-cli ping
curl -f http://localhost:8002/health
```

### **Log Monitoring**
```bash
# View all logs
docker-compose -f docker-compose.integration-test.yml logs -f

# View specific service logs
docker-compose -f docker-compose.integration-test.yml logs -f postgres-integration
docker-compose -f docker-compose.integration-test.yml logs -f backend-integration
docker-compose -f docker-compose.integration-test.yml logs -f e2e-integration
```

### **Resource Monitoring**
```bash
# Check container resource usage
docker stats

# Check Docker system usage
docker system df

# Check integration test volumes
docker volume ls --filter "label=com.docker.compose.project=integration-test"
```

---

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Port Conflicts**
- **Symptom**: Services fail to start with port binding errors
- **Solution**: Check if ports 5434, 6381, 8002 are available
- **Command**: `netstat -an | findstr "5434 6381 8002"`

#### **Database Connection Issues**
- **Symptom**: Backend cannot connect to database
- **Solution**: Verify database health and connection string
- **Commands**:
  ```bash
  docker-compose -f docker-compose.integration-test.yml logs postgres-integration
  docker-compose -f docker-compose.integration-test.yml exec postgres-integration pg_isready -U integration_user -d taskdb_integration
  ```

#### **Memory Issues**
- **Symptom**: Containers are killed or fail to start
- **Solution**: Increase Docker memory allocation to 4GB+
- **Check**: Docker Desktop → Settings → Resources → Memory

#### **Test Failures**
- **Symptom**: Tests fail unexpectedly
- **Solution**: Check test data seeding and service readiness
- **Commands**:
  ```bash
  docker-compose -f docker-compose.integration-test.yml run --rm integration-seeder
  docker-compose -f docker-compose.integration-test.yml logs backend-integration
  ```

### **Recovery Procedures**

#### **Full Environment Reset**
```bash
# Stop all services
scripts\integration-test-env-teardown.bat

# Remove all volumes and images (when prompted, choose 'y')
# Restart environment
scripts\integration-test-env-setup.bat
```

#### **Database Reset**
```bash
# Reset database only
docker-compose -f docker-compose.integration-test.yml stop postgres-integration
docker-compose -f docker-compose.integration-test.yml rm -f postgres-integration
docker volume rm integration-test_postgres_integration_data
docker-compose -f docker-compose.integration-test.yml up -d postgres-integration
```

---

## 📊 **Performance Expectations**

### **Startup Times**
- **Database Ready**: ~15 seconds
- **Redis Ready**: ~5 seconds
- **Backend Ready**: ~30 seconds
- **Frontend Ready**: ~45 seconds
- **Total Environment**: ~2-3 minutes

### **Test Execution Times**
- **Integration Tests**: ~5-15 minutes
- **E2E Tests**: ~10-30 minutes
- **Full Test Suite**: ~15-45 minutes

### **Resource Usage**
- **Memory**: ~2-4 GB
- **CPU**: ~2-4 cores during testing
- **Disk**: ~5-10 GB (including images and volumes)

---

## 🔒 **Security Considerations**

### **Test Environment Isolation**
- Dedicated network subnet (172.22.0.0/16)
- Non-standard ports to avoid conflicts
- Test-only credentials (never use in production)
- Automatic cleanup of sensitive data

### **Credential Management**
- All credentials are test-only and documented
- No production credentials should ever be used
- Environment variables are clearly marked as test-only

---

## 📝 **Maintenance**

### **Regular Tasks**
- **Weekly**: Clean up unused Docker resources
- **Monthly**: Update base images and dependencies
- **Quarterly**: Review and update test data sets

### **Cleanup Commands**
```bash
# Clean up Docker system
docker system prune -a --volumes

# Clean up integration test resources specifically
docker-compose -f docker-compose.integration-test.yml down --volumes --rmi all
```

---

## 📞 **Support**

### **Documentation References**
- Docker Compose Documentation: https://docs.docker.com/compose/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Redis Documentation: https://redis.io/documentation
- Playwright Documentation: https://playwright.dev/docs/

### **Project-Specific Documentation**
- Integration Test Strategy: `docs/project-integration-test-specific/step4-test-design/integration-test-strategy.md`
- System Design: `docs/project-integration-test-specific/step2-system-design/integration-test-system-design.md`
- Detailed Design: `docs/project-integration-test-specific/step3-detailed-design/integration-test-detailed-design.md`

---

## ✅ **Completion Checklist**

### **Environment Setup Verification**
- [ ] All services start successfully
- [ ] Database health check passes
- [ ] Redis health check passes
- [ ] Backend API responds to health check
- [ ] Test data seeding completes successfully
- [ ] Integration tests can be executed
- [ ] E2E tests can be executed
- [ ] Test reports are generated correctly
- [ ] Environment can be stopped and restarted
- [ ] Cleanup procedures work correctly

### **Documentation Verification**
- [ ] Setup instructions are clear and complete
- [ ] Troubleshooting guide covers common issues
- [ ] Configuration details are accurate
- [ ] Performance expectations are realistic
- [ ] Security considerations are addressed
