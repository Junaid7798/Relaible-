import { query, transaction } from '../config/database';
import { NotFoundError, ValidationError, CreditLimitError } from '../utils/errors';
import { calculateGST } from '../utils/currency';
import { generateInvoiceNumber } from '../utils/invoice';

export class OrderService {
  static async create(data: any, createdBy: string) {
    return await transaction(async (tx) => {
      const { rows: pr } = await tx('SELECT * FROM parties WHERE id = $1 AND deleted_at IS NULL', [data.party_id]);
      if (!pr.length) throw new NotFoundError('Party', data.party_id);
      
      if (data.payment_mode === 'credit') {
        if (!data.credit_due_date) throw new ValidationError('Credit due date required');
        let total = 0;
        for (const item of data.items) {
          const tax = Math.round(item.quantity_brass * item.rate_paise);
          const { rows: p } = await tx('SELECT gst_rate FROM products WHERE id = $1', [item.product_id]);
          const g = calculateGST(tax, p[0]?.gst_rate || 0);
          total += tax + g.totalGST;
        }
        const { rows: bal } = await tx(
          "SELECT COALESCE(SUM(CASE WHEN type='debit' THEN balance_paise ELSE -balance_paise END),0) as b FROM ledger_entries WHERE party_id = $1 AND status != 'settled'",
          [data.party_id]
        );
        const cur = Math.abs(bal[0]?.b || 0);
        if (cur + total > pr[0].credit_limit_paise && pr[0].credit_limit_paise > 0) {
          throw new CreditLimitError(pr[0].name, pr[0].credit_limit_paise / 100, (cur + total) / 100);
        }
      }
      
      const invNum = await generateInvoiceNumber(data.unit_id);
      let tp = 0, gstp = 0;
      const items = [];
      
      for (const item of data.items) {
        const tax = Math.round(item.quantity_brass * item.rate_paise);
        const { rows: p } = await tx('SELECT gst_rate FROM products WHERE id = $1', [item.product_id]);
        const g = calculateGST(tax, p[0]?.gst_rate || 0);
        tp += tax;
        gstp += g.totalGST;
        items.push({ ...item, taxable_paise: tax, cgst_paise: g.cgst, sgst_paise: g.sgst, total_paise: tax + g.totalGST });
      }
      
      const grand = tp + gstp;
      const { rows: or2 } = await tx(
        'INSERT INTO orders (unit_id,party_id,order_type,payment_mode,status,total_paise,gst_total_paise,grand_total_paise,invoice_number,credit_due_date,credit_security_type,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
        [data.unit_id, data.party_id, data.order_type, data.payment_mode, 'pending', tp, gstp, grand, invNum, data.credit_due_date, data.credit_security_type, createdBy]
      );
      const order = or2[0];
      const orderItems = [];
      
      for (const item of items) {
        const { rows: ir } = await tx(
          'INSERT INTO order_items (order_id,product_id,quantity_brass,quantity_kg,weighbridge_tonnes,rate_paise,taxable_paise,cgst_paise,sgst_paise,total_paise) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
          [order.id, item.product_id, item.quantity_brass, item.quantity_kg, item.weighbridge_tonnes, item.rate_paise, item.taxable_paise, item.cgst_paise, item.sgst_paise, item.total_paise]
        );
        orderItems.push(ir[0]);
        await tx(
          'INSERT INTO stock_movements (unit_id,product_id,type,quantity_brass,order_id,created_by) VALUES ($1,$2,$3,$4,$5,$6)',
          [data.unit_id, item.product_id, 'sale', -item.quantity_brass, order.id, createdBy]
        );
      }
      
      if (data.payment_mode === 'credit') {
        await tx(
          'INSERT INTO ledger_entries (party_id,order_id,type,amount_paise,balance_paise,due_date,status,security_type,approved_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [data.party_id, order.id, 'debit', grand, grand, data.credit_due_date, 'current', data.credit_security_type, createdBy]
        );
      }
      
      return { ...order, items: orderItems };
    });
  }

  static async findById(id: string) {
    const { rows } = await query('SELECT * FROM orders WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (!rows.length) throw new NotFoundError('Order', id);
    const { rows: items } = await query(
      'SELECT oi.*,p.name as product_name FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id = $1',
      [id]
    );
    return { ...rows[0], items };
  }

  static async findAll(f: any, p: any) {
    const conditions = ['o.deleted_at IS NULL'];
    const params: unknown[] = [];
    let paramIndex = 1;
    
    if (f.unitId) {
      conditions.push(`o.unit_id = $${paramIndex++}`);
      params.push(f.unitId);
    }
    if (f.partyId) {
      conditions.push(`o.party_id = $${paramIndex++}`);
      params.push(f.partyId);
    }
    if (f.status) {
      conditions.push(`o.status = $${paramIndex++}`);
      params.push(f.status);
    }
    
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    const { rows: cnt } = await query('SELECT COUNT(*) as c FROM orders o ' + whereClause, params);
    const offset = (p.page - 1) * p.limit;
    
    const { rows } = await query(
      'SELECT o.*,p.name as party_name,u.name as unit_name FROM orders o JOIN parties p ON p.id=o.party_id JOIN units u ON u.id=o.unit_id ' + whereClause + ' ORDER BY o.created_at DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1),
      [...params, p.limit, offset]
    );
    
    return { orders: rows, total: parseInt(cnt[0]?.c || '0') };
  }

  static async updateStatus(id: string, status: string) {
    const { rows } = await query(
      'UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2 AND deleted_at IS NULL RETURNING *',
      [status, id]
    );
    if (!rows.length) throw new NotFoundError('Order', id);
    return rows[0];
  }

  static async softDelete(id: string) {
    const { rowCount } = await query('UPDATE orders SET deleted_at=NOW() WHERE id=$1 AND deleted_at IS NULL', [id]);
    if (!rowCount) throw new NotFoundError('Order', id);
  }
}
