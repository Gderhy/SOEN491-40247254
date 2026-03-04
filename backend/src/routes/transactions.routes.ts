import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  getTransactions,
  createTransaction,
  getPortfolioPositions,
  getPortfolioMetrics,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactions.controller.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// GET /transactions - Get all transactions for authenticated user
router.get('/', getTransactions);

// POST /transactions - Create a new transaction
router.post('/', createTransaction);

// GET /transactions/portfolio - Get portfolio positions (grouped by symbol)
router.get('/portfolio', getPortfolioPositions);

// GET /transactions/metrics - Get portfolio performance metrics
router.get('/metrics', getPortfolioMetrics);

// GET /transactions/:id - Get specific transaction by ID
router.get('/:id', getTransactionById);

// PUT /transactions/:id - Update specific transaction
router.put('/:id', updateTransaction);

// DELETE /transactions/:id - Delete specific transaction
router.delete('/:id', deleteTransaction);

export default router;
