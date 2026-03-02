/**
 * Database Configuration
 * Handles database connections and query execution via Supabase
 */

import { supabase } from '../config/supabase.js';
import type { DatabaseResult, PaginationOptions } from '../models/BaseModel.js';

/**
 * Database utility class for common operations
 */
export class DatabaseService {
  /**
   * Execute a raw SQL query
   */
  static async executeQuery<T>(
    query: string, 
    params?: any[]
  ): Promise<DatabaseResult<T[]>> {
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query,
        params: params || []
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown database error'
      };
    }
  }

  /**
   * Build pagination SQL
   */
  static buildPaginationSql(options?: PaginationOptions): string {
    if (!options) return '';
    
    const limit = Math.min(options.limit || 20, 100); // Max 100 items per page
    const offset = options.offset || ((options.page || 1) - 1) * limit;
    
    return `LIMIT ${limit} OFFSET ${offset}`;
  }

  /**
   * Build ORDER BY SQL
   */
  static buildOrderBySql(field: string, direction: 'asc' | 'desc' = 'desc'): string {
    // Sanitize field name (basic protection)
    const sanitizedField = field.replace(/[^a-zA-Z0-9_]/g, '');
    const sanitizedDirection = direction.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    return `ORDER BY ${sanitizedField} ${sanitizedDirection}`;
  }

  /**
   * Count total records for pagination
   */
  static async countRecords(tableName: string, whereClause: string = ''): Promise<number> {
    try {
      const query = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`;
      const result = await this.executeQuery<{ total: number }>(query);
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0].total;
      }
      
      return 0;
    } catch {
      return 0;
    }
  }
}

// Re-export supabase client for direct access if needed
export { supabase };
