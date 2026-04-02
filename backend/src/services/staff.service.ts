import { query, transaction } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export class StaffService {
  static async create(data: any) {
    const { rows } = await query('INSERT INTO staff (unit_id,name,phone,role,salary_type,monthly_salary_paise,daily_rate_paise,pf_deduction_paise,esic_deduction_paise,joining_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [data.unit_id, data.name, data.phone, data.role, data.salary_type, data.monthly_salary_paise, data.daily_rate_paise, data.pf_deduction_paise, data.esic_deduction_paise, data.joining_date]);
    return rows[0];
  }
  static async findAll(unitId?: string) {
    let q = 'SELECT * FROM staff WHERE is_active=true';
    const p: any[] = [];
    if (unitId) { q += ' AND unit_id=$1'; p.push(unitId); }
    q += ' ORDER BY name';
    return (await query(q, p)).rows;
  }
  static async markAttendance(date: string, entries: any[], markedBy: string) {
    return await transaction(async (tx) => {
      const results = [];
      for (const e of entries) {
        const { rows } = await tx('INSERT INTO attendance (staff_id,date,status,marked_by) VALUES ($1,$2,$3,$4) ON CONFLICT (staff_id,date) DO UPDATE SET status=$3,marked_by=$4 RETURNING *', [e.staff_id, date, e.status, markedBy]);
        results.push(rows[0]);
      }
      return results;
    });
  }
  static async getAttendance(unitId?: string, date?: string) {
    let q = 'SELECT s.id as staff_id,s.name as staff_name,s.role,s.unit_id,a.status,a.date,a.marked_by FROM staff s LEFT JOIN attendance a ON a.staff_id=s.id AND a.date=$1 WHERE s.is_active=true';
    const p: any[] = [date || new Date().toISOString().split('T')[0]];
    if (unitId) { q += ' AND s.unit_id=$2'; p.push(unitId); }
    q += ' ORDER BY s.name';
    return (await query(q, p)).rows;
  }
  static async giveAdvance(data: any, givenBy: string) {
    const { rows: sr } = await query('SELECT * FROM staff WHERE id=$1', [data.staff_id]);
    if (!sr.length) throw new NotFoundError('Staff', data.staff_id);
    const staff = sr[0];
    const maxAdv = staff.monthly_salary_paise || (staff.daily_rate_paise ? staff.daily_rate_paise * 30 : 0);
    const { rows: ar } = await query('SELECT COALESCE(SUM(amount_paise),0) as total FROM advances WHERE staff_id=$1 AND date>=date_trunc('month',CURRENT_DATE)', [data.staff_id]);
    const cur = parseInt(ar[0]?.total || '0');
    if (cur + data.amount_paise > maxAdv && maxAdv > 0) throw new ValidationError('Advances would exceed monthly salary');
    const { rows } = await query('INSERT INTO advances (staff_id,amount_paise,reason,given_by,date) VALUES ($1,$2,$3,$4,$5) RETURNING *', [data.staff_id, data.amount_paise, data.reason, givenBy, data.date]);
    return rows[0];
  }
  static async calculatePayroll(unitId?: string, month?: string) {
    const tm = month || new Date().toISOString().substring(0, 7);
    let sq = 'SELECT * FROM staff WHERE is_active=true';
    const sp: any[] = [];
    if (unitId) { sq += ' AND unit_id=$1'; sp.push(unitId); }
    const { rows: staff } = await query(sq, sp);
    const payroll = [];
    for (const s of staff) {
      const { rows: ar } = await query('SELECT COUNT(*) FILTER (WHERE status='P') as dp,COUNT(*) FILTER (WHERE status='H') as dh FROM attendance WHERE staff_id=$1 AND date>=$2::date AND date<($2::date + INTERVAL '1 month')', [s.id, tm + '-01']);
      const dp = parseInt(ar[0]?.dp || '0'); const dh = parseInt(ar[0]?.dh || '0');
      const se = s.salary_type === 'monthly' ? (s.monthly_salary_paise || 0) : Math.round((s.daily_rate_paise || 0) * (dp + dh * 0.5));
      const { rows: adv } = await query('SELECT COALESCE(SUM(amount_paise),0) as total FROM advances WHERE staff_id=$1 AND date>=$2::date AND date<($2::date + INTERVAL '1 month')', [s.id, tm + '-01']);
      const at = parseInt(adv[0]?.total || '0');
      const pf = s.pf_deduction_paise || 0; const es = s.esic_deduction_paise || 0;
      payroll.push({ staff_id: s.id, staff_name: s.name, days_present: dp, days_half: dh, salary_earned_paise: se, advances_total_paise: at, pf_deduction_paise: pf, esic_deduction_paise: es, net_payable_paise: se - at - pf - es });
    }
    return payroll;
  }
}