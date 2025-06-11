/**
 * ===================================
 * JWT Functionality Test
 * ===================================
 * Purpose: Verify JWT token generation and verification
 */

describe('JWT Functionality', () => {
  let AuthHelper;
  let authHelper;

  beforeAll(() => {
    // Import AuthHelper
    const AuthHelperModule = require('../../support/utils/AuthHelper');
    AuthHelper = AuthHelperModule.AuthHelper;
    authHelper = new AuthHelper();
  });

  test('should create AuthHelper instance', () => {
    expect(authHelper).toBeInstanceOf(AuthHelper);
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

  test('should handle invalid token verification', () => {
    const invalidToken = 'invalid.jwt.token';
    
    expect(() => {
      authHelper.verifyJWTToken(invalidToken);
    }).toThrow();
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

  test('should create admin user data', () => {
    const adminData = authHelper.createAdminUserData();
    
    expect(adminData.role).toBe('admin');
    expect(adminData.email).toBe('admin@example.com');
    expect(adminData.username).toBe('admin');
    expect(adminData.isActive).toBe(true);
  });
});
