import { query } from '../config/database';
import { getCurrentFinancialYear } from './dates';
const PREFIXES: Record<string, string> = { 'Stone Crushing Plant': 'RSCI/PLANT', 'Retail Shop 1': 'RSCI/SHOP1', 'Retail Shop 2': 'RSCI/SHOP2' };
export async function generateInvoiceNumber(unitId: string): Promise<string> {
  const fy = getCurrentFinancialYear();
  const { rows } = await query('SELECT name FROM units WHERE id = $1', [unitId]);
  if (!rows.length) throw new Error('Unit not found: ' + unitId);
  const prefix = PREFIXES[rows[0].name] || 'RSCI/GEN';
  const { rows: seq } = await query('SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM \'/(\d+)$\') AS INTEGER)), 0) as mx FROM invoices WHERE invoice_number LIKE $1', [prefix + '/' + fy + '/%']);
  return prefix + '/' + fy + '/' + ((seq[0]?.mx || 0) + 1).toString().padStart(3, '0');
}