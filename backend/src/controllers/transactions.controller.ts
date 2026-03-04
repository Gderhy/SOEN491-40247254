import { Request, Response } from 'express';
import { TransactionsService } from '../services/transactions.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.util.js';
import { CreateTransactionPayload, UpdateTransactionPayload } from '../models/Transaction.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode, ErrorMessage, SuccessMessage } from '../config/index.js';

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  console.log(`[Transactions] GET /transactions - Requested by user: ${userId}`);

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }
  
  const transactions = await TransactionsService.getTransactions(userId);
  console.log(`[Transactions] GET /transactions - Returned ${transactions.length} transactions for user: ${userId}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.TRANSACTIONS_RETRIEVED,
    data: transactions
  });
});

export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  console.log(`[Transactions] POST /transactions - Create requested by user: ${userId}`);

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }
  
  const transactionData: CreateTransactionPayload = {
    ...req.body,
    user_id: userId,
    transaction_date: req.body.transaction_date ? new Date(req.body.transaction_date) : new Date()
  };

  const newTransaction = await TransactionsService.createTransaction(transactionData);
  console.log(`[Transactions] POST /transactions - Transaction created with id: ${newTransaction.id} for user: ${userId}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.CREATED,
    message: SuccessMessage.TRANSACTION_CREATED,
    data: newTransaction
  });
});

export const getPortfolioPositions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  console.log(`[Transactions] GET /transactions/positions - Requested by user: ${userId}`);

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  const positions = await TransactionsService.getPortfolioPositions(userId);
  console.log(`[Transactions] GET /transactions/positions - Returned ${positions.length} positions for user: ${userId}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.PORTFOLIO_POSITIONS_RETRIEVED,
    data: positions
  });
});

export const getPortfolioMetrics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  console.log(`[Transactions] GET /transactions/metrics - Requested by user: ${userId}`);

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  const metrics = await TransactionsService.getPortfolioMetrics(userId);
  console.log(`[Transactions] GET /transactions/metrics - Metrics calculated for user: ${userId}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.PORTFOLIO_METRICS_RETRIEVED,
    data: metrics
  });
});

export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;
  console.log(`[Transactions] GET /transactions/${id} - Requested by user: ${userId}`);

  if (!id || Array.isArray(id)) {
    throw new AppError(ErrorMessage.INVALID_ASSET_ID, HttpStatusCode.BAD_REQUEST);
  }

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  const transaction = await TransactionsService.getTransactionById(id, userId);
  console.log(`[Transactions] GET /transactions/${id} - Transaction found for user: ${userId}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.TRANSACTION_RETRIEVED,
    data: transaction
  });
});

export const updateTransaction = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;
  console.log(`[Transactions] PUT /transactions/${id} - Update requested by user: ${userId}`);

  if (!id || Array.isArray(id)) {
    throw new AppError(ErrorMessage.INVALID_ASSET_ID, HttpStatusCode.BAD_REQUEST);
  }

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  const updateData: UpdateTransactionPayload = {
    ...req.body,
    user_id: userId,
    transaction_date: req.body.transaction_date ? new Date(req.body.transaction_date) : undefined
  };

  const updatedTransaction = await TransactionsService.updateTransaction(id, updateData);
  console.log(`[Transactions] PUT /transactions/${id} - Transaction updated for user: ${userId}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.TRANSACTION_UPDATED,
    data: updatedTransaction
  });
});

export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;
  console.log(`[Transactions] DELETE /transactions/${id} - Delete requested by user: ${userId}`);

  if (!id || Array.isArray(id)) {
    throw new AppError(ErrorMessage.INVALID_ASSET_ID, HttpStatusCode.BAD_REQUEST);
  }

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  await TransactionsService.deleteTransaction(id, userId);
  console.log(`[Transactions] DELETE /transactions/${id} - Transaction deleted for user: ${userId}`);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: SuccessMessage.TRANSACTION_DELETED
  });
});
