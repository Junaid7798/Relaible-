-- RSCI Database Schema - Complete Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS units (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('plant','shop')), created_at TIMESTAMPTZ DEFAULT now());
INSERT INTO units (name,type) VALUES ('Stone Crushing Plant','plant'),('Retail Shop 1','shop'),('Retail Shop 2','shop') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, phone TEXT UNIQUE, password_hash TEXT NOT NULL DEFAULT '', role TEXT NOT NULL CHECK (role IN ('OWNER','PLANT_MANAGER','SHOP_MANAGER','DRIVER')), unit_id UUID REFERENCES units(id), language TEXT DEFAULT 'en' CHECK (language IN ('en','mr','hi')), is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS parties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT, village TEXT, taluka TEXT, district TEXT, pincode TEXT, gstin TEXT, is_gst_registered BOOLEAN DEFAULT false, credit_limit_paise BIGINT DEFAULT 0, health_score TEXT DEFAULT 'green' CHECK (health_score IN ('green','amber','red')), referred_by TEXT, notes TEXT, created_by UUID REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), deleted_at TIMESTAMPTZ);

CREATE TABLE IF NOT EXISTS party_addresses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), party_id UUID NOT NULL REFERENCES parties(id), label TEXT NOT NULL, address TEXT NOT NULL, village TEXT, taluka TEXT, district TEXT, pincode TEXT, is_default BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, unit TEXT NOT NULL CHECK (unit IN ('brass','bags','pieces','tonnes')), hsn_code TEXT, gst_rate NUMERIC DEFAULT 0, default_rate_paise BIGINT DEFAULT 0, unit_id UUID NOT NULL REFERENCES units(id), is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS party_rates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), party_id UUID NOT NULL REFERENCES parties(id), product_id UUID NOT NULL REFERENCES products(id), rate_paise BIGINT NOT NULL, updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE(party_id,product_id));

CREATE TABLE IF NOT EXISTS vehicles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), registration TEXT NOT NULL UNIQUE, type TEXT NOT NULL CHECK (type IN ('chanchat','709','hywa','dumper','other')), capacity_brass NUMERIC NOT NULL, driver_id UUID REFERENCES users(id), is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), unit_id UUID NOT NULL REFERENCES units(id), party_id UUID NOT NULL REFERENCES parties(id), order_type TEXT NOT NULL CHECK (order_type IN ('spot','delivery','retail')), payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash','credit','upi','cheque','neft')), status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')), total_paise BIGINT NOT NULL DEFAULT 0, gst_total_paise BIGINT NOT NULL DEFAULT 0, grand_total_paise BIGINT NOT NULL DEFAULT 0, invoice_number TEXT, credit_due_date TIMESTAMPTZ, credit_security_type TEXT, over_limit_approved_by UUID REFERENCES users(id), created_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), deleted_at TIMESTAMPTZ);

CREATE TABLE IF NOT EXISTS order_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id), product_id UUID NOT NULL REFERENCES products(id), quantity_brass NUMERIC NOT NULL, quantity_kg NUMERIC, weighbridge_tonnes NUMERIC, rate_paise BIGINT NOT NULL, taxable_paise BIGINT NOT NULL, cgst_paise BIGINT DEFAULT 0, sgst_paise BIGINT DEFAULT 0, total_paise BIGINT NOT NULL, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID REFERENCES orders(id), party_id UUID NOT NULL REFERENCES parties(id), unit_id UUID NOT NULL REFERENCES units(id), amount_paise BIGINT NOT NULL, mode TEXT NOT NULL CHECK (mode IN ('cash','upi','cheque','neft','advance_adjusted')), upi_txn_id TEXT, upi_app TEXT, cheque_number TEXT, cheque_bank TEXT, cheque_date TIMESTAMPTZ, cheque_is_pdc BOOLEAN DEFAULT false, neft_ref TEXT, received_by UUID NOT NULL REFERENCES users(id), date TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), deleted_at TIMESTAMPTZ);

CREATE TABLE IF NOT EXISTS ledger_entries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), party_id UUID NOT NULL REFERENCES parties(id), order_id UUID REFERENCES orders(id), payment_id UUID REFERENCES payments(id), type TEXT NOT NULL CHECK (type IN ('debit','credit')), amount_paise BIGINT NOT NULL, balance_paise BIGINT NOT NULL, due_date TIMESTAMPTZ, status TEXT DEFAULT 'current' CHECK (status IN ('current','follow_up','overdue','critical','settled')), security_type TEXT, approved_by UUID NOT NULL REFERENCES users(id), settled_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS trips (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id), vehicle_id UUID NOT NULL REFERENCES vehicles(id), driver_id UUID NOT NULL REFERENCES users(id), party_id UUID NOT NULL REFERENCES parties(id), delivery_address_id UUID REFERENCES party_addresses(id), quantity_brass NUMERIC NOT NULL, weighbridge_tonnes NUMERIC, status TEXT DEFAULT 'pending' CHECK (status IN ('pending','departed','delivered','issue')), departed_at TIMESTAMPTZ, delivered_at TIMESTAMPTZ, fuel_litres NUMERIC, fuel_cost_paise BIGINT, distance_km NUMERIC, issue_type TEXT, issue_note TEXT, delivery_photo_url TEXT, manager_note TEXT, created_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS stock_movements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), unit_id UUID NOT NULL REFERENCES units(id), product_id UUID NOT NULL REFERENCES products(id), type TEXT NOT NULL CHECK (type IN ('production','sale','adjustment','purchase')), quantity_brass NUMERIC NOT NULL, reason TEXT, order_id UUID REFERENCES orders(id), created_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS expenses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), unit_id UUID NOT NULL REFERENCES units(id), category TEXT NOT NULL CHECK (category IN ('fuel','maintenance','wages','electricity','raw_material','rent','other')), description TEXT NOT NULL, amount_paise BIGINT NOT NULL, payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash','upi','bank_transfer','cheque')), date TIMESTAMPTZ NOT NULL, created_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), deleted_at TIMESTAMPTZ);

CREATE TABLE IF NOT EXISTS staff (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), unit_id UUID NOT NULL REFERENCES units(id), name TEXT NOT NULL, phone TEXT, role TEXT NOT NULL, salary_type TEXT NOT NULL CHECK (salary_type IN ('monthly','daily')), monthly_salary_paise BIGINT, daily_rate_paise BIGINT, pf_deduction_paise BIGINT DEFAULT 0, esic_deduction_paise BIGINT DEFAULT 0, joining_date TIMESTAMPTZ NOT NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS attendance (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), staff_id UUID NOT NULL REFERENCES staff(id), date DATE NOT NULL, status TEXT NOT NULL CHECK (status IN ('P','A','H','PL','WO')), marked_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT now(), UNIQUE(staff_id,date));

CREATE TABLE IF NOT EXISTS advances (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), staff_id UUID NOT NULL REFERENCES staff(id), amount_paise BIGINT NOT NULL, reason TEXT, given_by UUID NOT NULL REFERENCES users(id), date TIMESTAMPTZ 
 NOT NULL, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS cash_closings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), unit_id UUID NOT NULL REFERENCES units(id), date DATE NOT NULL, opening_paise BIGINT NOT NULL, received_paise BIGINT NOT NULL, paid_out_paise BIGINT NOT NULL, expected_closing_paise BIGINT NOT NULL, actual_closing_paise BIGINT NOT NULL, difference_paise BIGINT NOT NULL, explanation TEXT, closed_by UUID NOT NULL REFERENCES users(id), closed_at TIMESTAMPTZ DEFAULT now(), UNIQUE(unit_id,date));

CREATE TABLE IF NOT EXISTS invoices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id), invoice_number TEXT NOT NULL UNIQUE, unit_id UUID NOT NULL REFERENCES units(id), party_id UUID NOT NULL REFERENCES parties(id), taxable_paise BIGINT NOT NULL, cgst_paise BIGINT DEFAULT 0, sgst_paise BIGINT DEFAULT 0, igst_paise BIGINT DEFAULT 0, grand_total_paise BIGINT NOT NULL, amount_in_words TEXT NOT NULL, pdf_url TEXT, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS party_communications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), party_id UUID NOT NULL REFERENCES parties(id), type TEXT NOT NULL CHECK (type IN ('call','whatsapp','visit','complaint','referral','promise')), note TEXT NOT NULL, next_follow_up TIMESTAMPTZ, created_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS advance_payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), party_id UUID NOT NULL REFERENCES parties(id), unit_id UUID NOT NULL REFERENCES units(id), amount_paise BIGINT NOT NULL, remaining_paise BIGINT NOT NULL, mode TEXT NOT NULL, reference TEXT, received_by UUID NOT NULL REFERENCES users(id), date TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS vehicle_maintenance (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vehicle_id UUID NOT NULL REFERENCES vehicles(id), service_date TIMESTAMPTZ NOT NULL, odometer_km NUMERIC NOT NULL, work_done TEXT NOT NULL, cost_paise BIGINT NOT NULL, next_service_km NUMERIC, next_service_date TIMESTAMPTZ, created_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT now());

-- Seed products
INSERT INTO products (name,unit,hsn_code,gst_rate,default_rate_paise,unit_id,is_active) SELECT 'VSI 20MM','brass','2517',5,84000,id,true FROM units WHERE name='Stone Crushing Plant' ON CONFLICT DO NOTHING;
INSERT INTO products (name,unit,hsn_code,gst_rate,default_rate_paise,unit_id,is_active) SELECT '10MM Aggregate','brass','2517',5,75000,id,true FROM units WHERE name='Stone Crushing Plant' ON CONFLICT DO NOTHING;
INSERT INTO products (name,unit,hsn_code,gst_rate,default_rate_paise,unit_id,is_active) SELECT 'Crush Sand','brass','2505',5,45000,id,true FROM units WHERE name='Stone Crushing Plant' ON CONFLICT DO NOTHING;
INSERT INTO products (name,unit,hsn_code,gst_rate,default_rate_paise,unit_id,is_active) SELECT 'Dust','brass','2505',5,35000,id,true FROM units WHERE name='Stone Crushing Plant' ON CONFLICT DO NOTHING;
INSERT INTO products (name,unit,hsn_code,gst_rate,default_rate_paise,unit_id,is_active) SELECT 'UltraTech Cement','bags','2523',28,420000,id,true FROM units WHERE name='Retail Shop 1' ON CONFLICT DO NOTHING;
INSERT INTO products (name,unit,hsn_code,gst_rate,default_rate_paise,unit_id,is_active) SELECT 'Red Bricks','pieces','6901',12,800,id,true FROM units WHERE name='Retail Shop 1' ON CONFLICT DO NOTHING;
INSERT INTO products (name,unit,hsn_code,gst_rate,default_rate_paise,unit_id,is_active) SELECT 'River Sand','brass','2505',5,38000,id,true FROM units WHERE name='Retail Shop 1' ON CONFLICT DO NOTHING;

-- Seed vehicles
INSERT INTO vehicles (registration,type,capacity_brass,is_active) VALUES ('MH-12-AB-1234','hywa',6,true),('MH-14-MX-0045','709',2,true),('MH-12-Z-4411','chanchat',1,true) ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_unit ON orders(unit_id);
CREATE INDEX IF NOT EXISTS idx_orders_party ON orders(party_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_party ON payments(party_id);
CREATE INDEX IF NOT EXISTS idx_payments_unit ON payments(unit_id);
CREATE INDEX IF NOT EXISTS idx_ledger_party ON ledger_entries(party_id);
CREATE INDEX IF NOT EXISTS idx_ledger_status ON ledger_entries(status);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_stock_unit ON stock_movements(unit_id);
CREATE INDEX IF NOT EXISTS idx_expenses_unit ON expenses(unit_id);
CREATE INDEX IF NOT EXISTS idx_staff_unit ON staff(unit_id);
CREATE INDEX IF NOT EXISTS idx_attendance_staff ON attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS BEGIN NEW.updated_at = now(); RETURN NEW; END LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS t_updated_parties ON parties; CREATE TRIGGER t_updated_parties BEFORE UPDATE ON parties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS t_updated_orders ON orders; CREATE TRIGGER t_updated_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS t_updated_expenses ON expenses; CREATE TRIGGER t_updated_expenses BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS t_updated_trips ON trips; CREATE TRIGGER t_updated_trips BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS t_updated_users ON users; CREATE TRIGGER t_updated_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
