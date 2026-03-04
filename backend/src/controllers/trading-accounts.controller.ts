import { Request, Response } from 'express';
import { TradingAccountsService } from '../services/trading-accounts.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.util.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode, ErrorMessage, SuccessMessage } from '../config/index.js';

export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);

  const accounts = await TradingAccountsService.getAccounts(userId);
  sendResponse(res, { statusCode: HttpStatusCode.OK, message: SuccessMessage.ACCOUNTS_RETRIEVED, data: accounts });
});

export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);

  const account = await TradingAccountsService.createAccount({
    user_id: userId,
    platform_id: req.body.platformId,
    account_name: req.body.accountName,
    account_number: req.body.accountNumber,
    currency: req.body.currency,
  });
  sendResponse(res, { statusCode: HttpStatusCode.CREATED, message: SuccessMessage.ACCOUNT_CREATED, data: account });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);

  await TradingAccountsService.deleteAccount(String(req.params.id), userId);
  sendResponse(res, { statusCode: HttpStatusCode.OK, message: SuccessMessage.ACCOUNT_DELETED });
});
