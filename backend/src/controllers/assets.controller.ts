import { Request, Response } from 'express';
import { AssetsService } from '../services/assets.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.util.js';
import { CreateAssetPayload, UpdateAssetPayload } from '../models/Asset.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode, ErrorMessage, SuccessMessage } from '../config/index.js';

export const getAssets = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }
  
  const assets = await AssetsService.getAssets(userId);
  
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.ASSETS_RETRIEVED,
    data: assets
  });
});

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }
  
  const assetData: CreateAssetPayload = {
    ...req.body,
    user_id: userId
  };

  const newAsset = await AssetsService.createAsset(assetData);

  sendResponse(res, {
    statusCode: HttpStatusCode.CREATED,
    message: SuccessMessage.ASSET_CREATED,
    data: newAsset
  });
});

export const getAssetById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;

  if (!id || Array.isArray(id)) {
    throw new AppError(ErrorMessage.INVALID_ASSET_ID, HttpStatusCode.BAD_REQUEST);
  }

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  const asset = await AssetsService.getAssetById(id, userId);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.ASSET_RETRIEVED,
    data: asset
  });
});

export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;

  if (!id || Array.isArray(id)) {
    throw new AppError(ErrorMessage.INVALID_ASSET_ID, HttpStatusCode.BAD_REQUEST);
  }

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  const updateData: UpdateAssetPayload = {
    ...req.body,
    user_id: userId
  };

  const updatedAsset = await AssetsService.updateAsset(id, updateData);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.ASSET_UPDATED,
    data: updatedAsset
  });
});

export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;

  if (!id || Array.isArray(id)) {
    throw new AppError(ErrorMessage.INVALID_ASSET_ID, HttpStatusCode.BAD_REQUEST);
  }

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  await AssetsService.deleteAsset(id, userId);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.ASSET_DELETED
  });
});
