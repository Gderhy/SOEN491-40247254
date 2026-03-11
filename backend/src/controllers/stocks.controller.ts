/**
 * Stocks Controller
 * Thin controller that delegates to StocksService.
 * Handles request validation and response formatting.
 */

import { Request, Response } from 'express';
import { StocksService } from '../services/stocks.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.util.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode, SuccessMessage } from '../config/index.js';

/**
 * GET /stocks/quote?symbol=AAPL
 * Returns a live quote for the requested symbol.
 */
export const getQuote = asyncHandler(async (req: Request, res: Response) => {
  const { symbol } = req.query;

  if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
    throw new AppError('Query parameter "symbol" is required', HttpStatusCode.BAD_REQUEST);
  }

  const quote = await StocksService.getQuote(symbol.trim().toUpperCase());

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.STOCK_QUOTE_RETRIEVED,
    data: quote,
  });
});

/**
 * GET /stocks/quotes?symbols=AAPL,MSFT,GOOGL
 * Returns live quotes for multiple symbols in a single request.
 * Individual symbol failures are embedded in the response payload instead of
 * causing the whole request to fail.
 */
export const getQuotes = asyncHandler(async (req: Request, res: Response) => {
  const { symbols } = req.query;

  if (!symbols || typeof symbols !== 'string' || symbols.trim() === '') {
    throw new AppError('Query parameter "symbols" is required', HttpStatusCode.BAD_REQUEST);
  }

  const symbolList = symbols
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (symbolList.length === 0) {
    throw new AppError('At least one symbol must be provided', HttpStatusCode.BAD_REQUEST);
  }

  const quotes = await StocksService.getQuotes(symbolList);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.STOCK_QUOTES_RETRIEVED,
    data: quotes,
  });
});
