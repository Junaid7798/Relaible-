import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import { logger } from '../config/logger';

async function seed() {
  logger.info('Starting database seed...');

  // Seed owner user
  const hash = await bcrypt.hash('owner123', 12);
  await query(
    'INSERT INTO users (name, phone, password_hash, role, unit_id, language) VALUES ($1, $2, $3, $4, NULL, $5) ON CONFLICT (phone) DO NOTHING',
    ['Khan (Owner)', '9876543210', hash, 'OWNER', 'en']
  );

  // Seed plant manager
  const pmHash = await bcrypt.hash('manager123', 12);
  const { rows: plant } = await query('SELECT id FROM units WHERE name = $1', ['Stone Crushing Plant']);
  if (plant.length) {
    await query(
      'INSERT INTO users (name, phone, password_hash, role, unit_id, language) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (phone) DO NOTHING',
      ['Plant Manager', '9876543211', pmHash, 'PLANT_MANAGER', plant[0].id, 'mr']
    );
  }

  // Seed shop manager
  const smHash = await bcrypt.hash('manager123', 12);
  const { rows: shop1 } = await query('SELECT id FROM units WHERE name = $1', ['Retail Shop 1']);
  if (shop1.length) {
    await query(
      'INSERT INTO users (name, phone, password_hash, role, unit_id, language) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (phone) DO NOTHING',
      ['Shop 1 Manager', '9876543212', smHash, 'SHOP_MANAGER', shop1[0].id, 'mr']
    );
  }

  // Seed driver
  const dHash = await bcrypt.hash('driver123', 12);
  await query(
    'INSERT INTO users (name, phone, password_hash, role, unit_id, language) VALUES ($1, $2, $3, $4, NULL, $5) ON CONFLICT (phone) DO NOTHING',
    ['Rajesh Sharma (Driver)', '9876543213', dHash, 'DRIVER', 'hi']
  );

  // Seed sample parties
  const { rows: owner } = await query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['OWNER']);
  const ownerId = owner[0]?.id;
  if (ownerId) {
    await query('INSERT INTO parties (name, phone, address, taluka, district, credit_limit_paise, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING', ['Larsen & Toubro', '9876543210', 'Sector 4, MIDC', 'Pune', 'Pune', 50000000, ownerId]);
    await query('INSERT INTO parties (name, phone, address, taluka, district, credit_limit_paise, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING', ['Apex Constructions', '9988776655', 'Near Bus Stand', 'Nashik', 'Nashik', 20000000, ownerId]);
    await query('INSERT INTO parties (name, phone, address, taluka, district, credit_limit_paise, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING', ['Ramesh Builders', '9123456789', 'Main Road', 'Ahmednagar', 'Ahmednagar', 10000000, ownerId]);
  }

  // Seed sample staff
  if (plant.length) {
    await query('INSERT INTO staff (unit_id,name,phone,role,salary_type,monthly_salary_paise,joining_date) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING', [plant[0].id, 'Suresh Patil', '9876543214', 'Crusher Operator', 'monthly', 2500000, '2024-01-15']);
    await query('INSERT INTO staff (unit_id,name,phone,role,salary_type,daily_rate_paise,joining_date) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING', [plant[0].id, 'Ramesh Jadhav', '9876543215', 'Labour', 'daily', 80000, '2024-03-01']);
  }

  logger.info('Database seed completed successfully');
}

seed().catch((err) => { logger.error('Seed failed', err); process.exit(1); });