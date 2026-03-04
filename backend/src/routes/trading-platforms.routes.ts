import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getPlatforms, createPlatform, deletePlatform } from '../controllers/trading-platforms.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', getPlatforms);
router.post('/', createPlatform);
router.delete('/:id', deletePlatform);

export default router;
