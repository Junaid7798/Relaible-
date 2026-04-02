import { Pool } from "pg";
import { env } from "./env";
import { logger } from "./logger";

export const pool = new Pool({
  host: env.DB_HOST, port: env.DB_PORT, database: env.DB_NAME,
  user: env.DB_USER, password: env.DB_PASSWORD,
  min: env.DB_POOL_MIN, max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => logger.error("Pool error", { error: err.message }));

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number | null }> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 1000) logger.warn("Slow query", { query: text.substring(0, 100), duration });
  return { rows: result.rows, rowCount: result.rowCount };
}

export async function transaction<T>(callback: (q: (t: string, p?: any[]) => Promise<any>) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback((t, p) => client.query(t, p));
    await client.query("COMMIT");
    return result;
  } catch (e) { await client.query("ROLLBACK"); throw e; }
  finally { client.release(); }
}

export async function healthCheck(): Promise<boolean> {
  try { const { rows } = await query("SELECT 1 as health"); return rows[0]?.health === 1; }
  catch { return false; }
}
