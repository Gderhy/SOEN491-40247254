import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';

function makeTestApp() {
  const app = express();

  app.get('/operational-error', (_req: Request, _res: Response, next: NextFunction) => {
    next(new AppError('Not found', 404));
  });

  app.get('/server-error', (_req: Request, _res: Response, next: NextFunction) => {
    next(new AppError('Something broke', 500));
  });

  app.get('/generic-error', (_req: Request, _res: Response, next: NextFunction) => {
    next(new Error('Unhandled error'));
  });

  app.use(errorHandler);
  return app;
}

describe('errorHandler middleware', () => {
  const app = makeTestApp();

  it('should handle AppError with 4xx status and return error response', async () => {
    const res = await request(app).get('/operational-error');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Not found');
  });

  it('should handle AppError with 5xx status', async () => {
    const res = await request(app).get('/server-error');

    expect(res.status).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Something broke');
  });

  it('should handle generic Error with 500 status', async () => {
    const res = await request(app).get('/generic-error');

    expect(res.status).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Internal Server Error');
  });
});
