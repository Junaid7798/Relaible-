import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';
import { logger } from '../config/logger';
import { ZodError } from 'zod';
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn('Operational', { code: err.code, msg: err.message, status: err.statusCode, reqId: req.requestId });
    errorResponse(res, err.statusCode, err.code, err.message, err.details); return;
  }
  if (err instanceof ZodError) {
    const d = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    errorResponse(res, 400, 'VALIDATION', 'Validation failed', d); return;
  }
  if ((err as any).code === '23505') { errorResponse(res, 409, 'DUPLICATE', 'Duplicate entry'); return; }
  if ((err as any).code === '23503') { errorResponse(res, 400, 'REF', 'Reference not found'); return; }
  logger.error('Unhandled', { error: err.message, stack: err.stack, reqId: req.requestId });
  errorResponse(res, 500, 'INTERNAL', 'Unexpected error');
}