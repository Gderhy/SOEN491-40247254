import { Request, Response, NextFunction } from 'express';
import {
  getPlatforms,
  createPlatform,
  deletePlatform,
} from '../../controllers/trading-platforms.controller';
import { TradingPlatformsService } from '../../services/trading-platforms.service';
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
jest.mock('../../services/trading-platforms.service');
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

const mockPlatform = {
  id: 'plat-1',
  user_id: 'user-1',
  name: 'Questrade',
  created_at: new Date(),
  updated_at: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe('trading-platforms.controller', () => {
  describe('getPlatforms', () => {
    it('should return platforms for authenticated user', async () => {
      const req = { user: { id: 'user-1' }, query: {}, params: {}, body: {} } as any;
      const res = makeRes();
      (TradingPlatformsService.getPlatforms as jest.Mock).mockResolvedValue([mockPlatform]);

      await getPlatforms(req as Request, res as Response, mockNext);

      expect(TradingPlatformsService.getPlatforms).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [mockPlatform] }));
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = { user: undefined, query: {}, params: {}, body: {} } as any;
      const res = makeRes();

      await getPlatforms(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward service errors to next()', async () => {
      const req = { user: { id: 'user-1' }, query: {}, params: {}, body: {} } as any;
      const res = makeRes();
      const err = new AppError('DB error', HttpStatusCode.INTERNAL_SERVER_ERROR);
      (TradingPlatformsService.getPlatforms as jest.Mock).mockRejectedValue(err);

      await getPlatforms(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('createPlatform', () => {
    it('should create a platform for authenticated user', async () => {
      const req = {
        user: { id: 'user-1' },
        body: { name: 'Questrade' },
        query: {},
        params: {},
      } as any;
      const res = makeRes();
      (TradingPlatformsService.createPlatform as jest.Mock).mockResolvedValue(mockPlatform);

      await createPlatform(req as Request, res as Response, mockNext);

      expect(TradingPlatformsService.createPlatform).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-1', name: 'Questrade' })
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.CREATED);
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = { user: undefined, body: { name: 'X' }, query: {}, params: {} } as any;
      const res = makeRes();

      await createPlatform(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward conflict errors to next()', async () => {
      const req = { user: { id: 'user-1' }, body: { name: 'Questrade' }, query: {}, params: {} } as any;
      const res = makeRes();
      const err = new AppError('Platform already exists', HttpStatusCode.CONFLICT);
      (TradingPlatformsService.createPlatform as jest.Mock).mockRejectedValue(err);

      await createPlatform(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('deletePlatform', () => {
    it('should delete a platform for authenticated user', async () => {
      const req = { user: { id: 'user-1' }, params: { id: 'plat-1' }, query: {}, body: {} } as any;
      const res = makeRes();
      (TradingPlatformsService.deletePlatform as jest.Mock).mockResolvedValue(undefined);

      await deletePlatform(req as Request, res as Response, mockNext);

      expect(TradingPlatformsService.deletePlatform).toHaveBeenCalledWith('plat-1', 'user-1');
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
    });

    it('should forward to next() when user is not authenticated', async () => {
      const req = { user: undefined, params: { id: 'plat-1' }, query: {}, body: {} } as any;
      const res = makeRes();

      await deletePlatform(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: HttpStatusCode.UNAUTHORIZED })
      );
    });

    it('should forward service errors to next()', async () => {
      const req = { user: { id: 'user-1' }, params: { id: 'plat-1' }, query: {}, body: {} } as any;
      const res = makeRes();
      const err = new AppError('Not found', HttpStatusCode.NOT_FOUND);
      (TradingPlatformsService.deletePlatform as jest.Mock).mockRejectedValue(err);

      await deletePlatform(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });
});
