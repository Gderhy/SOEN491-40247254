import { Asset, CreateAssetPayload, UpdateAssetPayload } from '../models/Asset.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode, ErrorMessage } from '../config/index.js';

export class AssetsService {
  static async getAssets(userId: string): Promise<Asset[]> {
    if (!userId) {
      throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
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
      throw new AppError(ErrorMessage.ASSET_FETCH_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  static async createAsset(assetData: CreateAssetPayload): Promise<Asset> {
    if (!assetData.user_id || !assetData.name || !assetData.type || assetData.value === undefined) {
      throw new AppError(ErrorMessage.ASSET_REQUIRED_FIELDS, HttpStatusCode.BAD_REQUEST);
    }

    if (assetData.value <= 0) {
      throw new AppError(ErrorMessage.INVALID_ASSET_VALUE, HttpStatusCode.BAD_REQUEST);
    }

    try {
      // Replace with actual database insert
      const newAsset: Asset = {
        id: Math.random().toString(36).slice(2, 9),
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
      throw new AppError(ErrorMessage.ASSET_CREATION_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  static async getAssetById(id: string, userId: string): Promise<Asset> {
    if (!id) {
      throw new AppError(ErrorMessage.ASSET_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    if (!userId) {
      throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    try {
      // Replace with actual database query
      // For now, simulate finding the asset
      // const asset: Asset | null = await database.findByIdAndUserId(id, userId);
      
      // Simulate not found for demo
      const asset: Asset | null = null;
      
      if (!asset) {
        throw new AppError(ErrorMessage.ASSET_NOT_FOUND, HttpStatusCode.NOT_FOUND);
      }

      return asset;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(ErrorMessage.ASSET_FETCH_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  static async updateAsset(id: string, updateData: UpdateAssetPayload): Promise<Asset> {
    if (!id) {
      throw new AppError(ErrorMessage.ASSET_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    if (!updateData.user_id) {
      throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    if (updateData.value !== undefined && updateData.value <= 0) {
      throw new AppError(ErrorMessage.INVALID_ASSET_VALUE, HttpStatusCode.BAD_REQUEST);
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
      throw new AppError(ErrorMessage.ASSET_UPDATE_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  static async deleteAsset(id: string, userId: string): Promise<void> {
    if (!id) {
      throw new AppError(ErrorMessage.ASSET_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
    }

    if (!userId) {
      throw new AppError(ErrorMessage.USER_ID_REQUIRED, HttpStatusCode.BAD_REQUEST);
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
      throw new AppError(ErrorMessage.ASSET_DELETE_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
