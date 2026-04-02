import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) throw new AuthorizationError('Auth required');
    if (!roles.includes(req.auth.role)) throw new AuthorizationError('Need: ' + roles.join(' or '));
    next();
  };
}
export function requireOwner(req: Request, _res: Response, next: NextFunction): void {
  if (req.auth?.role !== 'OWNER') throw new AuthorizationError('Owner only');
  next();
}
export function requireUnitAccess(req: Request, _res: Response, next: NextFunction): void {
  if (req.auth.role === 'OWNER') return next();
  const uid = req.params.unitId || req.query.unit_id || req.body.unit_id;
  if (uid && uid !== req.auth.unitId) throw new AuthorizationError('Unit access denied');
  next();
}