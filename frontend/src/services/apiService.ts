/**
 * Unified API Service
 * Single service for all backend communication with JWT authentication
 * 
 * Configuration:
 * - Backend URL is configured via VITE_API_BASE_URL environment variable
 * - Default fallback: http://localhost:4000
 * - Tokens are stored in localStorage with automatic injection
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { config } from '../config/env';

// Token storage key
const TOKEN_KEY = 'supabase.auth.token';

/**
 * Unified API service class
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    // Create axios instance
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for JWT tokens
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ TOKEN MANAGEMENT ============
  
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // ============ UTILITY METHODS ============
  
  getBaseUrl(): string {
    return config.api.baseUrl;
  }

  // ============ HEALTH CHECK ENDPOINTS ============
  
  async checkHealth() {
    const response = await this.client.get('/health');
    return response.data;
  }

  async getDetailedHealth() {
    const response = await this.client.get('/health/detailed');
    return response.data;
  }

  // ============ API INFO ENDPOINTS ============
  
  async getApiInfo() {
    const response = await this.client.get('/');
    return response.data;
  }

  // ============ AUTH ENDPOINTS ============
  
  async getCurrentUser() {
    const response = await this.client.get('/me');
    return response.data;
  }

  async validateToken() {
    const response = await this.client.get('/auth/validate');
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export the class for testing if needed
export { ApiService };
