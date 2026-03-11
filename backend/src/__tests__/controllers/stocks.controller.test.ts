import { Request, Response, NextFunction } from 'express';
import { getQuote, getQuotes } from '../../controllers/stocks.controller';
import { StocksService } from '../../services/stocks.service';
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
jest.mock('../../services/stocks.service');
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

const mockQuote = {
  symbol: 'AAPL',
  price: 150.5,
  change: 1.2,
  changePercent: 0.8,
  high: 152,
  low: 148,
  open: 149,
  previousClose: 149.3,
  timestamp: 1700000000,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('stocks.controller', () => {
  describe('getQuote', () => {
    it('returns 200 with a valid quote for an authenticated request', async () => {
      const req = { user: { id: 'user-1' }, query: { symbol: 'AAPL' }, params: {}, body: {} } as any;
      const res = makeRes();
      (StocksService.getQuote as jest.Mock).mockResolvedValue(mockQuote);

      await getQuote(req as Request, res as Response, mockNext);

      expect(StocksService.getQuote).toHaveBeenCalledWith('AAPL');
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockQuote }));
    });

    it('forwards BAD_REQUEST to next() when symbol is missing', async () => {
      const req = { user: { id: 'user-1' }, query: {}, params: {}, body: {} } as any;
      const res = makeRes();

      await getQuote(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.BAD_REQUEST })
      );
    });

    it('forwards NOT_FOUND error from service to next()', async () => {
      const req = { user: { id: 'user-1' }, query: { symbol: 'INVALID' }, params: {}, body: {} } as any;
      const res = makeRes();
      (StocksService.getQuote as jest.Mock).mockRejectedValue(
        new AppError('Symbol not found: INVALID', HttpStatusCode.NOT_FOUND)
      );

      await getQuote(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.NOT_FOUND })
      );
    });

    it('forwards rate-limit error from service to next()', async () => {
      const req = { user: { id: 'user-1' }, query: { symbol: 'AAPL' }, params: {}, body: {} } as any;
      const res = makeRes();
      (StocksService.getQuote as jest.Mock).mockRejectedValue(
        new AppError('Rate limit exceeded', HttpStatusCode.TOO_MANY_REQUESTS)
      );

      await getQuote(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.TOO_MANY_REQUESTS })
      );
    });

    it('forwards provider failure to next()', async () => {
      const req = { user: { id: 'user-1' }, query: { symbol: 'AAPL' }, params: {}, body: {} } as any;
      const res = makeRes();
      (StocksService.getQuote as jest.Mock).mockRejectedValue(
        new AppError('Provider failure', HttpStatusCode.BAD_GATEWAY)
      );

      await getQuote(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.BAD_GATEWAY })
      );
    });
  });

  describe('getQuotes', () => {
    it('returns 200 with a map of quotes', async () => {
      const req = { user: { id: 'user-1' }, query: { symbols: 'AAPL,MSFT' }, params: {}, body: {} } as any;
      const res = makeRes();
      const mockMap = { AAPL: mockQuote, MSFT: { ...mockQuote, symbol: 'MSFT' } };
      (StocksService.getQuotes as jest.Mock).mockResolvedValue(mockMap);

      await getQuotes(req as Request, res as Response, mockNext);

      expect(StocksService.getQuotes).toHaveBeenCalledWith(['AAPL', 'MSFT']);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockMap }));
    });

    it('forwards BAD_REQUEST to next() when symbols is missing', async () => {
      const req = { user: { id: 'user-1' }, query: {}, params: {}, body: {} } as any;
      const res = makeRes();

      await getQuotes(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.BAD_REQUEST })
      );
    });

    it('forwards BAD_REQUEST to next() when symbols string is empty', async () => {
      const req = { user: { id: 'user-1' }, query: { symbols: '  ,  ' }, params: {}, body: {} } as any;
      const res = makeRes();

      await getQuotes(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.BAD_REQUEST })
      );
    });
  });
});
