/**
 * Portfolio Snapshots Service
 * Manages periodic snapshots of the total portfolio value.
 */

import { supabase } from '../config/supabase.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode } from '../config/httpStatus.js';
import { PortfolioSnapshot } from '../models/PortfolioSnapshot.js';

export type { PortfolioSnapshot };

export class PortfolioSnapshotsService {
  /**
   * Return all snapshots for a user, ordered by date ascending.
   * @param userId  Authenticated user's UUID
   * @param limit   Maximum number of snapshots to return (default 365)
   */
  static async getSnapshots(userId: string, limit = 365): Promise<PortfolioSnapshot[]> {
    if (!userId) {
      throw new AppError('User ID is required', HttpStatusCode.BAD_REQUEST);
    }

    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }

    return data ?? [];
  }

  /**
   * Upsert a snapshot for today.
   * If a snapshot already exists for today it is updated; otherwise a new row is created.
   */
  static async upsertTodaySnapshot(userId: string, portfolioValue: number): Promise<PortfolioSnapshot> {
    if (!userId) {
      throw new AppError('User ID is required', HttpStatusCode.BAD_REQUEST);
    }

    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .upsert(
        { user_id: userId, date: today, portfolio_value: portfolioValue },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) {
      throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }

    return data;
  }
}
