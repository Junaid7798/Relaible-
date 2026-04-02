import { query } from '../config/database';
import { ValidationError } from '../utils/errors';

export class CashClosingService {
  static async calculateExpected(unitId: string, date: string) {
    const { rows: pr } = await query('SELECT actual_closing_paise FROM cash_closings WHERE unit_id=$1 AND date<$2::date ORDER BY date DESC LIMIT 1', [unitId, date]);
    const opening = parseInt(pr[0]?.actual_closing_paise || '0');
    const { rows: rr } = await query("SELECT COALESCE(SUM(amount_paise),0) as total FROM payments WHERE unit_id=$1 AND mode='cash' AND deleted_at IS NULL AND date>=$2::date AND date<($2::date + INTERVAL '1 day')", [unitId, date]);
    const received = parseInt(rr[0]?.total || '0');
    const { rows: pr2 } = await query("SELECT COALESCE(SUM(amount_paise),0) as total FROM expenses WHERE unit_id=$1 AND payment_mode='cash' AND deleted_at IS NULL AND date>=$2::date AND date<($2::date + INTERVAL '1 day')", [unitId, date]);
    const paidOut = parseInt(pr2[0]?.total || '0');
    return { opening_paise: opening, received_paise: received, paid_out_paise: paidOut, expected_closing_paise: opening + received - paidOut };
  }
  static async create(data: any, closedBy: string) {
    const { rows: ex } = await query('SELECT id FROM cash_closings WHERE unit_id=$1 AND date=$2::date', [data.unit_id, data.date]);
    if (ex.length) throw new ValidationError('Already closed for this date');
    const expected = await this.calculateExpected(data.unit_id, data.date);
    const diff = data.actual_closing_paise - expected.expected_closing_paise;
    if (diff !== 0 && !data.explanation) throw new ValidationError('Explanation required for difference');
    const { rows } = await query('INSERT INTO cash_closings (unit_id,date,opening_paise,received_paise,paid_out_paise,expected_closing_paise,actual_closing_paise,difference_paise,explanation,closed_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [data.unit_id, data.date, expected.opening_paise, expected.received_paise, expected.paid_out_paise, expected.expected_closing_paise, data.actual_closing_paise, diff, data.explanation, closedBy]);
    return rows[0];
  }
  static async findAll(f: any) {
    let q = 'SELECT cc.*,u.name as unit_name FROM cash_closings cc JOIN units u ON u.id=cc.unit_id WHERE 1=1';
    const p: any[] = []; let i = 1;
    if (f.unitId) { q += ' AND cc.unit_id=$' + i++; p.push(f.unitId); }
    if (f.dateFrom) { q += ' AND cc.date>=$' + i++; p.push(f.dateFrom); }
    if (f.dateTo) { q += ' AND cc.date<=$' + i++; p.push(f.dateTo); }
    q += ' ORDER BY cc.date DESC';
    return (await query(q, p)).rows;
  }
  static async getUnitStatus(date: string) {
    const { rows } = await query('SELECT u.id,u.name,cc.id as closing_id,cc.actual_closing_paise,cc.difference_paise FROM units u LEFT JOIN cash_closings cc ON cc.unit_id=u.id AND cc.date=$1::date', [date]);
    return rows.map((r: any) => ({ unit_id: r.id, unit_name: r.name, status: r.closing_id ? (r.difference_paise !== 0 ? 'discrepancy' : 'closed') : 'pending' }));
  }
}