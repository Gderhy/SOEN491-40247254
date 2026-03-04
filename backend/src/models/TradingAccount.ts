/**
 * TradingAccount Model
 */

export interface TradingAccount {
  id: string;
  user_id: string;
  platform_id: string;
  platform_name?: string; // joined from trading_platforms
  account_name: string;
  account_number: string | null;
  currency: string;
  created_at: Date;
}

export interface CreateTradingAccountPayload {
  user_id: string;
  platform_id: string;
  account_name: string;
  account_number?: string;
  currency?: string;
}
