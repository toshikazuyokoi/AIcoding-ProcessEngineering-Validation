/**
 * ===================================
 * Simple AuthHelper Test (JavaScript)
 * ===================================
 * Purpose: Test basic JWT functionality without TypeScript complications
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Simple AuthHelper class in JavaScript
class SimpleAuthHelper {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'integration_jwt_secret_key_for_testing_only';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
  }

  generateJWTToken(userData) {
    try {
      const payload = {
        userId: userData.id,
        email: userData.email,
        role: userData.role
      };

      const accessToken = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn
      });

      // Calculate expiration time
      const decoded = jwt.decode(accessToken);
      const expiresIn = decoded && decoded.exp && decoded.iat ? decoded.exp - decoded.iat : 3600;

      return {
        accessToken,
        expiresIn,
        tokenType: 'Bearer'
      };
    } catch (error) {
      console.error('❌ Failed to generate JWT token:', error);
      throw error;
    }
  }

  verifyJWTToken(token) {
    try {
      const payload = jwt.verify(token, this.jwtSecret);
      return payload;
    } catch (error) {
      console.error('❌ Failed to verify JWT token:', error);
      throw error;
    }
  }

  decodeJWTToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('❌ Failed to decode JWT token:', error);
      return null;
    }
  }

  async hashPassword(password) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('❌ Failed to hash password:', error);
      throw error;
    }
  }

  async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('❌ Failed to verify password:', error);
      throw error;
    }
  }

  createTestCredentials(overrides = {}) {
    return {
      email: overrides.email || 'test@example.com',
      password: overrides.password || 'testpassword123'
    };
  }

  createTestUserData(overrides = {}) {
    return {
      id: overrides.id || `user-${Date.now()}`,
      email: overrides.email || 'test@example.com',
      username: overrides.username || 'testuser',
      role: overrides.role || 'user',
      isActive: overrides.isActive !== undefined ? overrides.isActive : true
    };
  }
}

describe('Simple AuthHelper Test', () => {
  let authHelper;

  beforeAll(() => {
    authHelper = new SimpleAuthHelper();
  });

  test('should create SimpleAuthHelper instance', () => {
    expect(authHelper).toBeInstanceOf(SimpleAuthHelper);
    expect(typeof authHelper.generateJWTToken).toBe('function');
    expect(typeof authHelper.verifyJWTToken).toBe('function');
  });

  test('should generate JWT token', () => {
    const userData = {
      id: 'user-test-1',
      email: 'test@example.com',
      username: 'testuser',
      role: 'user',
      isActive: true
    };

    const token = authHelper.generateJWTToken(userData);
    
    expect(token).toHaveProperty('accessToken');
    expect(token).toHaveProperty('expiresIn');
    expect(token).toHaveProperty('tokenType');
    expect(token.tokenType).toBe('Bearer');
    expect(typeof token.accessToken).toBe('string');
    expect(typeof token.expiresIn).toBe('number');
    expect(token.accessToken.length).toBeGreaterThan(0);
  });

  test('should verify JWT token', () => {
    const userData = {
      id: 'user-test-2',
      email: 'verify@example.com',
      username: 'verifyuser',
      role: 'user',
      isActive: true
    };

    const token = authHelper.generateJWTToken(userData);
    const payload = authHelper.verifyJWTToken(token.accessToken);
    
    expect(payload).toHaveProperty('userId');
    expect(payload).toHaveProperty('email');
    expect(payload).toHaveProperty('role');
    expect(payload.userId).toBe(userData.id);
    expect(payload.email).toBe(userData.email);
    expect(payload.role).toBe(userData.role);
  });

  test('should decode JWT token', () => {
    const userData = {
      id: 'user-test-3',
      email: 'decode@example.com',
      username: 'decodeuser',
      role: 'admin',
      isActive: true
    };

    const token = authHelper.generateJWTToken(userData);
    const payload = authHelper.decodeJWTToken(token.accessToken);
    
    expect(payload).not.toBeNull();
    expect(payload.userId).toBe(userData.id);
    expect(payload.email).toBe(userData.email);
    expect(payload.role).toBe(userData.role);
  });

  test('should hash and verify password', async () => {
    const password = 'testpassword123';
    const hashedPassword = await authHelper.hashPassword(password);
    
    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(50);
    
    const isValid = await authHelper.verifyPassword(password, hashedPassword);
    expect(isValid).toBe(true);
    
    const isInvalid = await authHelper.verifyPassword('wrongpassword', hashedPassword);
    expect(isInvalid).toBe(false);
  });

  test('should create test credentials', () => {
    const credentials = authHelper.createTestCredentials();
    
    expect(credentials).toHaveProperty('email');
    expect(credentials).toHaveProperty('password');
    expect(credentials.email).toBe('test@example.com');
    expect(credentials.password).toBe('testpassword123');
  });

  test('should create test user data', () => {
    const userData = authHelper.createTestUserData();
    
    expect(userData).toHaveProperty('id');
    expect(userData).toHaveProperty('email');
    expect(userData).toHaveProperty('username');
    expect(userData).toHaveProperty('role');
    expect(userData).toHaveProperty('isActive');
    expect(userData.email).toBe('test@example.com');
    expect(userData.username).toBe('testuser');
    expect(userData.role).toBe('user');
    expect(userData.isActive).toBe(true);
  });
});
