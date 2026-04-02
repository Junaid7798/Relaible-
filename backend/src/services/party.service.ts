import { query, transaction } from "../config/database";
import { NotFoundError, ValidationError } from "../utils/errors";
import { Party, PaginationParams } from "../types";

export class PartyService {
  static async create(data: any, createdBy: string) {
    if (data.credit_limit_paise > 0 && (!data.address || !data.phone)) throw new ValidationError("Address and phone required for credit");
    const { rows } = await query<Party>("INSERT INTO parties (name,phone,address,village,taluka,district,pincode,gstin,is_gst_registered,credit_limit_paise,referred_by,notes,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *", [data.name, data.phone, data.address, data.village, data.taluka, data.district, data.pincode, data.gstin, data.is_gst_registered, data.credit_limit_paise, data.referred_by, data.notes, createdBy]);
    return rows[0];
  }
  static async findById(id: string) {
    const { rows } = await query("SELECT * FROM parties WHERE id = $1 AND deleted_at IS NULL", [id]);
    if (!rows.length) throw new NotFoundError("Party", id);
    const { rows: addr } = await query("SELECT * FROM party_addresses WHERE party_id = $1 ORDER BY is_default DESC", [id]);
    const { rows: bal } = await query("SELECT COALESCE(SUM(CASE WHEN type='debit' THEN balance_paise ELSE -balance_paise END),0) as b FROM ledger_entries WHERE party_id = $1 AND status != 'settled'", [id]);
    return { ...rows[0], addresses: addr, outstanding_paise: Math.abs(bal[0]?.b || 0) };
  }
  static async findAll(f: any, p: PaginationParams) {
    const c: string[] = ["deleted_at IS NULL"]; const params: any[] = []; let i = 1;
    if (f.search) { c.push("(name ILIKE $" + i + " OR phone ILIKE $" + i + ")"); params.push("%" + f.search + "%"); i++; }
    if (f.healthScore) { c.push("health_score = $" + i); params.push(f.healthScore); i++; }
    const w = c.length ? "WHERE " + c.join(" AND ") : "";
    const { rows: cnt } = await query("SELECT COUNT(*) as c FROM parties " + w, params);
    const off = (p.page - 1) * p.limit;
    const { rows } = await query("SELECT * FROM parties " + w + " ORDER BY " + (p.sortBy || "created_at") + " " + (p.sortOrder || "DESC") + " LIMIT $" + i + " OFFSET $" + (i + 1), [...params, p.limit, off]);
    return { parties: rows, total: parseInt(cnt[0]?.c || "0") };
  }
  static async update(id: string, data: any) {
    const f: string[] = []; const v: any[] = []; let i = 1;
    for (const k of ["name","phone","address","village","taluka","district","pincode","gstin","is_gst_registered","credit_limit_paise","referred_by","notes"]) {
      if (data[k] !== undefined) { f.push(k + " = $" + i); v.push(data[k]); i++; }
    }
    if (!f.length) throw new ValidationError("No fields");
    f.push("updated_at = NOW()");
    const { rows } = await query("UPDATE parties SET " + f.join(", ") + " WHERE id = $" + i + " AND deleted_at IS NULL RETURNING *", [...v, id]);
    if (!rows.length) throw new NotFoundError("Party", id);
    return rows[0];
  }
  static async softDelete(id: string) {
    const { rowCount } = await query("UPDATE parties SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL", [id]);
    if (!rowCount) throw new NotFoundError("Party", id);
  }
  static async getTopParties(limit: number = 10, period: string = "month") {
    const df = period === "month" ? "AND o.created_at >= date_trunc('month', CURRENT_DATE)" : "AND o.created_at >= date_trunc('year', CURRENT_DATE)";
    const { rows } = await query("SELECT p.id,p.name,p.phone,p.health_score,COALESCE(SUM(o.grand_total_paise),0) as total_revenue_paise,COUNT(o.id) as order_count FROM parties p JOIN orders o ON o.party_id = p.id WHERE p.deleted_at IS NULL AND o.deleted_at IS NULL " + df + " GROUP BY p.id ORDER BY total_revenue_paise DESC LIMIT $1", [limit]);
    return rows;
  }
  static async addCommunication(data: any) {
    const { rows } = await query("INSERT INTO party_communications (party_id,type,note,next_follow_up,created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *", [data.party_id, data.type, data.note, data.next_follow_up, data.created_by]);
    return rows[0];
  }
  static async addAddress(data: any) {
    const { rows } = await query("INSERT INTO party_addresses (party_id,label,address,village,taluka,district,pincode,is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", [data.party_id, data.label, data.address, data.village, data.taluka, data.district, data.pincode, data.is_default]);
    return rows[0];
  }
  static async setRate(partyId: string, productId: string, ratePaise: number) {
    const { rows } = await query("INSERT INTO party_rates (party_id,product_id,rate_paise) VALUES ($1,$2,$3) ON CONFLICT (party_id,product_id) DO UPDATE SET rate_paise=$3,updated_at=NOW() RETURNING *", [partyId, productId, ratePaise]);
    return rows[0];
  }
  static async getEffectiveRate(partyId: string, productId: string) {
    const pr = await query("SELECT rate_paise FROM party_rates WHERE party_id=$1 AND product_id=$2", [partyId, productId]);
    if (pr.rows[0]) return pr.rows[0].rate_paise;
    const lu = await query("SELECT oi.rate_paise FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.party_id=$1 AND oi.product_id=$2 ORDER BY o.created_at DESC LIMIT 1", [partyId, productId]);
    if (lu.rows[0]) return lu.rows[0].rate_paise;
    const pd = await query("SELECT default_rate_paise FROM products WHERE id=$1", [productId]);
    return pd.rows[0]?.default_rate_paise || 0;
  }
}
