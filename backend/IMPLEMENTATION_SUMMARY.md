# Express TypeScript Layered Architecture Implementation

## src/utils/response.util.ts
```typescript
import { Response } from 'express';

interface ResponseData {
  statusCode: number;
  message: string;
  data?: any;
}

export const sendResponse = (res: Response, { statusCode, message, data }: ResponseData): void => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data: data || null
  });
};
```

## src/utils/asyncHandler.ts
```typescript
import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## src/errors/AppError.ts
```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
```

## src/middleware/errorHandler.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    status: 'error',
    message
  });
};
```

## src/services/assets.service.ts
```typescript
import { Asset, CreateAssetPayload, UpdateAssetPayload } from '../models/Asset.js';
import { AppError } from '../errors/AppError.js';

export class AssetsService {
  static async getAssets(userId: string): Promise<Asset[]> {
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    try {
      // Replace with actual database query
      const assets: Asset[] = [
        {
          id: '1',
          user_id: userId,
          type: 'stock',
          name: 'Apple Inc.',
          symbol: 'AAPL',
          quantity: 10,
          value: 1500.00,
          currency: 'CAD',
          source: 'manual',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          user_id: userId,
          type: 'crypto',
          name: 'Bitcoin',
          symbol: 'BTC',
          quantity: 0.5,
          value: 25000.00,
          currency: 'CAD',
          source: 'manual',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      return assets;
    } catch (error) {
      throw new AppError('Failed to fetch assets', 500);
    }
  }

  static async createAsset(assetData: CreateAssetPayload): Promise<Asset> {
    if (!assetData.user_id || !assetData.name || !assetData.type || assetData.value === undefined) {
      throw new AppError('User ID, name, type, and value are required', 400);
    }

    if (assetData.value <= 0) {
      throw new AppError('Asset value must be greater than 0', 400);
    }

    try {
      // Replace with actual database insert
      const newAsset: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: assetData.user_id,
        type: assetData.type,
        name: assetData.name,
        symbol: assetData.symbol,
        quantity: assetData.quantity,
        value: assetData.value,
        currency: assetData.currency || 'CAD',
        provider: assetData.provider,
        source: assetData.source || 'manual',
        created_at: new Date(),
        updated_at: new Date()
      };

      return newAsset;
    } catch (error) {
      throw new AppError('Failed to create asset', 500);
    }
  }

  static async getAssetById(id: string, userId: string): Promise<Asset> {
    if (!id) {
      throw new AppError('Asset ID is required', 400);
    }

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    try {
      // Replace with actual database query
      // For now, simulate finding the asset
      // const asset: Asset | null = await database.findByIdAndUserId(id, userId);
      
      // Simulate not found for demo
      const asset: Asset | null = null;
      
      if (!asset) {
        throw new AppError('Asset not found', 404);
      }

      return asset;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch asset', 500);
    }
  }

  static async updateAsset(id: string, updateData: UpdateAssetPayload): Promise<Asset> {
    if (!id) {
      throw new AppError('Asset ID is required', 400);
    }

    if (!updateData.user_id) {
      throw new AppError('User ID is required', 400);
    }

    if (updateData.value !== undefined && updateData.value <= 0) {
      throw new AppError('Asset value must be greater than 0', 400);
    }

    try {
      // Replace with actual database update
      const existingAsset = await this.getAssetById(id, updateData.user_id);
      
      const updatedAsset: Asset = {
        ...existingAsset,
        ...updateData,
        updated_at: new Date()
      };

      return updatedAsset;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update asset', 500);
    }
  }

  static async deleteAsset(id: string, userId: string): Promise<void> {
    if (!id) {
      throw new AppError('Asset ID is required', 400);
    }

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    try {
      // Replace with actual database delete
      const existingAsset = await this.getAssetById(id, userId);
      
      // Simulate deletion
      // await database.delete(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete asset', 500);
    }
  }
}
```

## src/controllers/assets.controller.ts
```typescript
import { Request, Response } from 'express';
import { AssetsService } from '../services/assets.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.util.js';
import { CreateAssetPayload, UpdateAssetPayload } from '../models/Asset.js';
import { AppError } from '../errors/AppError.js';

export const getAssets = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }
  
  const assets = await AssetsService.getAssets(userId);
  
  sendResponse(res, {
    statusCode: 200,
    message: 'Assets retrieved successfully',
    data: assets
  });
});

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }
  
  const assetData: CreateAssetPayload = {
    ...req.body,
    user_id: userId
  };

  const newAsset = await AssetsService.createAsset(assetData);

  sendResponse(res, {
    statusCode: 201,
    message: 'Asset created successfully',
    data: newAsset
  });
});

export const getAssetById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;

  if (!id || Array.isArray(id)) {
    throw new AppError('Invalid asset ID', 400);
  }

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const asset = await AssetsService.getAssetById(id, userId);

  sendResponse(res, {
    statusCode: 200,
    message: 'Asset retrieved successfully',
    data: asset
  });
});

export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;

  if (!id || Array.isArray(id)) {
    throw new AppError('Invalid asset ID', 400);
  }

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const updateData: UpdateAssetPayload = {
    ...req.body,
    user_id: userId
  };

  const updatedAsset = await AssetsService.updateAsset(id, updateData);

  sendResponse(res, {
    statusCode: 200,
    message: 'Asset updated successfully',
    data: updatedAsset
  });
});

export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;

  if (!id || Array.isArray(id)) {
    throw new AppError('Invalid asset ID', 400);
  }

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  await AssetsService.deleteAsset(id, userId);

  sendResponse(res, {
    statusCode: 200,
    message: 'Asset deleted successfully'
  });
});
```

## src/routes/assets.routes.ts
```typescript
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
```

## src/app.ts
```typescript
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
// Type augmentation is automatically loaded by TypeScript

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: false
}));

app.use(express.json());

// Setup all routes
setupRoutes(app);

// Global error handler (MUST be last middleware)
app.use(errorHandler);

export default app;

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`📍 Health check available at: http://localhost:${config.port}/health`);
  console.log(`📍 Detailed health check: http://localhost:${config.port}/health/detailed`);
  console.log(`📍 API info available at: http://localhost:${config.port}/`);
});
```
