import { Response } from 'express';
import { ResponseStatus } from '../config/index.js';

interface ResponseData {
  statusCode: number;
  message: string;
  data?: any;
}

export const sendResponse = (res: Response, { statusCode, message, data }: ResponseData): void => {
  res.status(statusCode).json({
    status: ResponseStatus.SUCCESS,
    message,
    data: data || null
  });
};
