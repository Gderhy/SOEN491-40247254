import { TradingPlatformsService } from '../../services/trading-platforms.service';
import { AppError } from '../../errors/AppError';
import { HttpStatusCode } from '../../config/httpStatus';

jest.mock('../../config/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '../../config/supabase';

const mockFrom = supabase.from as jest.Mock;

const mockPlatform = {
  id: 'plat-1',
  user_id: 'user-1',
  name: 'Questrade',
  created_at: new Date(),
  updated_at: new Date(),
};

function makeChain(resolveValue: any) {
  const chain: any = {};
  ['select', 'insert', 'update', 'delete', 'eq', 'order'].forEach(m => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });
  chain.single = jest.fn().mockResolvedValue(resolveValue);
  chain.then = (resolve: any, reject: any) =>
    Promise.resolve(resolveValue).then(resolve, reject);
  return chain;
}

beforeEach(() => jest.clearAllMocks());

describe('TradingPlatformsService', () => {
  describe('getPlatforms', () => {
    it('should throw AppError when userId is empty', async () => {
      await expect(TradingPlatformsService.getPlatforms('')).rejects.toThrow(AppError);
    });

    it('should return platforms for a valid userId', async () => {
      const chain = makeChain({ data: [mockPlatform], error: null });
      mockFrom.mockReturnValue(chain);

      const result = await TradingPlatformsService.getPlatforms('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Questrade');
    });

    it('should throw AppError on database error', async () => {
      const chain = makeChain({ data: null, error: { message: 'DB failure' } });
      mockFrom.mockReturnValue(chain);

      await expect(TradingPlatformsService.getPlatforms('user-1')).rejects.toThrow(AppError);
    });

    it('should return empty array when no platforms exist', async () => {
      const chain = makeChain({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await TradingPlatformsService.getPlatforms('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('createPlatform', () => {
    it('should throw AppError when user_id is missing', async () => {
      await expect(
        TradingPlatformsService.createPlatform({ user_id: '', name: 'Questrade' })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when name is missing or empty', async () => {
      await expect(
        TradingPlatformsService.createPlatform({ user_id: 'user-1', name: '' })
      ).rejects.toThrow(AppError);

      await expect(
        TradingPlatformsService.createPlatform({ user_id: 'user-1', name: '   ' })
      ).rejects.toThrow(AppError);
    });

    it('should create a platform and trim the name', async () => {
      const chain = makeChain({ data: mockPlatform, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await TradingPlatformsService.createPlatform({
        user_id: 'user-1',
        name: '  Questrade  ',
      });
      expect(result.name).toBe('Questrade');
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Questrade' })
      );
    });

    it('should throw CONFLICT AppError on duplicate name (error code 23505)', async () => {
      const chain = makeChain({ data: null, error: { code: '23505', message: 'duplicate' } });
      mockFrom.mockReturnValue(chain);

      await expect(
        TradingPlatformsService.createPlatform({ user_id: 'user-1', name: 'Questrade' })
      ).rejects.toMatchObject({ statusCode: HttpStatusCode.CONFLICT });
    });

    it('should throw AppError on other database errors', async () => {
      const chain = makeChain({ data: null, error: { code: '99999', message: 'unknown' } });
      mockFrom.mockReturnValue(chain);

      await expect(
        TradingPlatformsService.createPlatform({ user_id: 'user-1', name: 'X' })
      ).rejects.toThrow(AppError);
    });
  });

  describe('deletePlatform', () => {
    it('should throw AppError when id is missing', async () => {
      await expect(TradingPlatformsService.deletePlatform('', 'user-1')).rejects.toThrow(AppError);
    });

    it('should throw AppError when userId is missing', async () => {
      await expect(TradingPlatformsService.deletePlatform('plat-1', '')).rejects.toThrow(AppError);
    });

    it('should delete a platform successfully', async () => {
      const chain = makeChain({ error: null });
      mockFrom.mockReturnValue(chain);

      await expect(
        TradingPlatformsService.deletePlatform('plat-1', 'user-1')
      ).resolves.toBeUndefined();
    });

    it('should throw AppError on database error', async () => {
      const chain = makeChain({ error: { message: 'delete failed' } });
      mockFrom.mockReturnValue(chain);

      await expect(
        TradingPlatformsService.deletePlatform('plat-1', 'user-1')
      ).rejects.toThrow(AppError);
    });
  });
});
