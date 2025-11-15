/**
 * Enhanced API Client with error handling, caching, and retry logic
 */
import { API_BASE_URL, ENDPOINTS, CACHE_DURATION, ERROR_MESSAGES } from '../utils/constants';

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Build full URL
   */
  buildURL(endpoint, params = {}) {
    const url = new URL(endpoint, this.baseURL);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  }

  /**
   * Get cache key
   */
  getCacheKey(url, options = {}) {
    return `${url}_${JSON.stringify(options)}`;
  }

  /**
   * Check cache
   */
  getFromCache(key, maxAge = CACHE_DURATION.MEDIUM) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(pattern) {
    if (pattern) {
      Array.from(this.cache.keys())
        .filter(key => key.includes(pattern))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Handle response
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      switch (response.status) {
        case 400:
          throw new Error(errorData.detail || ERROR_MESSAGES.VALIDATION_ERROR);
        case 401:
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        case 404:
          throw new Error('Ressource non trouvée');
        case 500:
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        default:
          throw new Error(errorData.detail || ERROR_MESSAGES.NETWORK_ERROR);
      }
    }

    return response.json();
  }

  /**
   * Generic request with retry logic
   */
  async request(url, options = {}, retries = 3) {
    const {
      method = 'GET',
      body,
      headers = {},
      cache = true,
      cacheMaxAge = CACHE_DURATION.MEDIUM,
      timeout = 30000,
      signal,
      ...restOptions
    } = options;

    // Check cache for GET requests
    if (method === 'GET' && cache) {
      const cacheKey = this.getCacheKey(url, options);
      const cached = this.getFromCache(cacheKey, cacheMaxAge);
      if (cached) {
        return Promise.resolve(cached);
      }
    }

    // Request deduplication for GET requests
    if (method === 'GET') {
      const requestKey = this.getCacheKey(url, options);
      if (this.pendingRequests.has(requestKey)) {
        return this.pendingRequests.get(requestKey);
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combine signals
    const combinedSignal = signal || controller.signal;

    const fetchPromise = (async () => {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': body instanceof FormData ? undefined : 'application/json',
            ...headers
          },
          body: body instanceof FormData ? body : JSON.stringify(body),
          signal: combinedSignal,
          ...restOptions
        });

        clearTimeout(timeoutId);
        const data = await this.handleResponse(response);

        // Cache GET responses
        if (method === 'GET' && cache) {
          const cacheKey = this.getCacheKey(url, options);
          this.setCache(cacheKey, data);
        }

        return data;

      } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort
        if (error.name === 'AbortError') {
          throw new Error(ERROR_MESSAGES.TIMEOUT);
        }

        // Retry logic for network errors
        if (retries > 0 && error.message === ERROR_MESSAGES.NETWORK_ERROR) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.request(url, options, retries - 1);
        }

        throw error;
      } finally {
        // Clean up pending requests
        if (method === 'GET') {
          const requestKey = this.getCacheKey(url, options);
          this.pendingRequests.delete(requestKey);
        }
      }
    })();

    // Store pending request
    if (method === 'GET') {
      const requestKey = this.getCacheKey(url, options);
      this.pendingRequests.set(requestKey, fetchPromise);
    }

    return fetchPromise;
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}, options = {}) {
    const url = this.buildURL(endpoint, params);
    return this.request(url, { method: 'GET', ...options });
  }

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    const url = this.buildURL(endpoint);
    return this.request(url, { method: 'POST', body, cache: false, ...options });
  }

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    const url = this.buildURL(endpoint);
    return this.request(url, { method: 'PUT', body, cache: false, ...options });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    const url = this.buildURL(endpoint);
    return this.request(url, { method: 'DELETE', cache: false, ...options });
  }

  /**
   * Upload file
   */
  async uploadFile(endpoint, file, additionalData = {}, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.post(endpoint, formData, options);
  }
}

// Create singleton instance
const apiClient = new APIClient();

// Export methods
export const api = {
  get: (...args) => apiClient.get(...args),
  post: (...args) => apiClient.post(...args),
  put: (...args) => apiClient.put(...args),
  delete: (...args) => apiClient.delete(...args),
  uploadFile: (...args) => apiClient.uploadFile(...args),
  clearCache: (...args) => apiClient.clearCache(...args),
};

// Specific API functions
export const analyzeMedia = (file, options) =>
  apiClient.uploadFile(ENDPOINTS.ANALYZE_MEDIA, file, {}, options);

export const generateCaption = (data, options) =>
  apiClient.post(ENDPOINTS.GENERATE_CAPTION, data, options);

export const analyzeAndGenerate = (file, options) =>
  apiClient.uploadFile(ENDPOINTS.ANALYZE_AND_GENERATE, file, {}, options);

export const getMusicians = (options) =>
  apiClient.get(ENDPOINTS.MUSICIANS, {}, { cacheMaxAge: CACHE_DURATION.LONG, ...options });

export const getVenues = (options) =>
  apiClient.get(ENDPOINTS.VENUES, {}, { cacheMaxAge: CACHE_DURATION.LONG, ...options });

export const getAnalytics = (options) =>
  apiClient.get(ENDPOINTS.ANALYTICS, {}, { cacheMaxAge: CACHE_DURATION.SHORT, ...options });

export default api;
