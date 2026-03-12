/**
 * Portfolio Snapshots Controller
 */

import { Request, Response } from 'express';
import { PortfolioSnapshotsService } from '../services/portfolio-snapshots.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.util.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode } from '../config/httpStatus.js';

/**
 * GET /api/portfolio-snapshots
 * Returns all portfolio value snapshots for the authenticated user.
 */
export const getSnapshots = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', HttpStatusCode.UNAUTHORIZED);
  }

  const snapshots = await PortfolioSnapshotsService.getSnapshots(userId);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Portfolio snapshots retrieved',
    data: snapshots,
  });
});

/**
 * POST /api/portfolio-snapshots
 * Upsert a snapshot for today with the given portfolio_value.
 * Body: { portfolio_value: number }
 */
export const upsertSnapshot = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', HttpStatusCode.UNAUTHORIZED);
  }

  const { portfolio_value } = req.body;

  if (typeof portfolio_value !== 'number' || portfolio_value < 0) {
    throw new AppError('portfolio_value must be a non-negative number', HttpStatusCode.BAD_REQUEST);
  }

  const snapshot = await PortfolioSnapshotsService.upsertTodaySnapshot(userId, portfolio_value);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Portfolio snapshot saved',
    data: snapshot,
  });
});
