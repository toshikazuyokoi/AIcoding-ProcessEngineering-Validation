/**
 * ===================================
 * Authentication Helper for Integration Tests (JavaScript)
 * ===================================
 * Generated for TSK-IT-001-001-TestUtilities
 * Project: Task Management System - Integration Test
 * Purpose: Authentication utilities for integration and E2E testing
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * Authentication Helper class
 */
class AuthHelper {
  constructor() {
    this.activeSessions = new Map();
    this.jwtSecret = process.env.JWT_SECRET || 'integration_jwt_secret_key_for_testing_only';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
  }

  // ===================================
  // Authentication Operations
  // ===================================

  /**
   * Authenticate user with credentials
   */
  async authenticateUser(credentials) {
    try {
      // Validate credentials format
      this.validateCredentials(credentials);

      // For integration tests, we'll create a mock authentication
      // In real implementation, this would validate against the database
      const userData = await this.validateUserCredentials(credentials);
      
      // Generate JWT token
      const token = this.generateJWTToken(userData);
      
      console.log(`✅ User authenticated: ${credentials.email}`);
      return token;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Create user session
   */
  async createUserSession(userData) {
    try {
      const sessionId = this.generateSessionId();
      const token = this.generateJWTToken(userData);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const session = {
        sessionId,
        userId: userData.id,
        token,
        userData,
        createdAt: new Date(),
        expiresAt
      };

      this.activeSessions.set(sessionId, session);
      
      console.log(`✅ User session created: ${sessionId}`);
      return session;
    } catch (error) {
      console.error('❌ Failed to create user session:', error);
      throw error;
    }
  }

  /**
   * Get user session
   */
  getUserSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    
    // Check if session is expired
    if (session && session.expiresAt < new Date()) {
      this.activeSessions.delete(sessionId);
      return undefined;
    }
    
    return session;
  }

  /**
   * Cleanup user session
   */
  async cleanupSession(sessionId) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        this.activeSessions.delete(sessionId);
        console.log(`✅ Session cleaned up: ${sessionId}`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup session:', error);
      throw error;
    }
  }

  /**
   * Cleanup all sessions
   */
  async cleanupAllSessions() {
    try {
      const sessionCount = this.activeSessions.size;
      this.activeSessions.clear();
      console.log(`✅ All sessions cleaned up: ${sessionCount} sessions`);
    } catch (error) {
      console.error('❌ Failed to cleanup all sessions:', error);
      throw error;
    }
  }

  // ===================================
  // JWT Operations
  // ===================================

  /**
   * Generate JWT token
   */
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

  /**
   * Verify JWT token
   */
  verifyJWTToken(token) {
    try {
      const payload = jwt.verify(token, this.jwtSecret);
      return payload;
    } catch (error) {
      console.error('❌ Failed to verify JWT token:', error);
      throw error;
    }
  }

  /**
   * Decode JWT token (without verification)
   */
  decodeJWTToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('❌ Failed to decode JWT token:', error);
      return null;
    }
  }

  // ===================================
  // Password Operations
  // ===================================

  /**
   * Hash password
   */
  async hashPassword(password) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('❌ Failed to hash password:', error);
      throw error;
    }
  }

  /**
   * Verify password
   */
  async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('❌ Failed to verify password:', error);
      throw error;
    }
  }

  // ===================================
  // Test Data Helpers
  // ===================================

  /**
   * Create test user credentials
   */
  createTestCredentials(overrides = {}) {
    return {
      email: overrides.email || 'test@example.com',
      password: overrides.password || 'testpassword123'
    };
  }

  /**
   * Create test user data
   */
  createTestUserData(overrides = {}) {
    return {
      id: overrides.id || `user-${Date.now()}`,
      email: overrides.email || 'test@example.com',
      username: overrides.username || 'testuser',
      role: overrides.role || 'user',
      isActive: overrides.isActive !== undefined ? overrides.isActive : true
    };
  }

  /**
   * Create admin user data
   */
  createAdminUserData(overrides = {}) {
    return this.createTestUserData({
      role: 'admin',
      email: 'admin@example.com',
      username: 'admin',
      ...overrides
    });
  }

  // ===================================
  // Utility Functions
  // ===================================

  /**
   * Generate session ID
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `session-${timestamp}-${random}`;
  }

  /**
   * Validate credentials format
   */
  validateCredentials(credentials) {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    if (!this.isValidEmail(credentials.email)) {
      throw new Error('Invalid email format');
    }

    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate user credentials (mock implementation for tests)
   */
  async validateUserCredentials(credentials) {
    // Mock validation for integration tests
    // In real implementation, this would query the database
    
    const testUsers = {
      'test@example.com': {
        id: 'user-test-1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        isActive: true
      },
      'admin@example.com': {
        id: 'user-admin-1',
        email: 'admin@example.com',
        username: 'admin',
        role: 'admin',
        isActive: true
      }
    };

    const userData = testUsers[credentials.email];
    if (!userData) {
      throw new Error('Invalid credentials');
    }

    // Mock password validation
    if (credentials.password !== 'testpassword123' && credentials.password !== 'adminpassword123') {
      throw new Error('Invalid credentials');
    }

    return userData;
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount() {
    return this.activeSessions.size;
  }

  /**
   * Get session statistics
   */
  getSessionStatistics() {
    const now = new Date();
    let activeSessions = 0;
    let expiredSessions = 0;

    this.activeSessions.forEach((session) => {
      if (session.expiresAt > now) {
        activeSessions++;
      } else {
        expiredSessions++;
      }
    });

    return {
      totalSessions: this.activeSessions.size,
      activeSessions,
      expiredSessions
    };
  }
}

module.exports = {
  AuthHelper
};
