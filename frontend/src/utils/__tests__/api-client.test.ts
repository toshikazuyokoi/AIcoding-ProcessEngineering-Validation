/**
 * ===================================
 * API Client Tests
 * ===================================
 * Purpose: Comprehensive testing for ApiClient class
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import {
  ApiClient,
  ApiResponse,
  TokenPair,
  ApiError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  createApiClient
} from '../api-client';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock console methods
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};
Object.defineProperty(console, 'error', { value: mockConsole.error });
Object.defineProperty(console, 'warn', { value: mockConsole.warn });
Object.defineProperty(console, 'log', { value: mockConsole.log });

// Test data
const mockTokenPair: TokenPair = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600
};

const mockApiResponse: ApiResponse<any> = {
  success: true,
  data: { id: '123', name: 'Test Data' },
  metadata: {
    timestamp: '2023-01-01T00:00:00.000Z',
    requestId: 'test-request-id'
  }
};

const mockErrorResponse: ApiResponse<any> = {
  success: false,
  error: {
    code: 'TEST_ERROR',
    message: 'Test error message',
    type: 'TEST',
    timestamp: '2023-01-01T00:00:00.000Z',
    requestId: 'test-request-id'
  }
};

// Test client instance
let apiClient: ApiClient;

// ===================================
// Test Suite Setup
// ===================================

describe('ApiClient', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();

    // Create fresh instance
    apiClient = new ApiClient({
      baseURL: 'http://localhost:8000/api',
      timeout: 5000,
      retries: 1,
      enableAuth: true,
      enableLogging: false // Disable for testing
    });
  });

  // ===================================
  // Phase 1: Constructor and Configuration Tests
  // ===================================

  describe('Phase 1: Constructor and Configuration', () => {
    it('should create instance with default configuration', () => {
      const client = new ApiClient();
      const config = client.getConfig();
      
      expect(config.baseURL).toBe('http://localhost:8000/api');
      expect(config.timeout).toBe(30000);
      expect(config.retries).toBe(3);
      expect(config.enableAuth).toBe(true);
    });

    it('should create instance with custom configuration', () => {
      const customConfig = {
        baseURL: 'https://api.example.com',
        timeout: 10000,
        enableAuth: false
      };
      
      const client = new ApiClient(customConfig);
      const config = client.getConfig();
      
      expect(config.baseURL).toBe('https://api.example.com');
      expect(config.timeout).toBe(10000);
      expect(config.enableAuth).toBe(false);
    });

    it('should create instance using factory function', () => {
      const client = createApiClient({ timeout: 15000 });
      const config = client.getConfig();
      
      expect(client).toBeInstanceOf(ApiClient);
      expect(config.timeout).toBe(15000);
    });

    it('should update configuration', () => {
      apiClient.updateConfig({ timeout: 20000 });
      const config = apiClient.getConfig();
      
      expect(config.timeout).toBe(20000);
    });
  });

  // ===================================
  // Phase 2: HTTP Methods Tests
  // ===================================

  describe('Phase 2: HTTP Methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);
    });

    it('should make GET request successfully', async () => {
      const response = await apiClient.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(response).toEqual(mockApiResponse);
    });

    it('should make POST request with data', async () => {
      const testData = { name: 'Test' };
      const response = await apiClient.post('/test', testData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(testData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(response).toEqual(mockApiResponse);
    });

    it('should make PUT request with data', async () => {
      const testData = { id: '123', name: 'Updated' };
      const response = await apiClient.put('/test/123', testData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(testData)
        })
      );
      expect(response).toEqual(mockApiResponse);
    });

    it('should make DELETE request', async () => {
      const response = await apiClient.delete('/test/123');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/123',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      expect(response).toEqual(mockApiResponse);
    });

    it('should make PATCH request with data', async () => {
      const testData = { name: 'Patched' };
      const response = await apiClient.patch('/test/123', testData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(testData)
        })
      );
      expect(response).toEqual(mockApiResponse);
    });
  });

  // ===================================
  // Phase 3: Authentication Tests
  // ===================================

  describe('Phase 3: Authentication', () => {
    it('should add authorization header when token exists', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token');
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);

      await apiClient.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should not add authorization header when requireAuth is false', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token');
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);

      await apiClient.get('/test', { requireAuth: false });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });

    it('should store tokens correctly', () => {
      apiClient.setTokens(mockTokenPair);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'task_management_access_token',
        mockTokenPair.accessToken
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'task_management_refresh_token',
        mockTokenPair.refreshToken
      );
    });

    it('should clear tokens correctly', () => {
      apiClient.clearTokens();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('task_management_access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('task_management_refresh_token');
    });

    it('should check authentication status', () => {
      mockLocalStorage.getItem.mockReturnValue('test-token');
      expect(apiClient.isAuthenticated()).toBe(true);
      
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(apiClient.isAuthenticated()).toBe(false);
    });
  });

  // ===================================
  // Phase 4: Error Handling Tests
  // ===================================

  describe('Phase 4: Error Handling', () => {
    it('should handle 400 validation errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            type: 'VALIDATION',
            details: { field: 'name' }
          }
        })
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow(ValidationError);
    });

    it('should handle 401 authentication errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Token expired',
            type: 'AUTHENTICATION'
          }
        })
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow(AuthenticationError);
    });

    it('should handle 403 authorization errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Access denied',
            type: 'AUTHORIZATION'
          }
        })
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow(AuthorizationError);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(apiClient.get('/test')).rejects.toThrow(NetworkError);
    });

    it('should handle timeout errors', async () => {
      // Mock AbortController to simulate timeout
      const mockAbortController = {
        abort: jest.fn(),
        signal: { aborted: false }
      };

      global.AbortController = jest.fn(() => mockAbortController) as any;

      mockFetch.mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'));

      await expect(apiClient.get('/test', { timeout: 100 })).rejects.toThrow(NetworkError);

      // Restore AbortController
      global.AbortController = AbortController;
    });
  });

  // ===================================
  // Phase 5: URL Building and Parameters Tests
  // ===================================

  describe('Phase 5: URL Building and Parameters', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);
    });

    it('should build URL with query parameters', async () => {
      await apiClient.get('/test', {
        params: { page: 1, limit: 10, search: 'test query' }
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test?page=1&limit=10&search=test+query',
        expect.any(Object)
      );
    });

    it('should handle undefined and null parameters', async () => {
      await apiClient.get('/test', {
        params: { page: 1, limit: undefined, search: null, active: true }
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test?page=1&active=true',
        expect.any(Object)
      );
    });

    it('should build correct absolute URLs', async () => {
      await apiClient.get('/users/123/tasks');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/users/123/tasks',
        expect.any(Object)
      );
    });
  });
});
