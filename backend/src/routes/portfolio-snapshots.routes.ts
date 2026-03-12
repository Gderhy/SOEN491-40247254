import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getSnapshots, upsertSnapshot } from '../controllers/portfolio-snapshots.controller.js';

const router = Router();

router.use(requireAuth);

// GET  /api/portfolio-snapshots  – list all snapshots for the user
router.get('/', getSnapshots);

// POST /api/portfolio-snapshots  – upsert today's snapshot
router.post('/', upsertSnapshot);

export default router;
