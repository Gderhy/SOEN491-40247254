/**
 * Token Management Service
 * Handles JWT token storage and management
 */

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Token storage keys
 */
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  EXPIRES_AT: 'auth_expires_at',
} as const;

/**
 * Token management service
 */
export class TokenService {
  /**
   * Store tokens in localStorage
   */
  storeTokens(tokens: TokenData): void {
    if (tokens.accessToken) {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    }
    
    if (tokens.refreshToken) {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
    
    if (tokens.expiresAt) {
      localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, tokens.expiresAt.toString());
    }
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  /**
   * Get token expiration time
   */
  getExpirationTime(): number | null {
    const expiresAt = localStorage.getItem(TOKEN_KEYS.EXPIRES_AT);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  /**
   * Get all stored tokens
   */
  getTokens(): TokenData | null {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken: this.getRefreshToken() || undefined,
      expiresAt: this.getExpirationTime() || undefined,
    };
  }

  /**
   * Check if access token exists
   */
  hasToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiresAt = this.getExpirationTime();
    
    if (!expiresAt) {
      // If no expiration time is stored, assume token is valid
      return false;
    }
    
    // Add 5-minute buffer to account for clock skew
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() >= (expiresAt - bufferTime);
  }

  /**
   * Check if token should be refreshed soon
   */
  shouldRefreshToken(): boolean {
    const expiresAt = this.getExpirationTime();
    
    if (!expiresAt) {
      return false;
    }
    
    // Refresh if token expires in the next 10 minutes
    const refreshThreshold = 10 * 60 * 1000; // 10 minutes in milliseconds
    return Date.now() >= (expiresAt - refreshThreshold);
  }

  /**
   * Clear all tokens from localStorage
   */
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.EXPIRES_AT);
  }

  /**
   * Parse JWT token to extract payload (without verification)
   * Note: This is for client-side convenience only, server should always verify
   */
  parseToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to parse token:', error);
      return null;
    }
  }

  /**
   * Get token expiration from JWT payload
   */
  getTokenExpiration(token: string): number | null {
    const payload = this.parseToken(token);
    return payload?.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  }

  /**
   * Update stored token expiration based on JWT payload
   */
  updateExpirationFromToken(token: string): void {
    const expirationTime = this.getTokenExpiration(token);
    if (expirationTime) {
      localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, expirationTime.toString());
    }
  }
}

// Create a singleton instance
export const tokenService = new TokenService();
