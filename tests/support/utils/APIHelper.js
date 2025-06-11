/**
 * ===================================
 * API Helper for Integration Tests (JavaScript)
 * ===================================
 * Generated for TSK-IT-001-001-TestUtilities
 * Project: Task Management System - Integration Test
 * Purpose: API request utilities for integration and E2E testing
 */

const axios = require('axios');

/**
 * API Helper class
 */
class APIHelper {
  constructor() {
    this.baseURL = process.env.API_URL || 'http://localhost:8002';
    this.defaultTimeout = parseInt(process.env.API_TIMEOUT || '30000');
    this.activeRequests = new Map();
    this.requestCounter = 0;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.defaultTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  // ===================================
  // Request Methods
  // ===================================

  /**
   * Make API request
   */
  async makeRequest(options) {
    const requestId = this.generateRequestId();
    const context = {
      requestId,
      startTime: Date.now(),
      options
    };

    this.activeRequests.set(requestId, context);

    try {
      const config = this.buildAxiosConfig(options);
      const response = await this.client.request(config);
      
      const apiResponse = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        requestId,
        duration: Date.now() - context.startTime
      };

      context.response = apiResponse;
      console.log(`✅ API request completed: ${options.method} ${options.url} (${apiResponse.duration}ms)`);
      
      return apiResponse;
    } catch (error) {
      context.error = error;
      console.error(`❌ API request failed: ${options.method} ${options.url}`, error);
      throw error;
    } finally {
      // Keep request in history for debugging
      setTimeout(() => {
        this.activeRequests.delete(requestId);
      }, 60000); // Remove after 1 minute
    }
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.makeRequest({
      method: 'GET',
      url,
      ...options
    });
  }

  /**
   * POST request
   */
  async post(url, data, options = {}) {
    return this.makeRequest({
      method: 'POST',
      url,
      data,
      ...options
    });
  }

  /**
   * PUT request
   */
  async put(url, data, options = {}) {
    return this.makeRequest({
      method: 'PUT',
      url,
      data,
      ...options
    });
  }

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    return this.makeRequest({
      method: 'DELETE',
      url,
      ...options
    });
  }

  /**
   * PATCH request
   */
  async patch(url, data, options = {}) {
    return this.makeRequest({
      method: 'PATCH',
      url,
      data,
      ...options
    });
  }

  // ===================================
  // Authentication Helpers
  // ===================================

  /**
   * Make authenticated request
   */
  async makeAuthenticatedRequest(options, token, tokenType = 'Bearer') {
    return this.makeRequest({
      ...options,
      auth: { token, type: tokenType }
    });
  }

  /**
   * Login and get token
   */
  async login(credentials) {
    try {
      const response = await this.post('/auth/login', credentials);
      const token = response.data.accessToken || response.data.token;
      
      if (!token) {
        throw new Error('No token received from login response');
      }
      
      console.log(`✅ Login successful for: ${credentials.email}`);
      return token;
    } catch (error) {
      console.error(`❌ Login failed for: ${credentials.email}`, error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(token) {
    try {
      await this.makeAuthenticatedRequest({
        method: 'POST',
        url: '/auth/logout'
      }, token);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }

  // ===================================
  // Wait and Polling
  // ===================================

  /**
   * Wait for response
   */
  async waitForResponse(requestId, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const context = this.activeRequests.get(requestId);
      
      if (context?.response) {
        return context.response;
      }
      
      if (context?.error) {
        throw context.error;
      }
      
      await this.sleep(100);
    }
    
    throw new Error(`Request ${requestId} did not complete within ${timeout}ms`);
  }

  /**
   * Poll endpoint until condition is met
   */
  async pollUntil(url, condition, options = {}) {
    const interval = options.interval || 1000;
    const timeout = options.timeout || 30000;
    const maxAttempts = options.maxAttempts || Math.floor(timeout / interval);
    
    const startTime = Date.now();
    let attempts = 0;
    
    while (attempts < maxAttempts && Date.now() - startTime < timeout) {
      try {
        const response = await this.get(url);
        
        if (condition(response)) {
          console.log(`✅ Polling condition met after ${attempts + 1} attempts`);
          return response;
        }
        
        attempts++;
        await this.sleep(interval);
      } catch (error) {
        console.warn(`⚠️ Polling attempt ${attempts + 1} failed:`, error);
        attempts++;
        await this.sleep(interval);
      }
    }
    
    throw new Error(`Polling condition not met within ${timeout}ms (${attempts} attempts)`);
  }

  // ===================================
  // Utility Functions
  // ===================================

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await this.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.warn('⚠️ API health check failed:', error);
      return false;
    }
  }

  /**
   * Wait for API to be ready
   */
  async waitForAPI(timeout = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await this.checkHealth()) {
        console.log('✅ API is ready');
        return;
      }
      
      await this.sleep(1000);
    }
    
    throw new Error(`API not ready within ${timeout}ms`);
  }

  /**
   * Get request statistics
   */
  getRequestStatistics() {
    const contexts = Array.from(this.activeRequests.values());
    const completedRequests = contexts.filter(ctx => ctx.response || ctx.error);
    const successfulRequests = contexts.filter(ctx => ctx.response);
    
    const totalResponseTime = completedRequests
      .filter(ctx => ctx.response)
      .reduce((sum, ctx) => sum + ctx.response.duration, 0);
    
    return {
      totalRequests: this.requestCounter,
      activeRequests: contexts.filter(ctx => !ctx.response && !ctx.error).length,
      averageResponseTime: completedRequests.length > 0 ? totalResponseTime / completedRequests.length : 0,
      successRate: completedRequests.length > 0 ? successfulRequests.length / completedRequests.length : 0
    };
  }

  // ===================================
  // Private Methods
  // ===================================

  /**
   * Setup axios interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Build axios config from options
   */
  buildAxiosConfig(options) {
    const config = {
      method: options.method,
      url: options.url,
      data: options.data,
      params: options.params,
      headers: { ...options.headers },
      timeout: options.timeout || this.defaultTimeout
    };

    // Add authentication header
    if (options.auth) {
      config.headers.Authorization = `${options.auth.type} ${options.auth.token}`;
    }

    return config;
  }

  /**
   * Generate request ID
   */
  generateRequestId() {
    this.requestCounter++;
    return `req-${this.requestCounter}-${Date.now()}`;
  }

  /**
   * Sleep utility
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = {
  APIHelper
};
