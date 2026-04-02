import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query } from '../config/database';
import { env } from '../config/env';
import { AuthenticationError, ValidationError, NotFoundError } from '../utils/errors';
import { User } from '../types';

const SALT = 12;

function genTokens(u: { id: string; role: string; unit_id: string | null }) {
  const payload = { userId: u.id, role: u.role, unitId: u.unit_id };
  
  return {
    accessToken: jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' } as SignOptions),
    refreshToken: jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' } as SignOptions)
  };
}

export class AuthService {
  static async login(phone: string, password: string) {
    const { rows } = await query<User>('SELECT * FROM users WHERE phone = $1 AND is_active = true', [phone]);
    if (!rows.length) throw new AuthenticationError('Invalid credentials');
    if (!await bcrypt.compare(password, rows[0].password_hash)) throw new AuthenticationError('Invalid credentials');
    const tokens = genTokens(rows[0]);
    return {
      ...tokens,
      user: { id: rows[0].id, name: rows[0].name, role: rows[0].role, unitId: rows[0].unit_id, language: rows[0].language }
    };
  }

  static async register(data: { name: string; phone: string; password: string; role: string; unitId: string | null; language: string }) {
    const { rows: existing } = await query('SELECT id FROM users WHERE phone = $1', [data.phone]);
    if (existing.length) throw new ValidationError('Phone already registered');
    const hash = await bcrypt.hash(data.password, SALT);
    const { rows } = await query<User>(
      'INSERT INTO users (name,phone,password_hash,role,unit_id,language) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [data.name, data.phone, hash, data.role, data.unitId, data.language]
    );
    const tokens = genTokens(rows[0]);
    return {
      ...tokens,
      user: { id: rows[0].id, name: rows[0].name, role: rows[0].role, unitId: rows[0].unit_id, language: rows[0].language }
    };
  }

  static async refreshToken(refresh: string) {
    try {
      const decoded = jwt.verify(refresh, env.JWT_REFRESH_SECRET) as { userId: string };
      const { rows } = await query<User>('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.userId]);
      if (!rows.length) throw new AuthenticationError('User not found');
      const tokens = genTokens(rows[0]);
      return {
        ...tokens,
        user: { id: rows[0].id, name: rows[0].name, role: rows[0].role, unitId: rows[0].unit_id, language: rows[0].language }
      };
    } catch {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  static async changePassword(userId: string, current: string, newPw: string) {
    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (!rows.length) throw new NotFoundError('User', userId);
    if (!await bcrypt.compare(current, rows[0].password_hash)) throw new AuthenticationError('Wrong password');
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [await bcrypt.hash(newPw, SALT), userId]);
  }

  static async getUsers(unitId?: string) {
    let sql = 'SELECT id,name,phone,role,unit_id,language,is_active,created_at FROM users WHERE is_active = true';
    const params: unknown[] = [];
    if (unitId) {
      sql += ' AND (unit_id = $1 OR role = $2)';
      params.push(unitId, 'OWNER');
    }
    sql += ' ORDER BY name';
    return (await query(sql, params)).rows;
  }
}
