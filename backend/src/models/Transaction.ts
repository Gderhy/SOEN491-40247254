/**
 * Transaction Model
 * Represents individual buy/sell transactions for asset tracking
 */

import { BaseEntity, BaseCreatePayload, BaseUpdatePayload } from './BaseModel.js';

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell'
}

export interface Transaction extends BaseEntity {
  user_id: string; // uuid - references auth.users(id)
  account_id: string | null; // uuid - references trading_accounts(id)
  symbol: string; // trading symbol (e.g., AAPL, BTC, etc.)
  name: string; // asset name (e.g., Apple Inc., Bitcoin)
  type: TransactionType; // 'buy' or 'sell'
  quantity: number; // amount bought/sold
  price_per_unit: number; // price per unit at transaction time
  total_amount: number; // quantity * price_per_unit
  currency: string; // default 'CAD'
  transaction_date: Date; // when the transaction occurred
  fees?: number; // transaction fees (optional)
  notes?: string; // user notes (optional)
}

/**
 * Transaction creation payload
 */
export interface CreateTransactionPayload extends BaseCreatePayload {
  user_id: string;
  account_id?: string;
  symbol: string;
  name: string;
  type: TransactionType;
  quantity: number;
  price_per_unit: number;
  currency?: string;
  transaction_date: Date;
  fees?: number;
  notes?: string;
}

/**
 * Transaction update payload
 */
export interface UpdateTransactionPayload extends BaseUpdatePayload {
  user_id: string; // Required for security
  account_id?: string;
  symbol?: string;
  name?: string;
  type?: TransactionType;
  quantity?: number;
  price_per_unit?: number;
  currency?: string;
  transaction_date?: Date;
  fees?: number;
  notes?: string;
}

/**
 * Portfolio Position (aggregated view of transactions by symbol)
 */
export interface PortfolioPosition {
  symbol: string;
  name: string;
  total_quantity: number;
  average_buy_price: number;
  total_invested: number;
  current_price?: number;
  current_value?: number;
  unrealized_pnl?: number;
  unrealized_pnl_percentage?: number;
  realized_pnl?: number;
  total_fees: number;
  first_purchase_date: Date;
  last_transaction_date: Date;
  transaction_count: number;
}

/**
 * Performance metrics for portfolio
 */
export interface PortfolioMetrics {
  total_invested: number;
  current_value: number;
  total_unrealized_pnl: number;
  total_unrealized_pnl_percentage: number;
  total_realized_pnl: number;
  total_fees: number;
  positions: PortfolioPosition[];
}
