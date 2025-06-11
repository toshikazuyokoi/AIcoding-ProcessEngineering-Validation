/**
 * ===================================
 * Integration Test Environment Startup Test
 * ===================================
 * Generated for TSK-IT-000-001-TestEnvironment
 * Project: Task Management System - Integration Test
 * Purpose: Verify integration test environment startup and connectivity
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Integration Test Environment Startup', () => {
  const COMPOSE_FILE = 'docker-compose.integration-test.yml';
  const ENV_FILE = '.env.integration';
  const TIMEOUT = 180000; // 3 minutes
  
  beforeAll(() => {
    // Ensure we're in the project root
    process.chdir(path.resolve(__dirname, '../../..'));
  });

  afterAll(async () => {
    // Cleanup: Stop integration test environment
    try {
      execSync(`docker-compose -f ${COMPOSE_FILE} down --remove-orphans`, {
        stdio: 'pipe',
        timeout: 30000
      });
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  });

  describe('Environment Configuration', () => {
    test('should have docker-compose.integration-test.yml file', () => {
      expect(fs.existsSync(COMPOSE_FILE)).toBe(true);
      
      const composeContent = fs.readFileSync(COMPOSE_FILE, 'utf8');
      expect(composeContent).toContain('version:');
      expect(composeContent).toContain('postgres-integration');
      expect(composeContent).toContain('redis-integration');
      expect(composeContent).toContain('backend-integration');
    });

    test('should have .env.integration file', () => {
      expect(fs.existsSync(ENV_FILE)).toBe(true);
      
      const envContent = fs.readFileSync(ENV_FILE, 'utf8');
      expect(envContent).toContain('NODE_ENV=integration');
      expect(envContent).toContain('DATABASE_URL=');
      expect(envContent).toContain('REDIS_URL=');
    });

    test('should have environment setup scripts', () => {
      expect(fs.existsSync('scripts/integration-test-env-setup.bat')).toBe(true);
      expect(fs.existsSync('scripts/integration-test-env-teardown.bat')).toBe(true);
    });

    test('should have environment documentation', () => {
      expect(fs.existsSync('docs/integration-test-environment-setup.md')).toBe(true);
    });
  });

  describe('Docker Environment', () => {
    test('should have Docker available', () => {
      expect(() => {
        execSync('docker --version', { stdio: 'pipe' });
      }).not.toThrow();
    });

    test('should have Docker Compose available', () => {
      expect(() => {
        execSync('docker-compose --version', { stdio: 'pipe' });
      }).not.toThrow();
    });

    test('should validate docker-compose.integration-test.yml syntax', () => {
      expect(() => {
        execSync(`docker-compose -f ${COMPOSE_FILE} config`, { stdio: 'pipe' });
      }).not.toThrow();
    });
  });

  describe('Environment Startup', () => {
    test('should start PostgreSQL integration service', async () => {
      // Start PostgreSQL service
      execSync(`docker-compose -f ${COMPOSE_FILE} up -d postgres-integration`, {
        stdio: 'pipe',
        timeout: 60000
      });

      // Wait for service to be ready
      await new Promise(resolve => setTimeout(resolve, 15000));

      // Check if PostgreSQL is ready
      const result = execSync(
        `docker-compose -f ${COMPOSE_FILE} exec -T postgres-integration pg_isready -U integration_user -d taskdb_integration`,
        { stdio: 'pipe', timeout: 10000 }
      );

      expect(result.toString()).toContain('accepting connections');
    }, TIMEOUT);

    test('should start Redis integration service', async () => {
      // Start Redis service
      execSync(`docker-compose -f ${COMPOSE_FILE} up -d redis-integration`, {
        stdio: 'pipe',
        timeout: 60000
      });

      // Wait for service to be ready
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Check if Redis is ready
      const result = execSync(
        `docker-compose -f ${COMPOSE_FILE} exec -T redis-integration redis-cli ping`,
        { stdio: 'pipe', timeout: 10000 }
      );

      expect(result.toString().trim()).toBe('PONG');
    }, TIMEOUT);

    test('should verify network connectivity between services', async () => {
      // Ensure both services are running
      execSync(`docker-compose -f ${COMPOSE_FILE} up -d postgres-integration redis-integration`, {
        stdio: 'pipe',
        timeout: 60000
      });

      await new Promise(resolve => setTimeout(resolve, 20000));

      // Test PostgreSQL connectivity from Redis container
      const pgConnectResult = execSync(
        `docker-compose -f ${COMPOSE_FILE} exec -T redis-integration nc -z postgres-integration 5432`,
        { stdio: 'pipe', timeout: 10000 }
      );

      expect(pgConnectResult).toBeDefined();

      // Test Redis connectivity from PostgreSQL container
      const redisConnectResult = execSync(
        `docker-compose -f ${COMPOSE_FILE} exec -T postgres-integration nc -z redis-integration 6379`,
        { stdio: 'pipe', timeout: 10000 }
      );

      expect(redisConnectResult).toBeDefined();
    }, TIMEOUT);
  });

  describe('Port Configuration', () => {
    test('should expose PostgreSQL on port 5434', async () => {
      execSync(`docker-compose -f ${COMPOSE_FILE} up -d postgres-integration`, {
        stdio: 'pipe',
        timeout: 60000
      });

      await new Promise(resolve => setTimeout(resolve, 15000));

      // Check if port 5434 is accessible
      const portCheck = execSync('netstat -an | findstr "5434"', {
        stdio: 'pipe',
        timeout: 5000
      });

      expect(portCheck.toString()).toContain('5434');
    }, TIMEOUT);

    test('should expose Redis on port 6381', async () => {
      execSync(`docker-compose -f ${COMPOSE_FILE} up -d redis-integration`, {
        stdio: 'pipe',
        timeout: 60000
      });

      await new Promise(resolve => setTimeout(resolve, 10000));

      // Check if port 6381 is accessible
      const portCheck = execSync('netstat -an | findstr "6381"', {
        stdio: 'pipe',
        timeout: 5000
      });

      expect(portCheck.toString()).toContain('6381');
    }, TIMEOUT);
  });

  describe('Environment Variables', () => {
    test('should load environment variables correctly', () => {
      const envContent = fs.readFileSync(ENV_FILE, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          envVars[key] = valueParts.join('=');
        }
      });

      expect(envVars.NODE_ENV).toBe('integration');
      expect(envVars.POSTGRES_PORT).toBe('5434');
      expect(envVars.REDIS_PORT).toBe('6381');
      expect(envVars.TEST_TYPE).toBe('integration');
    });

    test('should have secure test-only credentials', () => {
      const envContent = fs.readFileSync(ENV_FILE, 'utf8');
      
      expect(envContent).toContain('integration_password_123');
      expect(envContent).toContain('integration_jwt_secret_key_for_testing_only');
      expect(envContent).toContain('integration_session_secret_for_testing_only');
      
      // Ensure no production-like credentials
      expect(envContent).not.toContain('production');
      expect(envContent).not.toContain('prod');
      expect(envContent).not.toContain('live');
    });
  });

  describe('Volume and Data Persistence', () => {
    test('should create integration test volumes', async () => {
      execSync(`docker-compose -f ${COMPOSE_FILE} up -d postgres-integration redis-integration`, {
        stdio: 'pipe',
        timeout: 60000
      });

      await new Promise(resolve => setTimeout(resolve, 15000));

      // Check if volumes are created
      const volumes = execSync('docker volume ls --filter "name=integration-test"', {
        stdio: 'pipe',
        timeout: 10000
      });

      const volumeList = volumes.toString();
      expect(volumeList).toContain('postgres_integration_data');
      expect(volumeList).toContain('redis_integration_data');
    }, TIMEOUT);

    test('should isolate integration test data', async () => {
      execSync(`docker-compose -f ${COMPOSE_FILE} up -d postgres-integration`, {
        stdio: 'pipe',
        timeout: 60000
      });

      await new Promise(resolve => setTimeout(resolve, 15000));

      // Verify database isolation
      const dbList = execSync(
        `docker-compose -f ${COMPOSE_FILE} exec -T postgres-integration psql -U integration_user -d taskdb_integration -c "\\l"`,
        { stdio: 'pipe', timeout: 10000 }
      );

      expect(dbList.toString()).toContain('taskdb_integration');
      expect(dbList.toString()).not.toContain('taskdb'); // Should not see production DB
    }, TIMEOUT);
  });

  describe('Health Checks', () => {
    test('should have working health checks for all services', async () => {
      execSync(`docker-compose -f ${COMPOSE_FILE} up -d postgres-integration redis-integration`, {
        stdio: 'pipe',
        timeout: 60000
      });

      // Wait for health checks to stabilize
      await new Promise(resolve => setTimeout(resolve, 30000));

      // Check service health status
      const healthStatus = execSync(`docker-compose -f ${COMPOSE_FILE} ps`, {
        stdio: 'pipe',
        timeout: 10000
      });

      const statusOutput = healthStatus.toString();
      expect(statusOutput).toContain('postgres-integration');
      expect(statusOutput).toContain('redis-integration');
      
      // Should not contain 'unhealthy' status
      expect(statusOutput).not.toContain('unhealthy');
    }, TIMEOUT);
  });
});
