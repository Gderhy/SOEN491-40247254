/**
 * Services Barrel File
 * Centralized exports for all service modules
 */

// Unified API Service - handles all backend communication
export { apiService } from './apiService';

// Token Service  
export * from './tokenService';

// Transactions Service
export { default as TransactionsService } from './transactionsService';

// Accounts Service (platforms + trading accounts)
export { default as AccountsService } from './accountsService';

// Stocks Service (live price proxy via backend)
export { StocksService } from './stocksService';
