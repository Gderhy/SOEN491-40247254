/**
 * Asset Model
 * Represents the assets table in the database
 */

import { BaseEntity, BaseCreatePayload, BaseUpdatePayload, QueryOptions } from './BaseModel.js';

export interface Asset extends BaseEntity {
  user_id: string; // uuid - references auth.users(id)
  type: string; // asset type (e.g., 'stock', 'crypto', 'real_estate', etc.)
  name: string; // asset name
  symbol?: string; // trading symbol (optional)
  quantity?: number; // numeric(20,8) - amount owned
  value: number; // numeric(20,2) - current value
  currency: string; // default 'CAD'
  provider?: string; // data provider (optional)
  source: string; // default 'manual'
}

/**
 * Asset creation payload (omits auto-generated fields)
 */
export interface CreateAssetPayload extends BaseCreatePayload {
  user_id: string;
  type: string;
  name: string;
  symbol?: string;
  quantity?: number;
  value: number;
  currency?: string;
  provider?: string;
  source?: string;
}

/**
 * Asset update payload (all fields optional except user_id for security)
 */
export interface UpdateAssetPayload extends BaseUpdatePayload {
  user_id: string; // Required to ensure users can only update their own assets
  type?: string;
  name?: string;
  symbol?: string;
  quantity?: number;
  value?: number;
  currency?: string;
  provider?: string;
  source?: string;
}

/**
 * Asset filter options for queries
 */
export interface AssetFilters extends QueryOptions {
  user_id: string; // Always required to filter by user
  type?: string;
  currency?: string;
  provider?: string;
  source?: string;
  min_value?: number;
  max_value?: number;
}

/**
 * Asset query response with pagination
 */
export interface AssetQueryResult {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
