import { query } from '../config/database';

export class StockService {
  static async createMovement(data: any) {
    const { rows } = await query('INSERT INTO stock_movements (unit_id,product_id,type,quantity_brass,reason,order_id,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [data.unit_id, data.product_id, data.type, data.quantity_brass, data.reason, data.order_id, data.created_by]);
    return rows[0];
  }
  static async getCurrentStock(unitId?: string) {
    let q = 'SELECT p.id as product_id,p.name as product_name,p.unit as product_unit,u.id as unit_id,u.name as unit_name,COALESCE(SUM(sm.quantity_brass),0) as current_stock,COALESCE(SUM(sm.quantity_brass) FILTER (WHERE sm.type='production'),0) as total_produced,COALESCE(SUM(sm.quantity_brass) FILTER (WHERE sm.type='sale'),0) as total_sold FROM products p CROSS JOIN units u LEFT JOIN stock_movements sm ON sm.product_id=p.id AND sm.unit_id=u.id WHERE p.is_active=true';
    const p: any[] = [];
    if (unitId) { q += ' AND u.id=$1'; p.push(unitId); }
    q += ' GROUP BY p.id,p.name,p.unit,u.id,u.name ORDER BY u.name,p.name';
    return (await query(q, p)).rows;
  }
  static async getTodayMovements(unitId?: string) {
    let q = 'SELECT sm.*,p.name as product_name,u.name as unit_name FROM stock_movements sm JOIN products p ON p.id=sm.product_id JOIN units u ON u.id=sm.unit_id WHERE sm.created_at>=CURRENT_DATE';
    const p: any[] = [];
    if (unitId) { q += ' AND sm.unit_id=$1'; p.push(unitId); }
    q += ' ORDER BY sm.created_at DESC';
    return (await query(q, p)).rows;
  }
}