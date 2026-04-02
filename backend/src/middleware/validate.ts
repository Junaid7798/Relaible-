import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const r = schema.safeParse(req.body);
    if (!r.success) throw new ValidationError('Body validation failed', r.error.errors);
    req.body = r.data; next();
  };
}
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const r = schema.safeParse(req.query);
    if (!r.success) throw new ValidationError('Query validation failed', r.error.errors);
    req.query = r.data; next();
  };
}