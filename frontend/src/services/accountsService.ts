/**
 * Trading Platforms & Accounts API Service
 */

import { apiService } from './apiService';
import type {
  TradingPlatform,
  TradingAccount,
  CreateTradingPlatformRequest,
  CreateTradingAccountRequest,
} from '../types/accounts';

function mapPlatform(raw: any): TradingPlatform {
  return {
    id: raw.id,
    userId: raw.user_id,
    name: raw.name,
    createdAt: new Date(raw.created_at),
  };
}

function mapAccount(raw: any): TradingAccount {
  return {
    id: raw.id,
    userId: raw.user_id,
    platformId: raw.platform_id,
    platformName: raw.platform_name ?? '',
    accountName: raw.account_name,
    accountNumber: raw.account_number ?? null,
    currency: raw.currency,
    createdAt: new Date(raw.created_at),
  };
}

export class AccountsService {
  /* ── Platforms ─────────────────────────────────────────────── */

  static async getPlatforms(): Promise<TradingPlatform[]> {
    const res = await apiService.http.get('/api/trading-platforms');
    return (res.data?.data ?? []).map(mapPlatform);
  }

  static async createPlatform(req: CreateTradingPlatformRequest): Promise<TradingPlatform> {
    const res = await apiService.http.post('/api/trading-platforms', { name: req.name });
    return mapPlatform(res.data?.data);
  }

  static async deletePlatform(id: string): Promise<void> {
    await apiService.http.delete(`/api/trading-platforms/${id}`);
  }

  /* ── Accounts ──────────────────────────────────────────────── */

  static async getAccounts(): Promise<TradingAccount[]> {
    const res = await apiService.http.get('/api/trading-accounts');
    return (res.data?.data ?? []).map(mapAccount);
  }

  static async createAccount(req: CreateTradingAccountRequest): Promise<TradingAccount> {
    const res = await apiService.http.post('/api/trading-accounts', {
      platformId: req.platformId,
      accountName: req.accountName,
      accountNumber: req.accountNumber,
      currency: req.currency,
    });
    return mapAccount(res.data?.data);
  }

  static async deleteAccount(id: string): Promise<void> {
    await apiService.http.delete(`/api/trading-accounts/${id}`);
  }
}

export default AccountsService;
