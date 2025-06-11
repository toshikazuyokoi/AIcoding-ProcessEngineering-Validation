/**
 * ===================================
 * Dependency Check Test
 * ===================================
 * Purpose: Verify required dependencies are available
 */

describe('Dependency Check', () => {
  test('should import jsonwebtoken', () => {
    expect(() => {
      const jwt = require('jsonwebtoken');
      expect(jwt).toBeDefined();
      expect(typeof jwt.sign).toBe('function');
      expect(typeof jwt.verify).toBe('function');
      expect(typeof jwt.decode).toBe('function');
    }).not.toThrow();
  });

  test('should import bcrypt', () => {
    expect(() => {
      const bcrypt = require('bcrypt');
      expect(bcrypt).toBeDefined();
      expect(typeof bcrypt.hash).toBe('function');
      expect(typeof bcrypt.compare).toBe('function');
    }).not.toThrow();
  });

  test('should import axios', () => {
    expect(() => {
      const axios = require('axios');
      expect(axios).toBeDefined();
      expect(typeof axios.get).toBe('function');
      expect(typeof axios.post).toBe('function');
    }).not.toThrow();
  });
});
