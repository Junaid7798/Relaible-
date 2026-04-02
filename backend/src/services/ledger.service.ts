import { query } from '../config/database';
import { categorizeByAgeing } from '../utils/credit';

export class LedgerService {
  static async getPartyLedger(partyId: string, p: any) {
    const { rows: cnt } = await query('SELECT COUNT(*) as c FROM ledger_entries WHERE party_id = $1', [partyId]);
    const off = (p.page - 1) * p.limit;
    const { rows } = await query('SELECT le.*,o.invoice_number,pm.mode as payment_mode FROM ledger_entries le LEFT JOIN orders o ON o.id=le.order_id LEFT JOIN payments pm ON pm.id=le.payment_id WHERE le.party_id=$1 ORDER BY le.created_at DESC LIMIT $2 OFFSET $3', [partyId, p.limit, off]);
    const { rows: bal } = await query("SELECT COALESCE(SUM(CASE WHEN type='debit' THEN balance_paise ELSE -balance_paise END),0) as b FROM ledger_entries WHERE party_id=$1 AND status!='settled'", [partyId]);
    return { entries: rows, total: parseInt(cnt[0]?.c || '0'), outstanding_paise: Math.abs(bal[0]?.b || 0) };
  }
  static async getTotalOutstanding(unitId?: string) {
    let tq = "SELECT COALESCE(SUM(le.balance_paise),0) as total FROM ledger_entries le WHERE le.type='debit' AND le.status!='settled' AND le.balance_paise>0";
    const p: any[] = [];
    if (unitId) { tq += ' AND le.order_id IN (SELECT id FROM orders WHERE unit_id=$1)'; p.push(unitId); }
    const { rows: tr } = await query(tq, p);
    const { rows: ar } = await query("SELECT le.balance_paise as amount_paise, EXTRACT(DAY FROM (NOW()-le.due_date)) as days_overdue FROM ledger_entries le WHERE le.type='debit' AND le.status!='settled' AND le.balance_paise>0 AND le.due_date IS NOT NULL", p.length ? [p[0]] : []);
    const ageing = categorizeByAgeing(ar.map((r: any) => ({ amount_paise: parseInt(r.amount_paise), days_overdue: parseInt(r.days_overdue || '0') })));
    const { rows: ur } = await query("SELECT u.id as unit_id,u.name as unit_name,COALESCE(SUM(le.balance_paise),0) as outstanding_paise FROM units u LEFT JOIN orders o ON o.unit_id=u.id LEFT JOIN ledger_entries le ON le.order_id=o.id AND le.type='debit' AND le.status!='settled' GROUP BY u.id,u.name ORDER BY outstanding_paise DESC");
    return { total_paise: parseInt(tr[0]?.total || '0'), ageing, by_unit: ur.map((r: any) => ({ unit_id: r.unit_id, unit_name: r.unit_name, outstanding_paise: parseInt(r.outstanding_paise) })) };
  }
  static async getFollowUpList(unitId?: string) {
    let q = "SELECT p.id as party_id,p.name as party_name,p.phone,le.id as entry_id,le.balance_paise,le.due_date,le.status,EXTRACT(DAY FROM (NOW()-le.due_date)) as days_overdue FROM ledger_entries le JOIN parties p ON p.id=le.party_id WHERE le.type='debit' AND le.status IN ('follow_up','overdue','critical') AND le.balance_paise>0";
    const p: any[] = [];
    if (unitId) { q += ' AND le.order_id IN (SELECT id FROM orders WHERE unit_id=$1)'; p.push(unitId); }
    q += " ORDER BY CASE le.status WHEN 'critical' THEN 1 WHEN 'overdue' THEN 2 WHEN 'follow_up' THEN 3 END, le.balance_paise DESC";
    return (await query(q, p)).rows;
  }
  static async recalculateAgeingStatuses() {
    const { rows } = await query("UPDATE ledger_entries SET status=CASE WHEN due_date IS NULL THEN 'current' WHEN EXTRACT(DAY FROM (NOW()-due_date))<=30 THEN 'current' WHEN EXTRACT(DAY FROM (NOW()-due_date))<=60 THEN 'follow_up' WHEN EXTRACT(DAY FROM (NOW()-due_date))<=90 THEN 'overdue' ELSE 'critical' END WHERE type='debit' AND status!='settled' RETURNING id");
    return rows.length;
  }
}