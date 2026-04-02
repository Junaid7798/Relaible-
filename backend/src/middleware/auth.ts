import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticationError } from '../utils/errors';
import { query } from '../config/database';
export interface AuthPayload { userId: string; role: string; unitId: string | null; }
declare global { namespace Express { interface Request { auth: AuthPayload; } } }
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) throw new AuthenticationError('Missing token');
  try {
    const decoded = jwt.verify(h.substring(7), env.JWT_SECRET) as AuthPayload;
    const { rows } = await query('SELECT id, is_active FROM users WHERE id = $1', [decoded.userId]);
    if (!rows.length || !rows[0].is_active) throw new AuthenticationError('User inactive');
    req.auth = { userId: decoded.userId, role: decoded.role, unitId: decoded.unitId };
    next();
  } catch (e) { if (e instanceof AuthenticationError) throw e; throw new AuthenticationError('Invalid token'); }
}