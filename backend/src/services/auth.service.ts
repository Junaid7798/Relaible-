import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query } from '../config/database';
import { env } from '../config/env';
import { AuthenticationError, ValidationError, NotFoundError } from '../utils/errors';
import { User } from '../types';
import type { AuthPayload, PartnerPermissions } from '../middleware/auth';
import { DEFAULT_PARTNER_PERMISSIONS } from '../middleware/auth';

const SALT = 12;

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function buildJwtPayload(user: {
  id: string;
  role: string;
  org_id: string | null;
  partner_permissions: PartnerPermissions | null;
}): AuthPayload {
  const siteIds: string[] = [];
  
  // Get user's sites if org exists
  if (user.org_id) {
    const siteResult = await query(
      'SELECT site_id FROM user_sites WHERE user_id = $1',
      [user.id]
    );
    siteIds.push(...siteResult.rows.map((r: { site_id: string }) => r.site_id));
  }
  
  return {
    userId: user.id,
    role: user.role as AuthPayload['role'],
    orgId: user.org_id || '',
    siteIds,
    partnerPermissions: user.partner_permissions || DEFAULT_PARTNER_PERMISSIONS
  };
}

function genTokens(payload: AuthPayload) {
  return {
    accessToken: jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' } as SignOptions),
    refreshToken: jwt.sign({ userId: payload.userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' } as SignOptions)
  };
}

export class AuthService {
  static async login(phone: string, password: string) {
    const { rows } = await query<User>('SELECT * FROM users WHERE phone = $1 AND is_active = true', [phone]);
    if (!rows.length) throw new AuthenticationError('Invalid credentials');
    if (!await bcrypt.compare(password, rows[0].password_hash)) throw new AuthenticationError('Invalid credentials');
    
    const user = rows[0];
    const payload = await buildJwtPayload(user);
    const tokens = genTokens(payload);
    
    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        orgId: user.org_id,
        language: user.language
      }
    };
  }

  static async register(data: {
    name: string;
    phone: string;
    password: string;
    role: string;
    language?: string;
  }) {
    // Check if phone exists
    const { rows: existing } = await query('SELECT id FROM users WHERE phone = $1', [data.phone]);
    if (existing.length) throw new ValidationError('Phone already registered');
    
    const hash = await bcrypt.hash(data.password, SALT);
    const { rows } = await query<User>(
      'INSERT INTO users (name, phone, password_hash, role, language) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.name, data.phone, hash, data.role, data.language || 'en']
    );
    
    const user = rows[0];
    const payload = await buildJwtPayload(user);
    const tokens = genTokens(payload);
    
    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        orgId: user.org_id,
        language: user.language
      }
    };
  }

  // Owner creates organization after registration
  static async createOrganization(ownerId: string, data: { name: string; industryType?: string }) {
    // Check if user already has an org
    const { rows: existing } = await query('SELECT id FROM organizations WHERE owner_id = $1', [ownerId]);
    if (existing.length) throw new ValidationError('Organization already exists');
    
    // Create organization
    const { rows: org } = await query(
      'INSERT INTO organizations (name, owner_id, industry_type) VALUES ($1, $2, $3) RETURNING *',
      [data.name, ownerId, data.industryType || 'stone_crushing']
    );
    
    // Link user to organization
    await query('UPDATE users SET org_id = $1 WHERE id = $2', [org[0].id, ownerId]);
    
    return org[0];
  }

  // Create a site (unit)
  static async createSite(orgId: string, ownerId: string, data: { name: string; type: string; address?: string }) {
    const { rows } = await query(
      'INSERT INTO sites (org_id, name, type, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [orgId, data.name, data.type, data.address]
    );
    
    // Link owner to site
    await query(
      'INSERT INTO user_sites (user_id, site_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [ownerId, rows[0].id]
    );
    
    return rows[0];
  }

  // Generate invite code
  static async createInvite(
    orgId: string,
    createdBy: string,
    data: { role: string; siteId?: string; expiresInDays?: number; maxUses?: number }
  ) {
    const code = generateInviteCode();
    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
      : null;
    
    const { rows } = await query(
      `INSERT INTO invites (org_id, code, role, created_by, site_id, expires_at, max_uses)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [orgId, code, data.role, createdBy, data.siteId || null, expiresAt, data.maxUses || 1]
    );
    
    return rows[0];
  }

  // Validate invite code
  static async validateInvite(code: string) {
    const { rows } = await query(
      `SELECT i.*, o.name as org_name 
       FROM invites i 
       JOIN organizations o ON o.id = i.org_id 
       WHERE i.code = $1 AND i.is_active = true`,
      [code]
    );
    
    if (!rows.length) throw new ValidationError('Invalid or expired invite code');
    
    const invite = rows[0];
    
    // Check expiry
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      throw new ValidationError('Invite code has expired');
    }
    
    // Check usage
    if (invite.use_count >= invite.max_uses) {
      throw new ValidationError('Invite code has reached maximum uses');
    }
    
    return invite;
  }

  // Accept invite (new user joins)
  static async acceptInvite(
    code: string,
    userData: { name: string; phone: string; password: string; language?: string }
  ) {
    const invite = await this.validateInvite(code);
    
    // Check if user already exists
    const { rows: existing } = await query('SELECT id FROM users WHERE phone = $1', [userData.phone]);
    if (existing.length) throw new ValidationError('Phone already registered');
    
    // Create user
    const hash = await bcrypt.hash(userData.password, SALT);
    const { rows: user } = await query(
      `INSERT INTO users (name, phone, password_hash, role, org_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userData.name, userData.phone, hash, invite.role, invite.org_id]
    );
    
    // Update invite usage
    await query(
      `UPDATE invites SET used_by = $1, used_at = NOW(), use_count = use_count + 1 WHERE id = $2`,
      [user[0].id, invite.id]
    );
    
    // Assign user to site if specified
    if (invite.site_id) {
      await query(
        'INSERT INTO user_sites (user_id, site_id) VALUES ($1, $2)',
        [user[0].id, invite.site_id]
      );
    }
    
    // Build tokens
    const payload = await buildJwtPayload(user[0]);
    const tokens = genTokens(payload);
    
    return {
      ...tokens,
      user: {
        id: user[0].id,
        name: user[0].name,
        role: user[0].role,
        orgId: user[0].org_id,
        language: user[0].language
      }
    };
  }

  // Get user's sites
  static async getUserSites(userId: string) {
    const { rows } = await query(
      `SELECT s.* FROM sites s
       JOIN user_sites us ON us.site_id = s.id
       WHERE us.user_id = $1 AND s.is_active = true`,
      [userId]
    );
    return rows;
  }

  // Update partner permissions (owner only)
  static async updatePartnerPermissions(userId: string, permissions: PartnerPermissions) {
    await query(
      'UPDATE users SET partner_permissions = $1, version = version + 1 WHERE id = $2',
      [JSON.stringify(permissions), userId]
    );
  }

  static async refreshToken(refresh: string) {
    try {
      const decoded = 
