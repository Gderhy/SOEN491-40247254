/**
 * Stocks Routes
 * Provides live stock quote endpoints backed by the Finnhub API.
 * All routes require authentication so the API key is never exposed client-side.
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getQuote, getQuotes } from '../controllers/stocks.controller.js';

const router = Router();

// All stock routes require a valid JWT
router.use(requireAuth);

// GET /stocks/quote?symbol=AAPL
router.get('/quote', getQuote);

// GET /stocks/quotes?symbols=AAPL,MSFT,GOOGL
router.get('/quotes', getQuotes);

export default router;
