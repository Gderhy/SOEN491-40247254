/**
 * Stocks Service (Frontend)
 * Proxies live stock quote requests through the backend so the Finnhub API
 * key is never exposed to the browser.
 */

import { apiService } from './apiService';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  /** Unix timestamp (seconds) from Finnhub */
  timestamp: number;
}

export type QuoteResult = StockQuote | { error: string };

export class StocksService {
  /**
   * Fetch live quotes for multiple symbols in a single batch request.
   * Returns a map of symbol → quote or error descriptor.
   */
  static async getQuotes(symbols: string[]): Promise<Record<string, QuoteResult>> {
    if (symbols.length === 0) return {};

    const response = await apiService.http.get<{
      status: string;
      data: Record<string, QuoteResult>;
    }>('/api/stocks/quotes', {
      params: { symbols: symbols.join(',') },
    });

    return response.data.data;
  }

  /**
   * Fetch a live quote for a single symbol.
   */
  static async getQuote(symbol: string): Promise<StockQuote> {
    const response = await apiService.http.get<{
      status: string;
      data: StockQuote;
    }>('/api/stocks/quote', {
      params: { symbol },
    });

    return response.data.data;
  }
}
