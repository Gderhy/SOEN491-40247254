import { Transaction, CreateTransactionPayload, UpdateTransactionPayload, PortfolioPosition, PortfolioMetrics } from '../models/Transaction.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode } from '../config/httpStatus.js';
import { ErrorMessage } from '../config/messages.js';
import { supabase } from '../config/supabase.js';

export class TransactionsService {
  static async getTransactions(userId: string, accountId?: string): Promise<Transaction[]> {
    if (!userId) {
      throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    try {
      console.log('Fetching transactions for user:', userId);
      
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      console.log('Transactions fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getTransactions:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch transactions', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  static async createTransaction(transactionData: CreateTransactionPayload): Promise<Transaction> {
    if (!transactionData.user_id || !transactionData.symbol || !transactionData.name || 
        !transactionData.type || transactionData.quantity === undefined || 
        transactionData.price_per_unit === undefined) {
      throw new AppError('Required fields: user_id, symbol, name, type, quantity, price_per_unit', HttpStatusCode.BAD_REQUEST);
    }

    if (transactionData.quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', HttpStatusCode.BAD_REQUEST);
    }

    if (transactionData.price_per_unit <= 0) {
      throw new AppError('Price per unit must be greater than 0', HttpStatusCode.BAD_REQUEST);
    }

    try {
      // Calculate total amount
      const totalAmount = transactionData.quantity * transactionData.price_per_unit;
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: transactionData.user_id,
          account_id: transactionData.account_id || null,
          symbol: transactionData.symbol.toUpperCase(),
          name: transactionData.name,
          type: transactionData.type,
          quantity: transactionData.quantity,
          price_per_unit: transactionData.price_per_unit,
          total_amount: totalAmount,
          currency: transactionData.currency || 'CAD',
          transaction_date: transactionData.transaction_date || new Date(),
          fees: transactionData.fees || 0,
          notes: transactionData.notes
        })
        .select()
        .single();

      if (error) {
        throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create transaction', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  static async getPortfolioPositions(userId: string): Promise<PortfolioPosition[]> {
    if (!userId) {
      throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    try {
      // All aggregation is done inside Postgres via the get_portfolio_holdings() function.
      // The DB computes net quantity, weighted-average cost, realized P&L, and fees
      // using a single GROUP-BY query — no row-by-row JS looping needed.
      const { data, error } = await supabase.rpc('get_portfolio_holdings', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Supabase RPC error (get_portfolio_holdings):', error);
        throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      const rows: any[] = data || [];

      return rows.map(row => ({
        symbol:                row.symbol,
        name:                  row.name ?? row.symbol,
        total_quantity:        Number(row.total_quantity),
        average_buy_price:     Number(row.average_buy_price),
        total_invested:        Number(row.total_invested),
        realized_pnl:          Number(row.realized_pnl),
        total_fees:            Number(row.total_fees),
        transaction_count:     Number(row.transaction_count),
        first_purchase_date:   new Date(row.first_purchase_date),
        last_transaction_date: new Date(row.last_transaction_date),
        // current_price / current_value / unrealized_pnl left for a future market-data integration
        current_price:              undefined,
        current_value:              undefined,
        unrealized_pnl:             undefined,
        unrealized_pnl_percentage:  undefined,
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to calculate portfolio positions', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  static async getPortfolioMetrics(userId: string): Promise<PortfolioMetrics> {
    if (!userId) {
      throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    try {
      console.log('Calculating portfolio metrics for user:', userId);
      
      const positions = await this.getPortfolioPositions(userId);
      
      console.log('Positions found:', positions.length);
      
      const metrics: PortfolioMetrics = {
        total_invested: positions.reduce((sum, pos) => sum + pos.total_invested, 0),
        current_value: positions.reduce((sum, pos) => sum + (pos.current_value || 0), 0),
        total_unrealized_pnl: positions.reduce((sum, pos) => sum + (pos.unrealized_pnl || 0), 0),
        total_unrealized_pnl_percentage: 0,
        total_realized_pnl: positions.reduce((sum, pos) => sum + (pos.realized_pnl || 0), 0),
        total_fees: positions.reduce((sum, pos) => sum + pos.total_fees, 0),
        positions: positions
      };
      
      // Calculate total unrealized P&L percentage
      if (metrics.total_invested > 0) {
        metrics.total_unrealized_pnl_percentage = (metrics.total_unrealized_pnl / metrics.total_invested) * 100;
      }
      
      console.log('Portfolio metrics calculated:', {
        total_invested: metrics.total_invested,
        current_value: metrics.current_value,
        positions_count: metrics.positions.length
      });
      
      return metrics;
    } catch (error) {
      console.error('Error in getPortfolioMetrics:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to calculate portfolio metrics', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  static async getTransactionById(id: string, userId: string): Promise<Transaction> {
    if (!id) {
      throw new AppError('Transaction ID is required', HttpStatusCode.BAD_REQUEST);
    }

    if (!userId) {
      throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new AppError('Transaction not found', HttpStatusCode.NOT_FOUND);
        }
        throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch transaction', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  static async updateTransaction(id: string, updateData: UpdateTransactionPayload): Promise<Transaction> {
    if (!id) {
      throw new AppError('Transaction ID is required', HttpStatusCode.BAD_REQUEST);
    }

    if (!updateData.user_id) {
      throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    if (updateData.quantity !== undefined && updateData.quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', HttpStatusCode.BAD_REQUEST);
    }

    if (updateData.price_per_unit !== undefined && updateData.price_per_unit <= 0) {
      throw new AppError('Price per unit must be greater than 0', HttpStatusCode.BAD_REQUEST);
    }

    try {
      // First verify the transaction exists and belongs to the user
      await this.getTransactionById(id, updateData.user_id);
      
      // Prepare update data
      const updatePayload: any = {
        ...updateData,
        updated_at: new Date()
      };

      // Recalculate total amount if quantity or price changed
      if (updateData.quantity !== undefined || updateData.price_per_unit !== undefined) {
        // Get current transaction to get missing values
        const currentTransaction = await this.getTransactionById(id, updateData.user_id);
        const quantity = updateData.quantity ?? currentTransaction.quantity;
        const pricePerUnit = updateData.price_per_unit ?? currentTransaction.price_per_unit;
        updatePayload.total_amount = quantity * pricePerUnit;
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', updateData.user_id)
        .select()
        .single();

      if (error) {
        throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update transaction', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  static async deleteTransaction(id: string, userId: string): Promise<void> {
    if (!id) {
      throw new AppError('Transaction ID is required', HttpStatusCode.BAD_REQUEST);
    }

    if (!userId) {
      throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    try {
      // First verify transaction exists and belongs to user
      await this.getTransactionById(id, userId);
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete transaction', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
