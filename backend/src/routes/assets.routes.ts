import { Router } from 'express';
import {
  getAssets,
  createAsset,
  getAssetById,
  updateAsset,
  deleteAsset
} from '../controllers/assets.controller.js';

const router = Router();

// GET /assets - Get all assets for authenticated user
router.get('/', getAssets);

// POST /assets - Create a new asset
router.post('/', createAsset);

// GET /assets/:id - Get specific asset by ID
router.get('/:id', getAssetById);

// PUT /assets/:id - Update specific asset
router.put('/:id', updateAsset);

// DELETE /assets/:id - Delete specific asset
router.delete('/:id', deleteAsset);

export default router;
