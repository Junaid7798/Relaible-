-- Phase 1: Organization Structure & Seed Data Cleanup
-- Run after 001_complete_schema.sql

-- ============================================================
-- STEP 1: Add is_seed flag for safe cleanup
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE parties ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;

-- ============================================================
-- STEP 2: Mark existing records as seed data
-- (Run: SELECT COUNT(*) FROM users WHERE is_seed = true; to verify)
-- ============================================================
UPDATE users SET is_seed = true WHERE id != (SELECT MIN(id) FROM users WHERE role = 'OWNER' LIMIT 1);
UPDATE parties SET is_seed = true;
UPDATE orders SET is_seed = true;
UPDATE order_items SET is_seed = true;
UPDATE payments SET is_seed = true;
UPDATE trips SET is_seed = true;
UPDATE stock_movements SET is_seed = true;
UPDATE expenses SET is_seed = true;
UPDATE products SET is_seed = true;

-- ============================================================
-- STEP 3: Organizations table (top-level)
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES users(id),
    industry_type TEXT DEFAULT 'stone_crushing',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 4: Sites table (replacing unit_id concept)
-- ============================================================
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('plant', 'shop', 'warehouse')),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 5: Invite codes system
-- ============================================================
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id),
    code TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'site_manager', 'driver', 'partner')),
    created_by UUID REFERENCES users(id),
    used_by UUID REFERENCES users(id),
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    max_uses INT DEFAULT 1,
    use_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_invites_code ON invites(code);

-- ============================================================
-- STEP 6: User-Site memberships
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE(user_id, site_id)
);

-- ============================================================
-- STEP 7: Extend users table with org & permissions
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_permissions JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;

-- ============================================================
-- STEP 8: Materials table (dynamic, editable)
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('brass', 'bag', 'piece', 'kg', 'tonnes')),
    default_rate_paise BIGINT DEFAULT 0,
    hsn_code TEXT,
    gst_rate NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 9: Extend vehicles table
-- ============================================================
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_level NUMERIC DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS odometer INT DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS last_service_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS next_service_due DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;

-- ============================================================
-- STEP 10: Deliveries table (replacing trips for better tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    site_id UUID REFERENCES sites(id),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES users(id),
    customer_id UUID REFERENCES parties(id),
    material_id UUID REFERENCES materials(id),
    quantity_brass NUMERIC,
    quantity_kg NUMERIC,
    rate_paise BIGINT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'departed', 'delivered', 'issue', 'cancelled')),
    departed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    driver_notes TEXT,
    manager_notes TEXT,
    issue_type TEXT,
    delivery_photo_url TEXT,
    version INT DEFAULT 1,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 11: Notifications table
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- ============================================================
-- STEP 12: Update updated_at trigger for new tables
-- ============================================================
DROP TRIGGER IF EXISTS t_updated_sites ON sites;
CREATE TRIGGER t_updated_sites BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS t_updated_materials ON materials;
CREATE TRIGGER t_updated_materials BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS t_updated_vehicles ON vehicles;
CREATE TRIGGER t_updated_vehicles BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS t_updated_deliveries ON deliveries;
CREATE TRIGGER t_updated_deliveries BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
