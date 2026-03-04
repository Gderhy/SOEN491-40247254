import { Request, Response } from 'express';
import { TradingPlatformsService } from '../services/trading-platforms.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.util.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode, ErrorMessage, SuccessMessage } from '../config/index.js';

export const getPlatforms = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);

  const platforms = await TradingPlatformsService.getPlatforms(userId);
  sendResponse(res, { statusCode: HttpStatusCode.OK, message: SuccessMessage.PLATFORMS_RETRIEVED, data: platforms });
});

export const createPlatform = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);

  const platform = await TradingPlatformsService.createPlatform({ user_id: userId, name: req.body.name });
  sendResponse(res, { statusCode: HttpStatusCode.CREATED, message: SuccessMessage.PLATFORM_CREATED, data: platform });
});

export const deletePlatform = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);

  await TradingPlatformsService.deletePlatform(String(req.params.id), userId);
  sendResponse(res, { statusCode: HttpStatusCode.OK, message: SuccessMessage.PLATFORM_DELETED });
});
