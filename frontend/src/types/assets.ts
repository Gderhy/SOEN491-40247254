/**
 * Asset Types
 * Frontend types for asset management
 */

export interface Asset {
  id: string;
  user_id: string;
  type: string;
  name: string;
  symbol?: string;
  quantity?: number;
  value: number;
  currency: string;
  provider?: string;
  source: string;
  created_at: string; // ISO date string from API
  updated_at: string; // ISO date string from API
}

export interface CreateAssetPayload {
  type: string;
  name: string;
  symbol?: string;
  quantity?: number;
  value: number;
  currency?: string;
  provider?: string;
  source?: string;
}

export interface UpdateAssetPayload {
  type?: string;
  name?: string;
  symbol?: string;
  quantity?: number;
  value?: number;
  currency?: string;
  provider?: string;
  source?: string;
}

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}
