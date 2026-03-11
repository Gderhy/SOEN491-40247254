/**
 * Stocks Service (Frontend)
 * Calls the Finnhub public REST API directly from the browser.
 * Requires VITE_FINNHUB_API_KEY to be set in the frontend environment.
 */

import { config } from '../config/env';

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

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

/** Shape of Finnhub /quote response */
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
  /**
   * Fetch a live quote for a single symbol directly from Finnhub.
   * Throws an error for unknown symbols or API failures.
   */
  static async getQuote(symbol: string): Promise<StockQuote> {
    const apiKey = config.finnhub.apiKey;
    if (!apiKey) {
      throw new Error('Finnhub API key is not configured (VITE_FINNHUB_API_KEY)');
    }

    const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
    const response = await fetch(url);

    if (response.status === 429) {
      throw new Error('Finnhub rate limit exceeded — please try again later');
    }
    if (!response.ok) {
      throw new Error(`Finnhub returned HTTP ${response.status} for symbol ${symbol}`);
    }

    const data: FinnhubQuote = await response.json();

    // Finnhub returns all zeros (and t=0) for unknown / unsupported symbols
    if (data.c === 0 && data.t === 0) {
      throw new Error(`Symbol not found: ${symbol}`);
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
   * Each entry is either a StockQuote or an error descriptor so individual
   * failures don't block the rest of the batch.
   */
  static async getQuotes(
    symbols: string[]
  ): Promise<Record<string, QuoteResult>> {
    const results: Record<string, QuoteResult> = {};

    await Promise.allSettled(
      symbols.map(async (sym) => {
        try {
          results[sym] = await StocksService.getQuote(sym);
        } catch (err: unknown) {
          results[sym] = {
            error: err instanceof Error ? err.message : 'Failed to fetch quote',
          };
        }
      })
    );

    return results;
  }
}
