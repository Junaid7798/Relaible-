import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';
import type { PartnerPermissions } from './auth';

// Role hierarchy - higher number = more access
export const ROLE_HIERARCHY: Record<string, number> = {
  owner: 5,
  admin: 4,
  partner: 3,
  site_manager: 2,
  driver: 1,
  // Legacy roles
  OWNER: 5,
  PLANT_MANAGER: 2,
  SHOP_MANAGER: 2,
  DRIVER: 1
};

// Check minimum role required
export function requireMinRole(minRole: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) throw new AuthorizationError('Auth required');
    
    const userLevel = ROLE_HIERARCHY[req.auth.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
    
    if (userLevel < requiredLevel) {
      throw new AuthorizationError(`Insufficient role. Required: ${minRole}`);
    }
    next();
  };
}

// Require specific role (exact match)
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) throw new AuthorizationError('Auth required');
    if (!roles.includes(req.auth.role)) {
      throw new AuthorizationError(`Need one of: ${roles.join(', ')}`);
    }
    next();
  };
}

// Site access control
export function requireSiteAccess(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) throw new AuthorizationError('Auth required');
  
  const siteId = req.params.siteId || req.query.site_id || req.body.siteId || req.body.site_id;
  
  // Owner and admin have full access
  if (req.auth.role === 'owner' || req.auth.role === 'admin') {
    return next();
  }
  
  // If no site filter needed, allow
  if (!siteId) return next();
  
  // Check if user has access to this site
  if (!req.auth.siteIds.includes(siteId)) {
    throw new AuthorizationError('No access to this site');
  }
  next();
}

// Partner permission check
export function requirePartnerPermission(permission: keyof PartnerPermissions) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) throw new AuthorizationError('Auth required');
    
    // Only applies to partners
    if (req.auth.role !== 'partner') return next();
    
    const perms = req.auth.partnerPermissions;
    if (!perms || !perms[permission]) {
      throw new AuthorizationError(`Partner missing permission: ${permission}`);
    }
    next();
  };
}

// Optimistic locking version check
export function checkVersion(tableName: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const { id, version } = req.body;
    
    // Skip if no version provided (new record)
    if (!id || version === undefined) return next();
    
    try {
      const { query: dbQuery } = await import('../config/database');
      const result = await dbQuery(
        `SELECT version FROM ${tableName} WHERE id = $1`,
        [id]
      );
      
      if (!result.rows.length) {
        throw new AuthorizationError('Record not found');
      }
      
      if (result.rows[0].version !== version) {
        throw new AuthorizationError('Version conflict - record was updated by someone else');
      }
      
      next();
    } catch (e) {
      if (e instanceof AuthorizationError) throw e;
      next(e);
    }
  };
}

// Legacy support - require unit access
export function requireUnitAccess(req: Request, _res: Response, next: NextFunction): void {
  if (req.auth.role === 'owner') return next();
  
  const uid = req.params.unitId || req.query.unit_id || req.body.unit_id;
  if (uid && req.auth.siteIds.length > 0 && !req.auth.siteIds.includes(uid)) {
    throw new AuthorizationError('Unit access denied');
  }
  next();
}

// Owner only
export function requireOwner(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth || req.auth.role !== 'owner') {
    throw new AuthorizationError('Owner access required');
  }
  next();
}

// Admin check (owner can also do admin actions)
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) throw new AuthorizationError('Auth required');
  
  const userLevel = ROLE_HIERARCHY[req.auth.role] ?? 0;
  if (userLevel < ROLE_HIERARCHY.admin) {
    throw new AuthorizationError('Admin access required');
  }
  next();
}
