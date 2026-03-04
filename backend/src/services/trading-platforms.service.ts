import { TradingPlatform, CreateTradingPlatformPayload } from '../models/TradingPlatform.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode } from '../config/httpStatus.js';
import { ErrorMessage } from '../config/messages.js';
import { supabase } from '../config/supabase.js';

export class TradingPlatformsService {
  static async getPlatforms(userId: string): Promise<TradingPlatform[]> {
    if (!userId) throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);

    const { data, error } = await supabase
      .from('trading_platforms')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
    return data || [];
  }

  static async createPlatform(payload: CreateTradingPlatformPayload): Promise<TradingPlatform> {
    if (!payload.user_id) throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    if (!payload.name?.trim()) throw new AppError(ErrorMessage.PLATFORM_NAME_REQUIRED, HttpStatusCode.BAD_REQUEST);

    const { data, error } = await supabase
      .from('trading_platforms')
      .insert({ user_id: payload.user_id, name: payload.name.trim() })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError(ErrorMessage.PLATFORM_ALREADY_EXISTS, HttpStatusCode.CONFLICT);
      throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
    return data;
  }

  static async deletePlatform(id: string, userId: string): Promise<void> {
    if (!id) throw new AppError(ErrorMessage.PLATFORM_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
    if (!userId) throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);

    const { error } = await supabase
      .from('trading_platforms')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError(`Database error: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
}
