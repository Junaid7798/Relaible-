import { query, transaction } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class PaymentService {
  static async create(data: any, receivedBy: string) {
    return await transaction(async (tx) => {
      const { rows: pr } = await tx('SELECT id FROM parties WHERE id = $1 AND deleted_at IS NULL', [data.party_id]);
      if (!pr.length) throw new NotFoundError('Party', data.party_id);
      
      const { rows } = await tx(
        'INSERT INTO payments (order_id,party_id,unit_id,amount_paise,mode,upi_txn_id,upi_app,cheque_number,cheque_bank,cheque_date,cheque_is_pdc,neft_ref,received_by,date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *',
        [data.order_id, data.party_id, data.unit_id, data.amount_paise, data.mode, data.upi_txn_id, data.upi_app, data.cheque_number, data.cheque_bank, data.cheque_date, data.cheque_is_pdc, data.neft_ref, receivedBy, data.date]
      );
      const payment = rows[0];
      
      if (data.order_id) {
        const { rows: le } = await tx(
          "SELECT * FROM ledger_entries WHERE order_id = $1 AND type = 'debit' AND status != 'settled' ORDER BY created_at ASC LIMIT 1",
          [data.order_id]
        );
        if (le.length) {
          const nb = le[0].balance_paise - data.amount_paise;
          if (nb <= 0) {
            await tx("UPDATE ledger_entries SET balance_paise=0,status='settled',settled_at=NOW() WHERE id=$1", [le[0].id]);
          } else {
            await tx('UPDATE ledger_entries SET balance_paise=$1 WHERE id=$2', [nb, le[0].id]);
          }
        }
      } else {
        let remaining = data.amount_paise;
        const { rows: outs } = await tx(
          "SELECT * FROM ledger_entries WHERE party_id=$1 AND type='debit' AND status!='settled' AND balance_paise>0 ORDER BY created_at ASC",
          [data.party_id]
        );
        for (const entry of outs) {
          if (remaining <= 0) break;
          const applied = Math.min(remaining, entry.balance_paise);
          const nb = entry.balance_paise - applied;
          if (nb <= 0) {
            await tx("UPDATE ledger_entries SET balance_paise=0,status='settled',settled_at=NOW() WHERE id=$1", [entry.id]);
          } else {
            await tx('UPDATE ledger_entries SET balance_paise=$1 WHERE id=$2', [nb, entry.id]);
          }
          remaining -= applied;
        }
      }
      
      await tx(
        'INSERT INTO ledger_entries (party_id,payment_id,type,amount_paise,balance_paise,approved_by) VALUES ($1,$2,$3,$4,$5,$6)',
        [data.party_id, payment.id, 'credit', data.amount_paise, 0, receivedBy]
      );
      
      return payment;
    });
  }

  static async findAll(f: any, p: any) {
    const conditions = ['p.deleted_at IS NULL'];
    const params: unknown[] = [];
    let paramIndex = 1;
    
    if (f.unitId) {
      conditions.push(`p.unit_id = $${paramIndex++}`);
      params.push(f.unitId);
    }
    if (f.partyId) {
      conditions.push(`p.party_id = $${paramIndex++}`);
      params.push(f.partyId);
    }
    
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    const { rows: cnt } = await query('SELECT COUNT(*) as c FROM payments p ' + whereClause, params);
    const offset = (p.page - 1) * p.limit;
    
    const { rows } = await query(
      'SELECT p.*,party.name as party_name,u.name as unit_name FROM payments p JOIN parties party ON party.id=p.party_id JOIN units u ON u.id=p.unit_id ' + whereClause + ' ORDER BY p.date DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1),
      [...params, p.limit, offset]
    );
    
    return { payments: rows, total: parseInt(cnt[0]?.c || '0') };
  }

  static async softDelete(id: string) {
    const { rowCount } = await query('UPDATE payments SET deleted_at=NOW() WHERE id=$1 AND deleted_at IS NULL', [id]);
    if (!rowCount) throw new NotFoundError('Payment', id);
  }
}
