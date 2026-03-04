/**
 * Transactions API Service
 * Handles all transaction-related API calls
 */

import { apiService } from './apiService';
import type { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest,
  PortfolioSummary,
  PortfolioPosition,
  TransactionFilters
} from '../types/transactions';

/** Map a raw backend row (snake_case) to the frontend Transaction shape (camelCase) */
function mapTransaction(raw: any): Transaction {
  return {
    id: raw.id,
    userId: raw.user_id,
    symbol: raw.symbol,
    name: raw.name ?? raw.symbol,
    type: raw.type,
    quantity: Number(raw.quantity),
    pricePerUnit: Number(raw.price_per_unit),
    totalAmount: Number(raw.total_amount),
    date: new Date(raw.transaction_date),
    fees: raw.fees != null ? Number(raw.fees) : undefined,
    notes: raw.notes ?? undefined,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
  };
}

/** Map a raw backend position row to the frontend PortfolioPosition shape */
function mapPosition(pos: any): PortfolioPosition {
  return {
    symbol: pos.symbol,
    name: pos.name ?? pos.symbol,
    totalQuantity: Number(pos.total_quantity) || 0,
    averageBuyPrice: Number(pos.average_buy_price) || 0,
    totalInvested: Number(pos.total_invested) || 0,
    currentPrice: pos.current_price != null ? Number(pos.current_price) : undefined,
    currentValue: pos.current_value != null ? Number(pos.current_value) : undefined,
    unrealizedPnL: pos.unrealized_pnl != null ? Number(pos.unrealized_pnl) : undefined,
    unrealizedPnLPercent: pos.unrealized_pnl_percentage != null ? Number(pos.unrealized_pnl_percentage) : undefined,
    realizedPnL: pos.realized_pnl != null ? Number(pos.realized_pnl) : undefined,
    totalFees: Number(pos.total_fees) || 0,
    firstPurchaseDate: new Date(pos.first_purchase_date),
    lastTransactionDate: new Date(pos.last_transaction_date),
    transactionCount: Number(pos.transaction_count) || 0,
  };
}

export class TransactionsService {
  /**
   * Get all user transactions
   */
  static async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    const params = new URLSearchParams();
    
    if (filters?.symbol) params.append('symbol', filters.symbol);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/api/transactions?${queryString}` : '/api/transactions';

    const response = await apiService.http.get(url);
    const rows: any[] = response.data?.data ?? [];
    return rows.map(mapTransaction);
  }

  /**
   * Get a specific transaction by ID
   */
  static async getTransaction(id: string): Promise<Transaction> {
    const response = await apiService.http.get(`/api/transactions/${id}`);
    const raw = response.data?.data;
    if (!raw) throw new Error('Transaction not found or invalid response format');
    return mapTransaction(raw);
  }

  /**
   * Create a new transaction
   */
  static async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    const response = await apiService.http.post('/api/transactions', {
      symbol: transaction.symbol,
      name: transaction.name ?? transaction.symbol,
      type: transaction.type,
      quantity: transaction.quantity,
      price_per_unit: transaction.pricePerUnit,
      transaction_date: transaction.date ?? new Date(),
      fees: transaction.fees,
      notes: transaction.notes,
    });
    const raw = response.data?.data;
    if (!raw) throw new Error('Failed to create transaction or invalid response format');
    return mapTransaction(raw);
  }

  /**
   * Update an existing transaction
   */
  static async updateTransaction(id: string, updates: UpdateTransactionRequest): Promise<Transaction> {
    const response = await apiService.http.put(`/api/transactions/${id}`, {
      ...(updates.symbol !== undefined && { symbol: updates.symbol }),
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.type !== undefined && { type: updates.type }),
      ...(updates.quantity !== undefined && { quantity: updates.quantity }),
      ...(updates.pricePerUnit !== undefined && { price_per_unit: updates.pricePerUnit }),
      ...(updates.date !== undefined && { transaction_date: updates.date }),
      ...(updates.fees !== undefined && { fees: updates.fees }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
    });
    const raw = response.data?.data;
    if (!raw) throw new Error('Failed to update transaction or invalid response format');
    return mapTransaction(raw);
  }

  /**
   * Delete a transaction
   */
  static async deleteTransaction(id: string): Promise<void> {
    await apiService.http.delete(`/api/transactions/${id}`);
  }

  /**
   * Get portfolio summary with positions and performance
   */
  static async getPortfolioSummary(): Promise<PortfolioSummary> {
    const response = await apiService.http.get('/api/transactions/metrics');
    const metrics = response.data?.data;

    if (!metrics) {
      throw new Error('Failed to get portfolio summary or invalid response format');
    }
    
    return {
      totalInvested: metrics.total_invested || 0,
      currentValue: metrics.current_value,
      totalUnrealizedPnL: metrics.total_unrealized_pnl,
      totalUnrealizedPnLPercent: metrics.total_unrealized_pnl_percentage,
      positions: (metrics.positions || []).map(mapPosition),
      lastUpdated: new Date()
    };
  }

  /**
   * Get transactions for a specific symbol
   */
  static async getTransactionsBySymbol(symbol: string): Promise<Transaction[]> {
    return this.getTransactions({ symbol });
  }

  /**
   * Get aggregated portfolio positions (one row per symbol, derived from transactions)
   */
  static async getPortfolioPositions(): Promise<PortfolioPosition[]> {
    const response = await apiService.http.get('/api/transactions/portfolio');
    const rows: any[] = response.data?.data ?? [];
    return rows.map(mapPosition);
  }
}

export default TransactionsService;
