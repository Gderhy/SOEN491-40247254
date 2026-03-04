import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getAccounts, createAccount, deleteAccount } from '../controllers/trading-accounts.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', getAccounts);
router.post('/', createAccount);
router.delete('/:id', deleteAccount);

export default router;
