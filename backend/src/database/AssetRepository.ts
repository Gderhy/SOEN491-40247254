/**
 * Asset Repository
 * Handles database operations for the assets table
 */

import { supabase } from '../config/supabase.js';
import type { 
  Asset, 
  CreateAssetPayload, 
  UpdateAssetPayload, 
  AssetFilters,
  AssetQueryResult,
  DatabaseResult 
} from '../models/index.js';

export class AssetRepository {
  /**
   * Get all assets for a user with optional filters
   */
  static async getAssets(filters: AssetFilters): Promise<AssetQueryResult> {
    try {
      let query = supabase
        .from('assets')
        .select('*', { count: 'exact' })
        .eq('user_id', filters.user_id);

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.currency) {
        query = query.eq('currency', filters.currency);
      }
      if (filters.provider) {
        query = query.eq('provider', filters.provider);
      }
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      if (filters.min_value !== undefined) {
        query = query.gte('value', filters.min_value);
      }
      if (filters.max_value !== undefined) {
        query = query.lte('value', filters.max_value);
      }

      // Apply sorting
      if (filters.sort && filters.sort.length > 0) {
        const sort = filters.sort[0];
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        // Default sort by created_at desc
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const page = filters.pagination?.page || 1;
      const limit = Math.min(filters.pagination?.limit || 20, 100);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        assets: data || [],
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > (from + limit)
      };

    } catch (error) {
      throw new Error(`Failed to fetch assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a single asset by ID
   */
  static async getAssetById(id: string, userId: string): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to fetch asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new asset
   */
  static async createAsset(payload: CreateAssetPayload): Promise<Asset> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to create asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing asset
   */
  static async updateAsset(id: string, payload: UpdateAssetPayload): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .update(payload)
        .eq('id', id)
        .eq('user_id', payload.user_id) // Ensure user can only update their own assets
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to update asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete an asset
   */
  static async deleteAsset(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset statistics for a user
   */
  static async getAssetStats(userId: string): Promise<{
    total_assets: number;
    total_value: number;
    currency_breakdown: Record<string, number>;
    type_breakdown: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('value, currency, type')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const assets = data || [];
      
      const stats = {
        total_assets: assets.length,
        total_value: 0,
        currency_breakdown: {} as Record<string, number>,
        type_breakdown: {} as Record<string, number>
      };

      assets.forEach(asset => {
        stats.total_value += asset.value;
        stats.currency_breakdown[asset.currency] = (stats.currency_breakdown[asset.currency] || 0) + asset.value;
        stats.type_breakdown[asset.type] = (stats.type_breakdown[asset.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to fetch asset statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
