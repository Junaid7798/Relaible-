import { query } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class TripService {
  static async create(data: any) {
    const { rows } = await query('INSERT INTO trips (order_id,vehicle_id,driver_id,party_id,delivery_address_id,quantity_brass,weighbridge_tonnes,manager_note,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [data.order_id, data.vehicle_id, data.driver_id, data.party_id, data.delivery_address_id, data.quantity_brass, data.weighbridge_tonnes, data.manager_note, data.created_by]);
    return rows[0];
  }
  static async updateStatus(tripId: string, status: string, data: any) {
    const tf = status === 'departed' ? 'departed_at' : 'delivered_at';
    const { rows } = await query('UPDATE trips SET status=$1,' + tf + '=NOW(),fuel_litres=COALESCE($2,fuel_litres),fuel_cost_paise=COALESCE($3,fuel_cost_paise),distance_km=COALESCE($4,distance_km),issue_type=COALESCE($5,issue_type),issue_note=COALESCE($6,issue_note),delivery_photo_url=COALESCE($7,delivery_photo_url),updated_at=NOW() WHERE id=$8 RETURNING *', [status, data.fuel_litres, data.fuel_cost_paise, data.distance_km, data.issue_type, data.issue_note, data.delivery_photo_url, tripId]);
    if (!rows.length) throw new NotFoundError('Trip', tripId);
    return rows[0];
  }
  static async findByDriver(driverId: string, status?: string) {
    let q = 'SELECT t.*,p.name as party_name,p.phone as party_phone,pa.address as delivery_address,v.registration as vehicle_registration,v.type as vehicle_type,o.invoice_number FROM trips t JOIN parties p ON p.id=t.party_id JOIN vehicles v ON v.id=t.vehicle_id JOIN orders o ON o.id=t.order_id LEFT JOIN party_addresses pa ON pa.id=t.delivery_address_id WHERE t.driver_id=$1';
    const p: any[] = [driverId];
    if (status) { q += ' AND t.status=$2'; p.push(status); }
    q += ' ORDER BY t.created_at DESC';
    return (await query(q, p)).rows;
  }
  static async findActive(unitId?: string) {
    let q = 'SELECT t.*,p.name as party_name,v.registration as vehicle_reg,d.name as driver_name,pa.address as delivery_address FROM trips t JOIN parties p ON p.id=t.party_id JOIN vehicles v ON v.id=t.vehicle_id JOIN users d ON d.id=t.driver_id LEFT JOIN party_addresses pa ON pa.id=t.delivery_address_id WHERE t.status IN ('pending','departed')';
    const p: any[] = [];
    if (unitId) { q += ' AND t.order_id IN (SELECT id FROM orders WHERE unit_id=$1)'; p.push(unitId); }
    q += ' ORDER BY t.created_at ASC';
    return (await query(q, p)).rows;
  }
  static async getTripStats(unitId?: string, dateFrom?: string, dateTo?: string) {
    const c: string[] = []; const p: any[] = []; let i = 1;
    if (unitId) { c.push('t.order_id IN (SELECT id FROM orders WHERE unit_id=$' + i++ + ')'); p.push(unitId); }
    if (dateFrom) { c.push('t.created_at>=$' + i++); p.push(dateFrom); }
    if (dateTo) { c.push('t.created_at<=$' + i++); p.push(dateTo); }
    const w = c.length ? 'WHERE ' + c.join(' AND ') : '';
    const { rows: st } = await query('SELECT COUNT(*) as total_trips,COUNT(*) FILTER (WHERE t.status='delivered') as completed_trips,COUNT(*) FILTER (WHERE t.status IN ('pending','departed')) as active_trips,COALESCE(SUM(t.fuel_litres),0) as total_fuel_litres,COALESCE(SUM(t.fuel_cost_paise),0) as total_fuel_cost_paise,COALESCE(SUM(t.distance_km),0) as total_distance_km FROM trips t ' + w, p);
    const s = st[0] || {};
    const { rows: vs } = await query('SELECT v.id as vehicle_id,v.registration,COUNT(t.id) as trips,COALESCE(SUM(t.fuel_cost_paise),0) as fuel_cost_paise FROM vehicles v LEFT JOIN trips t ON t.vehicle_id=v.id GROUP BY v.id,v.registration ORDER BY trips DESC');
    return { total_trips: parseInt(s.total_trips || '0'), completed_trips: parseInt(s.completed_trips || '0'), active_trips: parseInt(s.active_trips || '0'), total_fuel_litres: parseFloat(s.total_fuel_litres || '0'), total_fuel_cost_paise: parseInt(s.total_fuel_cost_paise || '0'), total_distance_km: parseFloat(s.total_distance_km || '0'), by_vehicle: vs.map((v: any) => ({ vehicle_id: v.vehicle_id, registration: v.registration, trips: parseInt(v.trips), fuel_cost_paise: parseInt(v.fuel_cost_paise) })) };
  }
}