/**
 * PortfolioSnapshot Model
 * Represents a periodic snapshot of a user's total portfolio value.
 */

export interface PortfolioSnapshot {
  id: string;
  user_id: string;
  date: string;          // 'YYYY-MM-DD'
  portfolio_value: number;
  created_at: string;
}
