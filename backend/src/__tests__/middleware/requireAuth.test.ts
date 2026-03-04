import { Request, Response, NextFunction } from 'express';
import { requireAuth, optionalAuth } from '../../middleware/requireAuth';

jest.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

import { supabase } from '../../config/supabase';

const mockGetUser = supabase.auth.getUser as jest.Mock;

function makeReq(authHeader?: string): Partial<Request> {
  return {
    method: 'GET',
    originalUrl: '/protected',
    headers: authHeader ? { authorization: authHeader } : {},
  } as any;
}

function makeRes(): { res: Partial<Response>; statusFn: jest.Mock; jsonFn: jest.Mock } {
  const jsonFn = jest.fn();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
  return { res: { status: statusFn } as any, statusFn, jsonFn };
}

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

beforeEach(() => jest.clearAllMocks());

describe('requireAuth middleware', () => {
  it('should return 401 when Authorization header is missing', async () => {
    const req = makeReq();
    const { res, statusFn } = makeRes();

    await requireAuth(req as Request, res as Response, mockNext);

    expect(statusFn).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header format is invalid', async () => {
    const req = makeReq('InvalidFormat token123');
    const { res, statusFn } = makeRes();

    await requireAuth(req as Request, res as Response, mockNext);

    expect(statusFn).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid or expired', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid token' } });
    const req = makeReq('Bearer bad-token');
    const { res, statusFn } = makeRes();

    await requireAuth(req as Request, res as Response, mockNext);

    expect(statusFn).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() and attach user when token is valid', async () => {
    const mockUser = { id: 'user-1', email: 'test@test.com' };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const req = makeReq('Bearer valid-token') as any;
    const { res } = makeRes();

    await requireAuth(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.user).toEqual(mockUser);
  });

  it('should return 500 when an unexpected error occurs', async () => {
    mockGetUser.mockRejectedValue(new Error('unexpected'));
    const req = makeReq('Bearer some-token');
    const { res, statusFn } = makeRes();

    await requireAuth(req as Request, res as Response, mockNext);

    expect(statusFn).toHaveBeenCalledWith(500);
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe('optionalAuth middleware', () => {
  it('should call next() without attaching user when no Authorization header', async () => {
    const req = makeReq() as any;
    const { res } = makeRes();

    await optionalAuth(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.user).toBeUndefined();
  });

  it('should attach user and call next() when token is valid', async () => {
    const mockUser = { id: 'user-1' };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const req = makeReq('Bearer valid-token') as any;
    const { res } = makeRes();

    await optionalAuth(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.user).toEqual(mockUser);
  });

  it('should call next() without attaching user when token is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } });
    const req = makeReq('Bearer bad-token') as any;
    const { res } = makeRes();

    await optionalAuth(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.user).toBeUndefined();
  });
});
