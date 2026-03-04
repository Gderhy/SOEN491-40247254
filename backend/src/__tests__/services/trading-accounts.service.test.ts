import { TradingAccountsService } from '../../services/trading-accounts.service';
import { AppError } from '../../errors/AppError';
import { HttpStatusCode } from '../../config/httpStatus';

// Mock the supabase module
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  supabaseAdmin: {
    from: jest.fn(),
  },
  default: {
    from: jest.fn(),
  },
}));

import { supabase } from '../../config/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('TradingAccountsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccounts', () => {
    it('should throw AppError if userId is empty', async () => {
      await expect(TradingAccountsService.getAccounts('')).rejects.toThrow(AppError);
    });

    it('should return accounts for a valid userId', async () => {
      const mockAccounts = [
        {
          id: '1',
          user_id: 'user-123',
          platform_id: 'plat-1',
          account_name: 'Test Account',
          account_number: 'ACC001',
          currency: 'CAD',
          created_at: new Date().toISOString(),
          trading_platforms: { name: 'Test Platform' },
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockAccounts, error: null }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await TradingAccountsService.getAccounts('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].account_name).toBe('Test Account');
      expect(result[0].platform_name).toBe('Test Platform');
    });

    it('should throw AppError on database error', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB failure' } }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(TradingAccountsService.getAccounts('user-123')).rejects.toThrow(AppError);
    });
  });

  describe('createAccount', () => {
    const validPayload = {
      user_id: 'user-123',
      platform_id: 'plat-1',
      account_name: 'My Account',
      account_number: 'ACC001',
      currency: 'CAD',
    };

    it('should throw AppError if user_id is missing', async () => {
      await expect(
        TradingAccountsService.createAccount({ ...validPayload, user_id: '' })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError if platform_id is missing', async () => {
      await expect(
        TradingAccountsService.createAccount({ ...validPayload, platform_id: '' })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError if account_name is blank', async () => {
      await expect(
        TradingAccountsService.createAccount({ ...validPayload, account_name: '   ' })
      ).rejects.toThrow(AppError);
    });

    it('should create an account successfully', async () => {
      const mockData = {
        id: 'acc-1',
        user_id: 'user-123',
        platform_id: 'plat-1',
        account_name: 'My Account',
        account_number: 'ACC001',
        currency: 'CAD',
        created_at: new Date().toISOString(),
        trading_platforms: { name: 'Test Platform' },
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await TradingAccountsService.createAccount(validPayload);

      expect(result.account_name).toBe('My Account');
      expect(result.platform_name).toBe('Test Platform');
    });

    it('should throw conflict AppError on duplicate account (code 23505)', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'duplicate key' },
        }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(TradingAccountsService.createAccount(validPayload)).rejects.toThrow(AppError);
    });
  });

  describe('deleteAccount', () => {
    it('should throw AppError if id is missing', async () => {
      await expect(TradingAccountsService.deleteAccount('', 'user-123')).rejects.toThrow(AppError);
    });

    it('should throw AppError if userId is missing', async () => {
      await expect(TradingAccountsService.deleteAccount('acc-1', '')).rejects.toThrow(AppError);
    });

    it('should delete account successfully', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      // Last .eq() call returns the resolved value
      mockQuery.eq
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce({ error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        TradingAccountsService.deleteAccount('acc-1', 'user-123')
      ).resolves.toBeUndefined();
    });

    it('should throw conflict AppError when account has linked transactions (code 23503)', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      mockQuery.eq
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce({ error: { code: '23503', message: 'FK violation' } });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

      const err = await TradingAccountsService.deleteAccount('acc-1', 'user-123').catch(
        (e) => e
      );
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(HttpStatusCode.CONFLICT);
    });
  });
});
