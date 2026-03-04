import { Request, Response, NextFunction } from 'express';
import {
  getAccounts,
  createAccount,
  deleteAccount,
} from '../../controllers/trading-accounts.controller';
import { TradingAccountsService } from '../../services/trading-accounts.service';
import { AppError } from '../../errors/AppError';
import { HttpStatusCode } from '../../config/httpStatus';

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
jest.mock('../../services/trading-accounts.service');
jest.mock('../../config/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

function makeRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const mockAccount = {
  id: 'acc-1',
  user_id: 'user-1',
  platform_id: 'plat-1',
  account_name: 'TFSA',
  account_number: 'A001',
  currency: 'CAD',
  created_at: new Date(),
  updated_at: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe('trading-accounts.controller', () => {
  describe('getAccounts', () => {
    it('should return accounts for authenticated user', async () => {
      const req = { user: { id: 'user-1' }, query: {}, params: {}, body: {} } as any;
      const res = makeRes();
      (TradingAccountsService.getAccounts as jest.Mock).mockResolvedValue([mockAccount]);

      await getAccounts(req as Request, res as Response, mockNext);

      expect(TradingAccountsService.getAccounts).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [mockAccount] }));
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = { user: undefined, query: {}, params: {}, body: {} } as any;
      const res = makeRes();

      await getAccounts(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward service errors to next()', async () => {
      const req = { user: { id: 'user-1' }, query: {}, params: {}, body: {} } as any;
      const res = makeRes();
      const err = new AppError('DB error', HttpStatusCode.INTERNAL_SERVER_ERROR);
      (TradingAccountsService.getAccounts as jest.Mock).mockRejectedValue(err);

      await getAccounts(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('createAccount', () => {
    it('should create an account for authenticated user', async () => {
      const req = {
        user: { id: 'user-1' },
        body: {
          platformId: 'plat-1',
          accountName: 'TFSA',
          accountNumber: 'A001',
          currency: 'CAD',
        },
        query: {},
        params: {},
      } as any;
      const res = makeRes();
      (TradingAccountsService.createAccount as jest.Mock).mockResolvedValue(mockAccount);

      await createAccount(req as Request, res as Response, mockNext);

      expect(TradingAccountsService.createAccount).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-1', platform_id: 'plat-1' })
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.CREATED);
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = { user: undefined, body: {}, query: {}, params: {} } as any;
      const res = makeRes();

      await createAccount(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward service errors to next()', async () => {
      const req = { user: { id: 'user-1' }, body: {}, query: {}, params: {} } as any;
      const res = makeRes();
      const err = new AppError('Conflict', HttpStatusCode.CONFLICT);
      (TradingAccountsService.createAccount as jest.Mock).mockRejectedValue(err);

      await createAccount(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account for authenticated user', async () => {
      const req = { user: { id: 'user-1' }, params: { id: 'acc-1' }, query: {}, body: {} } as any;
      const res = makeRes();
      (TradingAccountsService.deleteAccount as jest.Mock).mockResolvedValue(undefined);

      await deleteAccount(req as Request, res as Response, mockNext);

      expect(TradingAccountsService.deleteAccount).toHaveBeenCalledWith('acc-1', 'user-1');
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = { user: undefined, params: { id: 'acc-1' }, query: {}, body: {} } as any;
      const res = makeRes();

      await deleteAccount(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward service errors to next()', async () => {
      const req = { user: { id: 'user-1' }, params: { id: 'acc-1' }, query: {}, body: {} } as any;
      const res = makeRes();
      const err = new AppError('Not found', HttpStatusCode.NOT_FOUND);
      (TradingAccountsService.deleteAccount as jest.Mock).mockRejectedValue(err);

      await deleteAccount(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });
});
