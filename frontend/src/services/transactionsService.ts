/**
 * Transactions API Service
 * Handles all transaction-related API calls
 */

import { apiClient } from './apiClient';
import type { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest,
  PortfolioSummary,
  TransactionFilters
} from '../types/transactions';

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
    const url = queryString ? `api/transactions?${queryString}` : 'api/transactions';

    const response = await apiClient.get<{ data: Transaction[] }>(url);
    return response?.data?.data ?? [];
  }

  /**
   * Get a specific transaction by ID
   */
  static async getTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.get<{ data: Transaction }>(`api/transactions/${id}`);
    if (!response?.data?.data) {
      throw new Error('Transaction not found or invalid response format');
    }
    return response.data.data;
  }

  /**
   * Create a new transaction
   */
  static async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    const response = await apiClient.post<{ data: Transaction }>('api/transactions', transaction);
    if (!response?.data?.data) {
      throw new Error('Failed to create transaction or invalid response format');
    }
    return response.data.data;
  }

  /**
   * Update an existing transaction
   */
  static async updateTransaction(id: string, updates: UpdateTransactionRequest): Promise<Transaction> {
    const response = await apiClient.put<{ data: Transaction }>(`api/transactions/${id}`, updates);
    if (!response?.data?.data) {
      throw new Error('Failed to update transaction or invalid response format');
    }
    return response.data.data;
  }

  /**
   * Delete a transaction
   */
  static async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  }

  /**
   * Get portfolio summary with positions and performance
   */
  static async getPortfolioSummary(): Promise<PortfolioSummary> {
    const response = await apiClient.get<{ data: any }>('api/transactions/metrics');
    if (!response?.data?.data) {
      throw new Error('Failed to get portfolio summary or invalid response format');
    }
    
    const metrics = response.data.data;
    
    // Map backend PortfolioMetrics to frontend PortfolioSummary
    return {
      totalInvested: metrics.total_invested || 0,
      currentValue: metrics.current_value,
      totalUnrealizedPnL: metrics.total_unrealized_pnl,
      totalUnrealizedPnLPercent: metrics.total_unrealized_pnl_percentage,
      positions: (metrics.positions || []).map((pos: any) => ({
        symbol: pos.symbol,
        totalQuantity: pos.total_quantity || 0,
        averageCost: pos.average_buy_price || 0,
        totalInvested: pos.total_invested || 0,
        currentValue: pos.current_value,
        unrealizedPnL: pos.unrealized_pnl,
        unrealizedPnLPercent: pos.unrealized_pnl_percentage,
        transactions: [] // Transactions would need to be fetched separately if needed
      })),
      lastUpdated: new Date()
    };
  }

  /**
   * Get transactions for a specific symbol
   */
  static async getTransactionsBySymbol(symbol: string): Promise<Transaction[]> {
    return this.getTransactions({ symbol });
  }
}

export default TransactionsService;
