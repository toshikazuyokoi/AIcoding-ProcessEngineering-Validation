/**
 * ===================================
 * API Client Implementation
 * ===================================
 * Purpose: HTTP communication client for backend API integration
 * Features:
 * - HTTP request handling (GET/POST/PUT/DELETE)
 * - JWT authentication management
 * - Automatic token refresh
 * - Error handling and classification
 * - Request/response interceptors
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

// ===================================
// API Client Types
// ===================================

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Request configuration interface
 */
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
  requireAuth?: boolean;
}

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    type: string;
    timestamp: string;
    requestId?: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

/**
 * Authentication token pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  enableAuth: boolean;
  enableLogging: boolean;
  tokenStorageKey: string;
  refreshTokenStorageKey: string;
}

/**
 * Request interceptor function
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function
 */
export type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;

/**
 * Error interceptor function
 */
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

// ===================================
// Error Classes
// ===================================

/**
 * Base API error class
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly type: string;
  public readonly requestId?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'API_ERROR',
    type: string = 'UNKNOWN',
    requestId?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.type = type;
    this.requestId = requestId;
    this.details = details;
  }
}

/**
 * Network error class
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Network request failed', requestId?: string) {
    super(message, 0, 'NETWORK_ERROR', 'NETWORK', requestId);
    this.name = 'NetworkError';
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', requestId?: string) {
    super(message, 401, 'AUTHENTICATION_ERROR', 'AUTHENTICATION', requestId);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied', requestId?: string) {
    super(message, 403, 'AUTHORIZATION_ERROR', 'AUTHORIZATION', requestId);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation error class
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: any, requestId?: string) {
    super(message, 400, 'VALIDATION_ERROR', 'VALIDATION', requestId, details);
    this.name = 'ValidationError';
  }
}

// ===================================
// ApiClient Class
// ===================================

/**
 * HTTP API client with authentication and error handling
 */
export class ApiClient {
  private config: ApiClientConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  /**
   * Constructor
   */
  constructor(config?: Partial<ApiClientConfig>) {
    this.config = {
      baseURL: 'http://localhost:8000/api',
      timeout: 30000, // 30 seconds
      retries: 3,
      enableAuth: true,
      enableLogging: true,
      tokenStorageKey: 'task_management_access_token',
      refreshTokenStorageKey: 'task_management_refresh_token',
      ...config
    };

    // Setup default interceptors
    this.setupDefaultInterceptors();
  }

  /**
   * Setup default request/response interceptors
   */
  private setupDefaultInterceptors(): void {
    // Request interceptor for authentication
    this.addRequestInterceptor(async (config) => {
      if (config.requireAuth !== false && this.config.enableAuth) {
        const token = this.getAccessToken();
        if (token) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`
          };
        }
      }

      // Add default headers
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers
      };

      return config;
    });

    // Response interceptor for token refresh
    this.addResponseInterceptor(async (response) => {
      // Handle token refresh on 401 errors
      if (!response.success && response.error?.code === 'AUTHENTICATION_ERROR') {
        const refreshed = await this.refreshTokenIfNeeded();
        if (refreshed) {
          // Retry the original request with new token
          // Note: This would require storing the original request config
          // For now, we'll just return the error and let the caller handle it
        }
      }

      return response;
    });

    // Error interceptor for logging
    this.addErrorInterceptor(async (error) => {
      if (this.config.enableLogging) {
        console.error('API Error:', {
          message: error.message,
          statusCode: error.statusCode,
          code: error.code,
          type: error.type,
          requestId: error.requestId
        });
      }

      return error;
    });
  }

  /**
   * Add request interceptor
   */
  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  public addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * GET request
   */
  public async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  public async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', data });
  }

  /**
   * PUT request
   */
  public async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', data });
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', data });
  }

  /**
   * Generic request method
   */
  public async request<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const finalConfig = await this.processRequestInterceptors({
      method: 'GET',
      timeout: this.config.timeout,
      retries: this.config.retries,
      requireAuth: true,
      ...config
    });

    const fullUrl = this.buildUrl(url, finalConfig.params);

    try {
      const response = await this.executeRequest<T>(fullUrl, finalConfig);
      return await this.processResponseInterceptors(response);
    } catch (error) {
      const apiError = await this.processErrorInterceptors(this.createApiError(error));
      throw apiError;
    }
  }

  /**
   * Execute HTTP request
   */
  private async executeRequest<T>(url: string, config: RequestConfig): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const fetchConfig: RequestInit = {
        method: config.method,
        headers: config.headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: controller.signal
      };

      const response = await fetch(url, fetchConfig);
      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        throw this.createApiErrorFromResponse(response, responseData);
      }

      return responseData as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, any>): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Combine baseURL and path
    const fullPath = `${this.config.baseURL}${normalizedPath}`;
    const url = new URL(fullPath);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Process request interceptors
   */
  private async processRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;

    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    return processedConfig;
  }

  /**
   * Process response interceptors
   */
  private async processResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let processedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    return processedResponse;
  }

  /**
   * Process error interceptors
   */
  private async processErrorInterceptors(error: ApiError): Promise<ApiError> {
    let processedError = error;

    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError);
    }

    return processedError;
  }

  /**
   * Create API error from generic error
   */
  private createApiError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error.name === 'AbortError') {
      return new NetworkError('Request timeout');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new NetworkError('Network connection failed');
    }

    return new ApiError(error.message || 'Unknown error occurred');
  }

  /**
   * Create API error from HTTP response
   */
  private createApiErrorFromResponse(response: Response, data: any): ApiError {
    const message = data?.error?.message || response.statusText || 'Request failed';
    const code = data?.error?.code || 'HTTP_ERROR';
    const type = data?.error?.type || 'HTTP';
    const requestId = data?.error?.requestId;
    const details = data?.error?.details;

    switch (response.status) {
      case 400:
        return new ValidationError(message, details, requestId);
      case 401:
        return new AuthenticationError(message, requestId);
      case 403:
        return new AuthorizationError(message, requestId);
      default:
        return new ApiError(message, response.status, code, type, requestId, details);
    }
  }

  /**
   * Get access token from storage
   */
  private getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.config.tokenStorageKey);
    } catch (error) {
      console.warn('Failed to get access token from storage:', error);
      return null;
    }
  }

  /**
   * Get refresh token from storage
   */
  private getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.config.refreshTokenStorageKey);
    } catch (error) {
      console.warn('Failed to get refresh token from storage:', error);
      return null;
    }
  }

  /**
   * Set tokens in storage
   */
  public setTokens(tokens: TokenPair): void {
    try {
      localStorage.setItem(this.config.tokenStorageKey, tokens.accessToken);
      localStorage.setItem(this.config.refreshTokenStorageKey, tokens.refreshToken);
    } catch (error) {
      console.warn('Failed to store tokens:', error);
    }
  }

  /**
   * Clear tokens from storage
   */
  public clearTokens(): void {
    try {
      localStorage.removeItem(this.config.tokenStorageKey);
      localStorage.removeItem(this.config.refreshTokenStorageKey);
    } catch (error) {
      console.warn('Failed to clear tokens:', error);
    }
  }

  /**
   * Refresh access token if needed
   */
  private async refreshTokenIfNeeded(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await this.post<TokenPair>('/auth/refresh',
        { refreshToken },
        { requireAuth: false }
      );

      if (response.success && response.data) {
        this.setTokens(response.data);
        return true;
      }

      return false;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get current configuration
   */
  public getConfig(): ApiClientConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// ===================================
// Factory Functions
// ===================================

/**
 * Create API client instance
 */
export const createApiClient = (config?: Partial<ApiClientConfig>): ApiClient => {
  return new ApiClient(config);
};

/**
 * Default API client instance
 */
export const apiClient = createApiClient();

// Export default instance
export default apiClient;
