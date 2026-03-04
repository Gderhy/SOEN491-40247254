/**
 * TradingPlatform Model
 */

export interface TradingPlatform {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
}

export interface CreateTradingPlatformPayload {
  user_id: string;
  name: string;
}
