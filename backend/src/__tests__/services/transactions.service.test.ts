import { TransactionsService } from '../../services/transactions.service';
import { AppError } from '../../errors/AppError';
import { HttpStatusCode } from '../../config/httpStatus';
import { TransactionType } from '../../models/Transaction';

jest.mock('../../config/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

import { supabase } from '../../config/supabase';

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as unknown as jest.Mock;

const mockTx = {
  id: 'tx-1',
  user_id: 'user-1',
  account_id: null,
  symbol: 'AAPL',
  name: 'Apple Inc.',
  type: TransactionType.BUY,
  quantity: 10,
  price_per_unit: 150,
  total_amount: 1500,
  currency: 'CAD',
  transaction_date: new Date('2024-01-01'),
  fees: 0,
  notes: null,
  created_at: new Date(),
  updated_at: new Date(),
};

function makeChain(resolveValue: any) {
  const chain: any = {};
  ['select', 'insert', 'update', 'delete', 'eq', 'order'].forEach(m => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });
  // single() returns a promise resolving to the same value
  chain.single = jest.fn().mockResolvedValue(resolveValue);
  // Make chain itself thenable so `await chain` works for direct-await patterns
  chain.then = (resolve: any, reject: any) =>
    Promise.resolve(resolveValue).then(resolve, reject);
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TransactionsService', () => {
  describe('getTransactions', () => {
    it('should throw AppError when userId is empty', async () => {
      await expect(TransactionsService.getTransactions('')).rejects.toThrow(AppError);
    });

    it('should return transactions for a valid userId', async () => {
      const chain = makeChain({ data: [mockTx], error: null });
      mockFrom.mockReturnValue(chain);

      const result = await TransactionsService.getTransactions('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('AAPL');
    });

    it('should filter by accountId when provided', async () => {
      const chain = makeChain({ data: [mockTx], error: null });
      mockFrom.mockReturnValue(chain);

      await TransactionsService.getTransactions('user-1', 'acc-1');

      // The second eq() call should be for account_id
      expect(chain.eq).toHaveBeenCalledWith('account_id', 'acc-1');
    });

    it('should throw AppError on database error', async () => {
      const chain = makeChain({ data: null, error: { message: 'DB failure' } });
      mockFrom.mockReturnValue(chain);

      await expect(TransactionsService.getTransactions('user-1')).rejects.toThrow(AppError);
    });
  });

  describe('createTransaction', () => {
    const validPayload = {
      user_id: 'user-1',
      symbol: 'aapl',
      name: 'Apple Inc.',
      type: TransactionType.BUY,
      quantity: 10,
      price_per_unit: 150,
      transaction_date: new Date(),
    };

    it('should throw AppError when required fields are missing', async () => {
      await expect(
        TransactionsService.createTransaction({ ...validPayload, symbol: '' } as any)
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when quantity is zero or negative', async () => {
      await expect(
        TransactionsService.createTransaction({ ...validPayload, quantity: 0 })
      ).rejects.toThrow(AppError);

      await expect(
        TransactionsService.createTransaction({ ...validPayload, quantity: -5 })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when price_per_unit is zero or negative', async () => {
      await expect(
        TransactionsService.createTransaction({ ...validPayload, price_per_unit: 0 })
      ).rejects.toThrow(AppError);
    });

    it('should create a transaction and uppercase the symbol', async () => {
      const insertedTx = { ...mockTx, symbol: 'AAPL' };
      const chain = makeChain({ data: insertedTx, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await TransactionsService.createTransaction(validPayload);
      expect(result.symbol).toBe('AAPL');
    });

    it('should throw AppError on database error during insert', async () => {
      const chain = makeChain({ data: null, error: { message: 'insert failed' } });
      mockFrom.mockReturnValue(chain);

      await expect(TransactionsService.createTransaction(validPayload)).rejects.toThrow(AppError);
    });
  });

  describe('getPortfolioPositions', () => {
    it('should throw AppError when userId is empty', async () => {
      await expect(TransactionsService.getPortfolioPositions('')).rejects.toThrow(AppError);
    });

    it('should return mapped portfolio positions', async () => {
      const rpcRow = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        total_quantity: '10',
        average_buy_price: '150',
        total_invested: '1500',
        realized_pnl: '0',
        total_fees: '0',
        transaction_count: '1',
        first_purchase_date: '2024-01-01',
        last_transaction_date: '2024-01-02',
      };
      mockRpc.mockResolvedValue({ data: [rpcRow], error: null });

      const result = await TransactionsService.getPortfolioPositions('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('AAPL');
      expect(result[0].total_quantity).toBe(10);
    });

    it('should throw AppError on RPC error', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'rpc failed' } });

      await expect(TransactionsService.getPortfolioPositions('user-1')).rejects.toThrow(AppError);
    });
  });

  describe('getPortfolioMetrics', () => {
    it('should throw AppError when userId is empty', async () => {
      await expect(TransactionsService.getPortfolioMetrics('')).rejects.toThrow(AppError);
    });

    it('should aggregate positions into metrics', async () => {
      const rpcRow = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        total_quantity: '10',
        average_buy_price: '150',
        total_invested: '1500',
        realized_pnl: '50',
        total_fees: '5',
        transaction_count: '1',
        first_purchase_date: '2024-01-01',
        last_transaction_date: '2024-01-02',
      };
      mockRpc.mockResolvedValue({ data: [rpcRow], error: null });

      const metrics = await TransactionsService.getPortfolioMetrics('user-1');
      expect(metrics.total_invested).toBe(1500);
      expect(metrics.total_realized_pnl).toBe(50);
      expect(metrics.positions).toHaveLength(1);
    });
  });

  describe('getTransactionById', () => {
    it('should throw AppError when id is empty', async () => {
      await expect(TransactionsService.getTransactionById('', 'user-1')).rejects.toThrow(AppError);
    });

    it('should throw AppError when userId is empty', async () => {
      await expect(TransactionsService.getTransactionById('tx-1', '')).rejects.toThrow(AppError);
    });

    it('should return transaction for valid id and userId', async () => {
      const chain = makeChain({ data: mockTx, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await TransactionsService.getTransactionById('tx-1', 'user-1');
      expect(result.id).toBe('tx-1');
    });

    it('should throw 404 AppError for PGRST116 error code', async () => {
      const chain = makeChain({ data: null, error: { code: 'PGRST116', message: 'not found' } });
      mockFrom.mockReturnValue(chain);

      await expect(TransactionsService.getTransactionById('tx-1', 'user-1')).rejects.toMatchObject({
        statusCode: HttpStatusCode.NOT_FOUND,
      });
    });
  });

  describe('updateTransaction', () => {
    it('should throw AppError when id is empty', async () => {
      await expect(
        TransactionsService.updateTransaction('', { user_id: 'user-1' })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when user_id is missing', async () => {
      await expect(
        TransactionsService.updateTransaction('tx-1', { user_id: '' })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when quantity is zero or negative', async () => {
      await expect(
        TransactionsService.updateTransaction('tx-1', { user_id: 'user-1', quantity: 0 })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when price_per_unit is negative', async () => {
      await expect(
        TransactionsService.updateTransaction('tx-1', { user_id: 'user-1', price_per_unit: -1 })
      ).rejects.toThrow(AppError);
    });

    it('should update and return the transaction', async () => {
      const updatedTx = { ...mockTx, quantity: 20 };
      // updateTransaction calls getTransactionById twice, then does the update
      mockFrom
        .mockReturnValueOnce(makeChain({ data: mockTx, error: null }))    // 1st getTransactionById
        .mockReturnValueOnce(makeChain({ data: mockTx, error: null }))    // 2nd getTransactionById
        .mockReturnValueOnce(makeChain({ data: updatedTx, error: null })); // update .select().single()

      const result = await TransactionsService.updateTransaction('tx-1', {
        user_id: 'user-1',
        quantity: 20,
      });
      expect(result.quantity).toBe(20);
    });
  });

  describe('deleteTransaction', () => {
    it('should throw AppError when id is empty', async () => {
      await expect(TransactionsService.deleteTransaction('', 'user-1')).rejects.toThrow(AppError);
    });

    it('should throw AppError when userId is empty', async () => {
      await expect(TransactionsService.deleteTransaction('tx-1', '')).rejects.toThrow(AppError);
    });

    it('should delete the transaction successfully', async () => {
      mockFrom
        .mockReturnValueOnce(makeChain({ data: mockTx, error: null })) // getTransactionById
        .mockReturnValueOnce(makeChain({ error: null }));               // delete chain

      await expect(
        TransactionsService.deleteTransaction('tx-1', 'user-1')
      ).resolves.toBeUndefined();
    });

    it('should throw AppError on database error during delete', async () => {
      mockFrom
        .mockReturnValueOnce(makeChain({ data: mockTx, error: null }))          // getTransactionById
        .mockReturnValueOnce(makeChain({ error: { message: 'del failed' } }));  // delete chain

      await expect(
        TransactionsService.deleteTransaction('tx-1', 'user-1')
      ).rejects.toThrow(AppError);
    });
  });
});
