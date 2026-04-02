import { query } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class ExpenseService {
  static async create(data: any) {
    const { rows } = await query('INSERT INTO expenses (unit_id,category,description,amount_paise,payment_mode,date,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [data.unit_id, data.category, data.description, data.amount_paise, data.payment_mode, data.date, data.created_by]);
    return rows[0];
  }
  static async findAll(f: any, p: any) {
    const c = ['deleted_at IS NULL']; const params: any[] = []; let i = 1;
    if (f.unitId) { c.push('unit_id=$' + i++); params.push(f.unitId); }
    if (f.category) { c.push('category=$' + i++); params.push(f.category); }
    if (f.dateFrom) { c.push('date>=$' + i++); params.push(f.dateFrom); }
    if (f.dateTo) { c.push('date<=$' + i++); params.push(f.dateTo); }
    const w = 'WHERE ' + c.join(' AND ');
    const { rows: cnt } = await query('SELECT COUNT(*) as c FROM expenses ' + w, params);
    const off = (p.page - 1) * p.limit;
    const { rows } = await query('SELECT e.*,u.name as unit_name FROM expenses e JOIN units u ON u.id=e.unit_id ' + w + ' ORDER BY e.date DESC LIMIT $' + i + ' OFFSET $' + (i + 1), [...params, p.limit, off]);
    return { expenses: rows, total: parseInt(cnt[0]?.c || '0') };
  }
  static async getSummary(unitId?: string, dateFrom?: string, dateTo?: string) {
    const c = ['deleted_at IS NULL']; const p: any[] = []; let i = 1;
    if (unitId) { c.push('unit_id=$' + i++); p.push(unitId); }
    if (dateFrom) { c.push('date>=$' + i++); p.push(dateFrom); }
    if (dateTo) { c.push('date<=$' + i++); p.push(dateTo); }
    const w = 'WHERE ' + c.join(' AND ');
    const { rows: tr } = await query('SELECT COALESCE(SUM(amount_paise),0) as total FROM expenses ' + w, p);
    const { rows: cr } = await query('SELECT category,COALESCE(SUM(amount_paise),0) as total_paise,COUNT(*) as count FROM expenses ' + w + ' GROUP BY category ORDER BY total_paise DESC', p);
    return { total_paise: parseInt(tr[0]?.total || '0'), by_category: cr.map((r: any) => ({ category: r.category, total_paise: parseInt(r.total_paise), count: parseInt(r.count) })) };
  }
  static async softDelete(id: string) {
    const { rowCount } = await query('UPDATE expenses SET deleted_at=NOW() WHERE id=$1 AND deleted_at IS NULL', [id]);
    if (!rowCount) throw new NotFoundError('Expense', id);
  }
}