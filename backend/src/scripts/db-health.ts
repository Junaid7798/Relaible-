import { pool, healthCheck } from '../config/database';
import { logger } from '../config/logger';

async function check() {
  const ok = await healthCheck();
  if (ok) {
    logger.info('Database connection: HEALTHY');
    const { rows } = await pool.query('SELECT version()');
    logger.info('PostgreSQL version: ' + rows[0]?.version);
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    logger.info('Tables: ' + tables.rows.map((r: any) => r.table_name).join(', '));
  } else {
    logger.error('Database connection: FAILED');
  }
  await pool.end();
  process.exit(ok ? 0 : 1);
}
check();