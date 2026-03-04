import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { HttpStatusCode, ResponseStatus, ErrorMessage } from '../config/index.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  let message: string = ErrorMessage.INTERNAL_SERVER_ERROR;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.originalUrl} — ${statusCode} ${message}`, err.stack);
  } else {
    console.warn(`[Error] ${req.method} ${req.originalUrl} — ${statusCode} ${message}`);
  }

  res.status(statusCode).json({
    status: ResponseStatus.ERROR,
    message
  });
};
