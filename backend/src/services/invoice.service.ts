import { query } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { generateInvoiceNumber } from '../utils/invoice';
import { amountInWords } from '../utils/dates';

export class InvoiceService {
  static async generateForOrder(orderId: string) {
    const { rows: or } = await query('SELECT o.*,p.name as party_name,p.gstin as party_gstin,p.is_gst_registered,p.address as party_address,u.name as unit_name FROM orders o JOIN parties p ON p.id=o.party_id JOIN units u ON u.id=o.unit_id WHERE o.id=$1 AND o.deleted_at IS NULL', [orderId]);
    if (!or.length) throw new NotFoundError('Order', orderId);
    const order = or[0];
    const { rows: items } = await query('SELECT oi.*,pr.name as product_name,pr.hsn_code,pr.gst_rate,pr.unit as product_unit FROM order_items oi JOIN products pr ON pr.id=oi.product_id WHERE oi.order_id=$1', [orderId]);
    const invNum = await generateInvoiceNumber(order.unit_id);
    const tp = items.reduce((s: number, i: any) => s + parseInt(i.taxable_paise), 0);
    const cgst = items.reduce((s: number, i: any) => s + parseInt(i.cgst_paise), 0);
    const sgst = items.reduce((s: number, i: any) => s + parseInt(i.sgst_paise), 0);
    const grand = items.reduce((s: number, i: any) => s + parseInt(i.total_paise), 0);
    const aiw = amountInWords(Math.round(grand / 100));
    const { rows: inv } = await query('INSERT INTO invoices (order_id,invoice_number,unit_id,party_id,taxable_paise,cgst_paise,sgst_paise,igst_paise,grand_total_paise,amount_in_words) VALUES ($1,$2,$3,$4,$5,$6,$7,0,$8,$9) RETURNING *', [orderId, invNum, order.unit_id, order.party_id, tp, cgst, sgst, grand, aiw]);
    await query('UPDATE orders SET invoice_number=$1,updated_at=NOW() WHERE id=$2', [invNum, orderId]);
    return { ...inv[0], items };
  }
  static async getInvoiceByOrder(orderId: string) {
    const { rows } = await query('SELECT * FROM invoices WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1', [orderId]);
    return rows[0] || null;
  }
  static async findAll(f: any, page: number = 1, limit: number = 20) {
    const c: string[] = []; const p: any[] = []; let i = 1;
    if (f.unitId) { c.push('i.unit_id=$' + i++); p.push(f.unitId); }
    if (f.dateFrom) { c.push('i.created_at>=$' + i++); p.push(f.dateFrom); }
    if (f.dateTo) { c.push('i.created_at<=$' + i++); p.push(f.dateTo); }
    const w = c.length ? 'WHERE ' + c.join(' AND ') : '';
    const { rows: cnt } = await query('SELECT COUNT(*) as c FROM invoices i ' + w, p);
    const off = (page - 1) * limit;
    const { rows } = await query('SELECT i.*,party.name as party_name,u.name as unit_name FROM invoices i JOIN parties party ON party.id=i.party_id JOIN units u ON u.id=i.unit_id ' + w + ' ORDER BY i.created_at DESC LIMIT $' + i + ' OFFSET $' + (i + 1), [...p, limit, off]);
    return { invoices: rows, total: parseInt(cnt[0]?.c || '0') };
  }
}