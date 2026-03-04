import { Request, Response } from 'express';
import { TransactionsService } from '../services/transactions.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.util.js';
import { CreateTransactionPayload, UpdateTransactionPayload } from '../models/Transaction.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode } from '../config/httpStatus.js';
import { ErrorMessage } from '../config/messages.js';

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }
  
  const transactions = await TransactionsService.getTransactions(userId);
  
  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Transactions retrieved successfully',
    data: transactions
  });
});

export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }
  
  const transactionData: CreateTransactionPayload = {
    ...req.body,
    user_id: userId,
    transaction_date: req.body.transaction_date ? new Date(req.body.transaction_date) : new Date()
  };

  const newTransaction = await TransactionsService.createTransaction(transactionData);

  sendResponse(res, {
    statusCode: HttpStatusCode.CREATED,
    message: 'Transaction created successfully',
    data: newTransaction
  });
});

export const getPortfolioPositions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  const positions = await TransactionsService.getPortfolioPositions(userId);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Portfolio positions retrieved successfully',
    data: positions
  });
});

export const getPortfolioMetrics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  const metrics = await TransactionsService.getPortfolioMetrics(userId);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Portfolio metrics retrieved successfully',
    data: metrics
  });
});

export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;

  if (!id || Array.isArray(id)) {
    throw new AppError('Invalid transaction ID', HttpStatusCode.BAD_REQUEST);
  }

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  const transaction = await TransactionsService.getTransactionById(id, userId);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Transaction retrieved successfully',
    data: transaction
  });
});

export const updateTransaction = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;

  if (!id || Array.isArray(id)) {
    throw new AppError('Invalid transaction ID', HttpStatusCode.BAD_REQUEST);
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

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Transaction updated successfully',
    data: updatedTransaction
  });
});

export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;

  if (!id || Array.isArray(id)) {
    throw new AppError('Invalid transaction ID', HttpStatusCode.BAD_REQUEST);
  }

  if (!userId) {
    throw new AppError(ErrorMessage.USER_NOT_AUTHENTICATED, HttpStatusCode.UNAUTHORIZED);
  }

  await TransactionsService.deleteTransaction(id, userId);

  sendResponse(res, {
    statusCode: HttpStatusCode.OK,
    message: 'Transaction deleted successfully'
  });
});
