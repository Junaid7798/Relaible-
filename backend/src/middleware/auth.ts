import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticationError } from '../utils/errors';
import { query } from '../config/database';

export interface PartnerPermissions {
  canViewSales: boolean;
  canEditSales: boolean;
  canViewExpenses: boolean;
  canEditExpenses: boolean;
  canViewStock: boolean;
  canEditStock: boolean;
  canViewCustomers: boolean;
  canEditCustomers: boolean;
  canViewDeliveries: boolean;
  canEditDeliveries: boolean;
  canViewReports: boolean;
  canViewStaff: boolean;
  canViewFinancials: boolean;
  allowedSiteIds: string[];
}

export interface AuthPayload {
  userId: string;
  role: 'owner' | 'admin' | 'site_manager' | 'driver' | 'partner';
  orgId: string;
  siteIds: string[];
  partnerPermissions?: PartnerPermissions;
  unitId?: string; // Legacy support
}

declare global {
  namespace Express {
    interface Request {
      auth: AuthPayload;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) throw new AuthenticationError('Missing token');
  
  try {
    const decoded = jwt.verify(h.substring(7), env.JWT_SECRET) as AuthPayload;
    const { rows } = await query('SELECT id, is_active, org_id FROM users WHERE id = $1', [decoded.userId]);
    
    if (!rows.length || !rows[0].is_active) throw new AuthenticationError('User inactive');
    
    // Build auth object with new structure
    req.auth = {
      userId: decoded.userId,
      role: decoded.role,
      orgId: decoded.orgId || rows[0].org_id,
      siteIds: decoded.siteIds || [],
      partnerPermissions: decoded.partnerPermissions,
      unitId: decoded.unitId // Legacy support
    };
    
    next();
  } catch (e) {
    if (e instanceof AuthenticationError) throw e;
    throw new AuthenticationError('Invalid token');
  }
}

// Default partner permissions (no access)
export const DEFAULT_PARTNER_PERMISSIONS: PartnerPermissions = {
  canViewSales: false,
  canEditSales: false,
  canViewExpenses: false,
  canEditExpenses: false,
  canViewStock: false,
  canEditStock: false,
  canViewCustomers: false,
  canEditCustomers: false,
  canViewDeliveries: false,
  canEditDeliveries: false,
  canViewReports: false,
  canViewStaff: false,
  canViewFinancials: false,
  allowedSiteIds: []
};
