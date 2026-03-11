import { StocksService } from '../../services/stocks.service';
import { AppError } from '../../errors/AppError';
import { HttpStatusCode } from '../../config/httpStatus';

// Mock the global fetch
const mockFetch = jest.fn() as jest.Mock;
global.fetch = mockFetch;

// Mock config so apiKey is always present by default
jest.mock('../../config/env', () => ({
  config: {
    port: 4000,
    nodeEnv: 'test',
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon',
      serviceRoleKey: 'test-service',
    },
    finnhub: { apiKey: 'test-finnhub-key' },
  },
}));

function makeResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

const validFinnhubQuote = { c: 150.5, d: 1.2, dp: 0.8, h: 152, l: 148, o: 149, pc: 149.3, t: 1700000000 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('StocksService', () => {
  describe('getQuote', () => {
    it('returns a normalized quote for a valid symbol', async () => {
      mockFetch.mockResolvedValue(makeResponse(200, validFinnhubQuote));

      const result = await StocksService.getQuote('AAPL');

      expect(result).toEqual({
        symbol: 'AAPL',
        price: 150.5,
        change: 1.2,
        changePercent: 0.8,
        high: 152,
        low: 148,
        open: 149,
        previousClose: 149.3,
        timestamp: 1700000000,
      });
    });

    it('throws NOT_FOUND AppError when Finnhub returns all-zero response', async () => {
      mockFetch.mockResolvedValue(
        makeResponse(200, { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0, t: 0 })
      );

      await expect(StocksService.getQuote('INVALID')).rejects.toMatchObject({
        statusCode: HttpStatusCode.NOT_FOUND,
      });
    });

    it('throws TOO_MANY_REQUESTS AppError when Finnhub returns 429', async () => {
      mockFetch.mockResolvedValue(makeResponse(429, {}));

      await expect(StocksService.getQuote('AAPL')).rejects.toMatchObject({
        statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
      });
    });

    it('throws BAD_GATEWAY AppError when Finnhub returns a non-ok status', async () => {
      mockFetch.mockResolvedValue(makeResponse(500, {}));

      await expect(StocksService.getQuote('AAPL')).rejects.toMatchObject({
        statusCode: HttpStatusCode.BAD_GATEWAY,
      });
    });

    it('throws BAD_GATEWAY AppError when fetch itself throws (network error)', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(StocksService.getQuote('AAPL')).rejects.toMatchObject({
        statusCode: HttpStatusCode.BAD_GATEWAY,
      });
    });

    it('throws INTERNAL_SERVER_ERROR when API key is missing', async () => {
      jest.resetModules();
      jest.doMock('../../config/env', () => ({
        config: {
          port: 4000,
          nodeEnv: 'test',
          supabase: { url: '', anonKey: '', serviceRoleKey: '' },
          finnhub: { apiKey: '' },
        },
      }));

      const { StocksService: S } = await import('../../services/stocks.service');
      await expect(S.getQuote('AAPL')).rejects.toMatchObject({
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('getQuotes', () => {
    it('returns a map of quotes for valid symbols', async () => {
      mockFetch.mockResolvedValue(makeResponse(200, validFinnhubQuote));

      const result = await StocksService.getQuotes(['AAPL', 'MSFT']);

      expect(result).toHaveProperty('AAPL');
      expect(result).toHaveProperty('MSFT');
      expect((result['AAPL'] as any).price).toBe(150.5);
    });

    it('embeds individual errors without failing the whole batch', async () => {
      mockFetch
        .mockResolvedValueOnce(makeResponse(200, validFinnhubQuote))
        .mockResolvedValueOnce(
          makeResponse(200, { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0, t: 0 })
        );

      const result = await StocksService.getQuotes(['AAPL', 'UNKNOWN']);

      expect((result['AAPL'] as any).price).toBe(150.5);
      expect((result['UNKNOWN'] as any).error).toBeDefined();
    });
  });
});
