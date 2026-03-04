/**
 * Transaction-related types for the frontend
 */

export const TransactionType = {
  BUY: 'buy',
  SELL: 'sell'
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export interface Transaction {
  id: string;
  userId: string;
  symbol: string;
  type: TransactionType;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionRequest {
  symbol: string;
  type: TransactionType;
  quantity: number;
  pricePerUnit: number;
  date?: Date;
  notes?: string;
}

export interface UpdateTransactionRequest {
  symbol?: string;
  type?: TransactionType;
  quantity?: number;
  pricePerUnit?: number;
  date?: Date;
  notes?: string;
}

export interface PortfolioPosition {
  symbol: string;
  totalQuantity: number;
  averageCost: number;
  totalInvested: number;
  currentValue?: number;
  unrealizedPnL?: number;
  unrealizedPnLPercent?: number;
  transactions: Transaction[];
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue?: number;
  totalUnrealizedPnL?: number;
  totalUnrealizedPnLPercent?: number;
  positions: PortfolioPosition[];
  lastUpdated: Date;
}

export interface TransactionFilters {
  symbol?: string;
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}
