/**
 * Trading Platform & Account types for the frontend
 */

export interface TradingPlatform {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
}

export interface TradingAccount {
  id: string;
  userId: string;
  platformId: string;
  platformName: string;
  accountName: string;
  accountNumber: string | null;
  currency: string;
  createdAt: Date;
}

export interface CreateTradingPlatformRequest {
  name: string;
}

export interface CreateTradingAccountRequest {
  platformId: string;
  accountName: string;
  accountNumber?: string;
  currency?: string;
}
