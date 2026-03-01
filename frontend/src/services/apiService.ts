/**
 * API Client using axios
 * Configured for backend communication with JWT Bearer tokens
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';

// API base URL - update this to match your backend
const API_BASE_URL = 'http://localhost:4000';

/**
 * Create axios instance with default configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add JWT token to requests automatically
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (you can change this to wherever you store it)
    const token = localStorage.getItem('supabase.auth.token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Handle response errors (401, 403, etc.)
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * API service functions
 */
export const apiService = {
  /**
   * Test backend health
   */
  async checkHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },

  /**
   * Get detailed health info
   */
  async getDetailedHealth() {
    const response = await apiClient.get('/health/detailed');
    return response.data;
  },

  /**
   * Get API information
   */
  async getApiInfo() {
    const response = await apiClient.get('/');
    return response.data;
  },

  /**
   * Get current user info (requires auth)
   */
  async getCurrentUser() {
    const response = await apiClient.get('/me');
    return response.data;
  },

  /**
   * Validate JWT token (requires auth)
   */
  async validateToken() {
    const response = await apiClient.get('/auth/validate');
    return response.data;
  },

  /**
   * Set JWT token for future requests
   */
  setAuthToken(token: string) {
    localStorage.setItem('supabase.auth.token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  /**
   * Clear JWT token
   */
  clearAuthToken() {
    localStorage.removeItem('supabase.auth.token');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiService;
