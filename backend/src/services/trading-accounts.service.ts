import { TradingAccount, CreateTradingAccountPayload } from '../models/TradingAccount.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode } from '../config/httpStatus.js';
import { ErrorMessage } from '../config/messages.js';
import { supabase } from '../config/supabase.js';

export class TradingAccountsService {
  static async getAccounts(userId: string): Promise<TradingAccount[]> {
    if (!userId) throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);

    const { data, error } = await supabase
      .from('trading_accounts')
      .select('*, trading_platforms(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);

    return (data || []).map((row: any) => ({
      ...row,
      platform_name: row.trading_platforms?.name ?? null,
      trading_platforms: undefined,
    }));
  }

  static async createAccount(payload: CreateTradingAccountPayload): Promise<TradingAccount> {
    if (!payload.user_id) throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    if (!payload.platform_id) throw new AppError(ErrorMessage.PLATFORM_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    if (!payload.account_name?.trim()) throw new AppError(ErrorMessage.ACCOUNT_NAME_REQUIRED, HttpStatusCode.BAD_REQUEST);

    const { data, error } = await supabase
      .from('trading_accounts')
      .insert({
        user_id: payload.user_id,
        platform_id: payload.platform_id,
        account_name: payload.account_name.trim(),
        account_number: payload.account_number?.trim() || null,
        currency: payload.currency || 'CAD',
      })
      .select('*, trading_platforms(name)')
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError(ErrorMessage.ACCOUNT_ALREADY_EXISTS, HttpStatusCode.CONFLICT);
      throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }

    return {
      ...data,
      platform_name: (data as any).trading_platforms?.name ?? null,
      trading_platforms: undefined,
    };
  }

  static async deleteAccount(id: string, userId: string): Promise<void> {
    if (!id) throw new AppError(ErrorMessage.ACCOUNT_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
    if (!userId) throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);

    const { error } = await supabase
      .from('trading_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      // FK violation from transactions → cannot delete
      if (error.code === '23503') throw new AppError(ErrorMessage.ACCOUNT_HAS_TRANSACTIONS, HttpStatusCode.CONFLICT);
      throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
