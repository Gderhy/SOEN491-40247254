import { Request, Response, NextFunction } from 'express';
import {
  getTransactions,
  createTransaction,
  getPortfolioPositions,
  getPortfolioMetrics,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '../../controllers/transactions.controller';
import { TransactionsService } from '../../services/transactions.service';
import { AppError } from '../../errors/AppError';
import { HttpStatusCode } from '../../config/httpStatus';
import { TransactionType } from '../../models/Transaction';

// Replicate asyncHandler behaviour: catch thrown errors and forward to next()
jest.mock('../../utils/asyncHandler', () => ({
  asyncHandler: (fn: Function) =>
    async (req: any, res: any, next: any) => {
      try {
        await fn(req, res, next);
      } catch (err) {
        next(err);
      }
    },
}));
jest.mock('../../services/transactions.service');
jest.mock('../../config/supabase', () => ({
  supabase: { from: jest.fn(), auth: { getUser: jest.fn() } },
}));

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

function makeRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeReq(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    query: {},
    params: {},
    body: {},
    headers: {},
    ...overrides,
  };
}

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
  created_at: new Date(),
  updated_at: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('transactions.controller', () => {
  describe('getTransactions', () => {
    it('should return transactions for authenticated user', async () => {
      const req = makeReq({ user: { id: 'user-1' } } as any);
      const res = makeRes();
      (TransactionsService.getTransactions as jest.Mock).mockResolvedValue([mockTx]);

      await getTransactions(req as Request, res as Response, mockNext);

      expect(TransactionsService.getTransactions).toHaveBeenCalledWith('user-1', undefined);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: [mockTx] })
      );
    });

    it('should filter by accountId query param', async () => {
      const req = makeReq({ user: { id: 'user-1' }, query: { accountId: 'acc-1' } } as any);
      const res = makeRes();
      (TransactionsService.getTransactions as jest.Mock).mockResolvedValue([mockTx]);

      await getTransactions(req as Request, res as Response, mockNext);

      expect(TransactionsService.getTransactions).toHaveBeenCalledWith('user-1', 'acc-1');
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = makeReq({ user: undefined } as any);
      const res = makeRes();

      await getTransactions(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward service errors to next()', async () => {
      const req = makeReq({ user: { id: 'user-1' } } as any);
      const res = makeRes();
      const err = new AppError('DB error', HttpStatusCode.INTERNAL_SERVER_ERROR);
      (TransactionsService.getTransactions as jest.Mock).mockRejectedValue(err);

      await getTransactions(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction for authenticated user', async () => {
      const req = makeReq({
        user: { id: 'user-1' },
        body: {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          type: 'buy',
          quantity: 5,
          price_per_unit: 150,
          transaction_date: '2024-01-01',
        },
      } as any);
      const res = makeRes();
      (TransactionsService.createTransaction as jest.Mock).mockResolvedValue(mockTx);

      await createTransaction(req as Request, res as Response, mockNext);

      expect(TransactionsService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-1', symbol: 'AAPL' })
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.CREATED);
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = makeReq({ user: undefined } as any);
      const res = makeRes();

      await createTransaction(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward service errors to next()', async () => {
      const req = makeReq({ user: { id: 'user-1' }, body: {} } as any);
      const res = makeRes();
      const err = new AppError('Validation', HttpStatusCode.BAD_REQUEST);
      (TransactionsService.createTransaction as jest.Mock).mockRejectedValue(err);

      await createTransaction(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('getPortfolioPositions', () => {
    it('should return portfolio positions for authenticated user', async () => {
      const req = makeReq({ user: { id: 'user-1' } } as any);
      const res = makeRes();
      const positions = [{ symbol: 'AAPL', total_quantity: 10, total_invested: 1500 }];
      (TransactionsService.getPortfolioPositions as jest.Mock).mockResolvedValue(positions);

      await getPortfolioPositions(req as Request, res as Response, mockNext);

      expect(TransactionsService.getPortfolioPositions).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = makeReq({ user: undefined } as any);
      const res = makeRes();

      await getPortfolioPositions(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });
  });

  describe('getPortfolioMetrics', () => {
    it('should return portfolio metrics for authenticated user', async () => {
      const req = makeReq({ user: { id: 'user-1' } } as any);
      const res = makeRes();
      const metrics = { total_invested: 1500, current_value: 1600, positions: [] };
      (TransactionsService.getPortfolioMetrics as jest.Mock).mockResolvedValue(metrics);

      await getPortfolioMetrics(req as Request, res as Response, mockNext);

      expect(TransactionsService.getPortfolioMetrics).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = makeReq({ user: undefined } as any);
      const res = makeRes();

      await getPortfolioMetrics(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });
  });

  describe('getTransactionById', () => {
    it('should return a transaction for authenticated user', async () => {
      const req = makeReq({ user: { id: 'user-1' }, params: { id: 'tx-1' } } as any);
      const res = makeRes();
      (TransactionsService.getTransactionById as jest.Mock).mockResolvedValue(mockTx);

      await getTransactionById(req as Request, res as Response, mockNext);

      expect(TransactionsService.getTransactionById).toHaveBeenCalledWith('tx-1', 'user-1');
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = makeReq({ user: undefined, params: { id: 'tx-1' } } as any);
      const res = makeRes();

      await getTransactionById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward to next() when id is missing', async () => {
      const req = makeReq({ user: { id: 'user-1' }, params: {} } as any);
      const res = makeRes();

      await getTransactionById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.BAD_REQUEST })
      );
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction for authenticated user', async () => {
      const req = makeReq({
        user: { id: 'user-1' },
        params: { id: 'tx-1' },
        body: { quantity: 20 },
      } as any);
      const res = makeRes();
      (TransactionsService.updateTransaction as jest.Mock).mockResolvedValue({ ...mockTx, quantity: 20 });

      await updateTransaction(req as Request, res as Response, mockNext);

      expect(TransactionsService.updateTransaction).toHaveBeenCalledWith(
        'tx-1',
        expect.objectContaining({ user_id: 'user-1' })
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = makeReq({ user: undefined, params: { id: 'tx-1' }, body: {} } as any);
      const res = makeRes();

      await updateTransaction(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward to next() when id is missing', async () => {
      const req = makeReq({ user: { id: 'user-1' }, params: {}, body: {} } as any);
      const res = makeRes();

      await updateTransaction(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.BAD_REQUEST })
      );
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction for authenticated user', async () => {
      const req = makeReq({ user: { id: 'user-1' }, params: { id: 'tx-1' } } as any);
      const res = makeRes();
      (TransactionsService.deleteTransaction as jest.Mock).mockResolvedValue(undefined);

      await deleteTransaction(req as Request, res as Response, mockNext);

      expect(TransactionsService.deleteTransaction).toHaveBeenCalledWith('tx-1', 'user-1');
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = makeReq({ user: undefined, params: { id: 'tx-1' } } as any);
      const res = makeRes();

      await deleteTransaction(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward to next() when id is missing', async () => {
      const req = makeReq({ user: { id: 'user-1' }, params: {} } as any);
      const res = makeRes();

      await deleteTransaction(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.BAD_REQUEST })
      );
    });
  });
});
