/**
 * Stocks Service
 * Calls the Finnhub API to retrieve live stock quotes.
 * All external HTTP traffic is handled here so the API key never reaches the client.
 */

import { AppError } from '../errors/AppError.js';
import { HttpStatusCode } from '../config/httpStatus.js';
import { config } from '../config/env.js';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  /** Unix timestamp (seconds) of the last price update from Finnhub */
  timestamp: number;
}

/** Shape returned by Finnhub /quote endpoint */
interface FinnhubQuote {
  c: number;   // current price
  d: number;   // change
  dp: number;  // change percent
  h: number;   // high
  l: number;   // low
  o: number;   // open
  pc: number;  // previous close
  t: number;   // timestamp (unix seconds)
}

export class StocksService {
  private static readonly FINNHUB_BASE = 'https://finnhub.io/api/v1';

  /**
   * Fetch a live quote for a single stock symbol from Finnhub.
   * Throws AppError for invalid symbols, rate limits, or provider failures.
   */
  static async getQuote(symbol: string): Promise<StockQuote> {
    const apiKey = config.finnhub.apiKey;
    if (!apiKey) {
      throw new AppError(
        'Stock API key is not configured on the server',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }

    const url = `${StocksService.FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new AppError('Failed to reach stock data provider', HttpStatusCode.BAD_GATEWAY);
    }

    if (response.status === 429) {
      throw new AppError(
        'Stock API rate limit exceeded — please try again later',
        HttpStatusCode.TOO_MANY_REQUESTS
      );
    }

    if (!response.ok) {
      throw new AppError(
        `Stock data provider returned an error (HTTP ${response.status})`,
        HttpStatusCode.BAD_GATEWAY
      );
    }

    let data: FinnhubQuote;
    try {
      data = (await response.json()) as FinnhubQuote;
    } catch {
      throw new AppError('Invalid response from stock data provider', HttpStatusCode.BAD_GATEWAY);
    }

    // Finnhub returns all zeros (and t=0) for unknown symbols
    if (data.c === 0 && data.t === 0) {
      throw new AppError(`Symbol not found: ${symbol}`, HttpStatusCode.NOT_FOUND);
    }

    return {
      symbol: symbol.toUpperCase(),
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: data.t,
    };
  }

  /**
   * Fetch live quotes for multiple symbols in parallel.
   * Each entry is either a resolved StockQuote or an error descriptor.
   */
  static async getQuotes(
    symbols: string[]
  ): Promise<Record<string, StockQuote | { error: string }>> {
    const results: Record<string, StockQuote | { error: string }> = {};

    await Promise.allSettled(
      symbols.map(async (sym) => {
        try {
          results[sym] = await StocksService.getQuote(sym);
        } catch (err: unknown) {
          results[sym] = {
            error: err instanceof AppError ? err.message : 'Failed to fetch quote',
          };
        }
      })
    );

    return results;
  }
}
