# RSCI Logistics App — Master Development Plan
### Stack: React 19 + Vite + TailwindCSS 4 + WatermelonDB + Express + PostgreSQL
### Version 1.0 — Full rebuild plan from existing scaffold

---

## PART 0 — DECISIONS LOCKED IN

Before any code is written, these architectural decisions are confirmed:

| Decision | Choice | Reason |
|---|---|---|
| Partner permissions | Option A — JSONB column on `users` table | Simpler, per-user granularity, one source of truth |
| Conflict resolution | Optimistic locking with `version` field | Best for field apps with multiple editors |
| Real-time saving | Optimistic UI — write local first, sync in background | Consistent with WatermelonDB design |
| Sync implementation | Wire `pushChanges` / `pullChanges` to Express API | Unstub the existing sync layer |
| Invite system | QR code + 6-digit alphanumeric code + shareable link | All three resolve to the same invite record |
| Fake data removal | Migration script with `is_seed` flag approach | Safe, reversible, auditable |

---

## PART 1 — DATA CLEANUP

### Strategy

Never truncate blindly. The cleanup must distinguish seed/fake records from any real records
that may have been entered during testing. The approach:

1. Add an `is_seed BOOLEAN DEFAULT false` column to every affected table
2. Mark all existing records as `is_seed = true` in a migration
3. Delete all records where `is_seed = true`
4. Drop the `is_seed` column after cleanup is confirmed

This is safe, reversible before step 3, and auditable.

### Migration Script — PostgreSQL

```sql
-- Migration: 001_mark_and_remove_seed_data.sql
-- Run in this exact order. Review between steps 2 and 3.

-- STEP 1: Add is_seed flag to all tables
ALTER TABLE customers       ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE expenses        ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE stock_logs      ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE sales            ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
ALTER TABLE users            ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false;
-- Add to any other data tables in your schema

-- STEP 2: Mark all current records as seed
UPDATE customers    SET is_seed = true;
UPDATE expenses     SET is_seed = true;
UPDATE stock_logs   SET is_seed = true;
UPDATE sales        SET is_seed = true;
-- DO NOT mark users — owner account may be real
-- Mark specific fake user IDs only:
-- UPDATE users SET is_seed = true WHERE email LIKE '%test%' OR email LIKE '%fake%' OR email LIKE '%seed%';

-- STEP 3: Review — run selects to confirm what will be deleted
-- SELECT COUNT(*) FROM customers WHERE is_seed = true;
-- SELECT COUNT(*) FROM sales WHERE is_seed = true;
-- Only proceed to step 4 after review

-- STEP 4: Delete all seed records
DELETE FROM stock_logs  WHERE is_seed = true;  -- delete dependents first
DELETE FROM expenses    WHERE is_seed = true;
DELETE FROM sales       WHERE is_seed = true;
DELETE FROM customers   WHERE is_seed = true;
-- DELETE FROM users WHERE is_seed = true;     -- only if confirmed

-- STEP 5: Drop the flag column (after confirming cleanup)
ALTER TABLE customers   DROP COLUMN IF EXISTS is_seed;
ALTER TABLE expenses    DROP COLUMN IF EXISTS is_seed;
ALTER TABLE stock_logs  DROP COLUMN IF EXISTS is_seed;
ALTER TABLE sales       DROP COLUMN IF EXISTS is_seed;
```

### WatermelonDB local cleanup

After the PostgreSQL cleanup, each device's local IndexedDB must also be cleared.
On first sync after cleanup, the server returns no records — WatermelonDB will reconcile.
For existing test devices, add a one-time reset on app load:

```typescript
// src/db/resetIfSeedVersion.ts
import { database } from './database';

const SEED_VERSION_KEY = 'rsci_seed_cleared_v1';

export async function resetIfSeedData() {
  const cleared = localStorage.getItem(SEED_VERSION_KEY);
  if (!cleared) {
    await database.write(async () => {
      await database.unsafeResetDatabase(); // wipes all local collections
    });
    localStorage.setItem(SEED_VERSION_KEY, 'true');
  }
}
```

Call `resetIfSeedData()` once in `main.tsx` before the app renders.

### Post-cleanup validation checklist

- [ ] All collection counts return 0 in the app after reset
- [ ] New records created after cleanup save correctly and sync
- [ ] No foreign key violations after seed delete
- [ ] JWT still valid for real owner account after user cleanup
- [ ] Sync push/pull returns empty arrays without errors

---

## PART 2 — NEW DATABASE TABLES

The existing schema has `unitId` in JWT but no actual site/unit table.
These tables must be created before building any role features.

### 2.1 Schema additions — PostgreSQL DDL

```sql
-- Organizations (top level — one per business)
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  owner_id      UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Sites / Units (replacing bare unitId in JWT)
CREATE TABLE sites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,               -- "Plant", "Shop 1", "Shop 2"
  type          TEXT NOT NULL,               -- 'plant' | 'shop' | 'warehouse'
  address       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Invite codes
CREATE TABLE invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  site_id       UUID REFERENCES sites(id),   -- null = org-level invite
  code          TEXT NOT NULL UNIQUE,        -- 6-char alphanumeric, e.g. "K7X2MN"
  role          TEXT NOT NULL,               -- 'admin' | 'site_manager' | 'driver' | 'partner'
  created_by    UUID NOT NULL REFERENCES users(id),
  used_by       UUID REFERENCES users(id),   -- null = not yet used
  used_at       TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,                 -- null = no expiry
  max_uses      INT DEFAULT 1,               -- 1 for personal, higher for open links
  use_count     INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_invites_code ON invites(code);

-- User ↔ Site memberships (which sites a user manages/drives for)
CREATE TABLE user_sites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_id       UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  UNIQUE(user_id, site_id)
);

-- Partner permissions (JSONB per user — Option A confirmed)
-- Add to existing users table:
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_permissions JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS version INT DEFAULT 1; -- optimistic locking

-- Vehicles table (dynamic, editable)
CREATE TABLE vehicles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id),
  site_id       UUID REFERENCES sites(id),
  name          TEXT NOT NULL,               -- "Tata Chanchat - MH12AB1234"
  type          TEXT NOT NULL,               -- 'chanchat' | '709' | 'hywa' | 'other'
  registration  TEXT,
  capacity_brass DECIMAL(5,2),
  current_driver_id UUID REFERENCES users(id),
  fuel_level    DECIMAL(5,2),               -- litres
  odometer      INT,                         -- km
  last_service_date DATE,
  next_service_due  DATE,
  is_active     BOOLEAN DEFAULT true,
  version       INT DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Materials table (dynamic, editable)
CREATE TABLE materials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id),
  name          TEXT NOT NULL,               -- "VSI 20mm", "Crush Sand"
  unit          TEXT NOT NULL,               -- 'brass' | 'bag' | 'piece' | 'kg'
  default_rate  DECIMAL(10,2),
  hsn_code      TEXT,
  gst_rate      DECIMAL(5,2),
  is_active     BOOLEAN DEFAULT true,
  version       INT DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Deliveries / Trips
CREATE TABLE deliveries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id),
  site_id       UUID NOT NULL REFERENCES sites(id),
  vehicle_id    UUID REFERENCES vehicles(id),
  driver_id     UUID REFERENCES users(id),
  customer_id   UUID REFERENCES customers(id),
  material_id   UUID REFERENCES materials(id),
  quantity_brass DECIMAL(6,2),
  quantity_kg   DECIMAL(10,2),
  rate          DECIMAL(10,2),
  status        TEXT DEFAULT 'pending',
    -- 'pending' | 'assigned' | 'departed' | 'delivered' | 'issue' | 'cancelled'
  departed_at   TIMESTAMPTZ,
  delivered_at  TIMESTAMPTZ,
  driver_notes  TEXT,
  manager_notes TEXT,
  issue_type    TEXT,
  delivery_photo_url TEXT,
  version       INT DEFAULT 1,              -- optimistic locking
  created_by    UUID REFERENCES users(id),
  updated_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Partner permissions schema (JSONB structure)

```typescript
// The shape of partner_permissions JSONB column
interface PartnerPermissions {
  canViewSales: boolean;
  canEditSales: boolean;
  canViewExpenses: boolean;
  canEditExpenses: boolean;
  canViewStock: boolean;
  canEditStock: boolean;
  canViewCustomers: boolean;
  canEditCustomers: boolean;
  canViewDeliveries: boolean;
  canEditDeliveries: boolean;
  canViewReports: boolean;
  canViewStaff: boolean;
  canViewFinancials: boolean;
  allowedSiteIds: string[];  // empty array = all sites
}

// Default for new Partner users — zero access until admin grants
const DEFAULT_PARTNER_PERMISSIONS: PartnerPermissions = {
  canViewSales: false,
  canEditSales: false,
  canViewExpenses: false,
  canEditExpenses: false,
  canViewStock: false,
  canEditStock: false,
  canViewCustomers: false,
  canEditCustomers: false,
  canViewDeliveries: false,
  canEditDeliveries: false,
  canViewReports: false,
  canViewStaff: false,
  canViewFinancials: false,
  allowedSiteIds: [],
};
```

---

## PART 3 — ONBOARDING & INVITE SYSTEM

### 3.1 Onboarding flow

```
NEW OWNER
    │
    ▼
Register account (email + password + phone)
    │
    ▼
Create Organisation
  - Organisation name (e.g. "Reliable Stone Crushing Industry")
  - Owner's name
  - Industry type (pre-filled: Stone Crushing)
    │
    ▼
Create Sites (can add more later)
  - Site name + type (Plant / Shop / Warehouse)
  - Address
  - At least one site required to proceed
    │
    ▼
Add Materials (can add more later)
  - Name, unit, default rate, HSN, GST %
  - Skippable — but flagged as incomplete
    │
    ▼
Add Vehicles (can add more later)
  - Name, type, registration, capacity
  - Skippable — but flagged as incomplete
    │
    ▼
Dashboard — onboarding complete
  - Invite prompt: "Invite your team" with 3 options
```

### 3.2 Invite mechanics

```typescript
// Backend: POST /api/invites/create
// Body: { role, siteId?, expiresInDays?, maxUses? }

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// Three invite surfaces, one underlying record:
// 1. QR code    → encodes the invite URL
// 2. Code       → user enters 6-char code manually
// 3. Link       → https://rsci.app/join/K7X2MN

// Invite URL always resolves to the join page
// Join page reads the code, looks up the invite, shows org + role + site
// User confirms → account created or linked → role + site assigned
```

### 3.3 Backend routes

```
POST   /api/auth/register          — new user, no org yet (owner flow)
POST   /api/auth/login             — returns JWT with role + orgId + siteIds
POST   /api/orgs/create            — owner creates org (called right after register)
POST   /api/sites/create           — owner adds a site
POST   /api/invites/create         — admin generates an invite
GET    /api/invites/:code          — validate invite code (public — no auth needed)
POST   /api/invites/:code/accept   — new user accepts invite (creates account + assigns role)
DELETE /api/invites/:id            — admin revokes an invite
GET    /api/invites                — admin lists all active invites
```

### 3.4 JWT payload after login

```typescript
interface JWTPayload {
  userId: string;
  orgId: string;
  role: 'owner' | 'admin' | 'site_manager' | 'driver' | 'partner';
  siteIds: string[];                    // which sites this user has access to
  partnerPermissions?: PartnerPermissions; // only for role=partner
  iat: number;
  exp: number;
}
```

### 3.5 RBAC middleware — updated

```typescript
// middleware/rbac.ts

export const ROLE_HIERARCHY = {
  owner: 5,
  admin: 4,
  partner: 3,       // variable — check partnerPermissions
  site_manager: 2,
  driver: 1,
};

export function requireMinRole(minRole: keyof typeof ROLE_HIERARCHY) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userLevel = ROLE_HIERARCHY[req.auth.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole];
    if (userLevel < requiredLevel) {
      return res.status(403).json({ error: 'Insufficient role' });
    }
    next();
  };
}

export function requireSiteAccess(req: Request, res: Response, next: NextFunction) {
  const siteId = req.params.siteId || req.body.siteId;
  if (!siteId) return next(); // no site filter needed
  
  const { role, siteIds, orgId } = req.auth;
  if (role === 'owner' || role === 'admin') return next(); // full access
  
  if (!siteIds.includes(siteId)) {
    return res.status(403).json({ error: 'No access to this site' });
  }
  next();
}

export function requirePartnerPermission(permission: keyof PartnerPermissions) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.auth.role !== 'partner') return next(); // only applies to partners
    const perms = req.auth.partnerPermissions;
    if (!perms || !perms[permission]) {
      return res.status(403).json({ error: `Partner missing permission: ${permission}` });
    }
    next();
  };
}

// Optimistic lock check
export function checkVersion(tableName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { id, version } = req.body;
    if (!id || version === undefined) return next();
    
    const result = await db.query(
      `SELECT version FROM ${tableName} WHERE id = $1`,
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Record not found' });
    if (result.rows[0].version !== version) {
      return res.status(409).json({ 
        error: 'Version conflict',
        message: 'This record was updated by someone else. Please refresh and try again.',
        currentVersion: result.rows[0].version
      });
    }
    next();
  };
}
```

---

## PART 4 — ROLE-BASED EXPERIENCES

### 4.1 Role matrix — what each role can do

| Feature | Owner | Admin | Site Manager | Driver | Partner |
|---|---|---|---|---|---|
| See all sites | ✅ | ✅ | Own sites only | ❌ | Configured |
| Create sites | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invite members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Set partner permissions | ✅ | ❌ | ❌ | ❌ | ❌ |
| View owner dashboard | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create/edit orders & sales | ✅ | ✅ | ✅ | ❌ | Configured |
| View financials / P&L | ✅ | Notified | ❌ | ❌ | Configured |
| Manage vehicles | ✅ | ✅ | ✅ | Fuel + mileage only | ❌ |
| Manage materials | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create deliveries | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit delivery status | ✅ | ✅ | ✅ | Own only | ❌ |
| Mark departed/delivered | ✅ | ✅ | ✅ | ✅ | ❌ |
| View customer ledger | ✅ | ✅ | ✅ | ❌ | Configured |
| Manage staff/attendance | ✅ | ✅ | ✅ | ❌ | ❌ |
| View reports | ✅ | ✅ | Site only | ❌ | Configured |
| Write off credit | ✅ | ❌ | ❌ | ❌ | ❌ |
| Override credit limit | ✅ | ❌ | ❌ | ❌ | ❌ |

### 4.2 Owner experience

**One goal: know the full business in under 10 seconds.**

Home screen layout:
```
┌─────────────────────────────────────────────────┐
│ RELIABLE STONE CRUSHING          [Org switcher] │
├────────────┬───────────────┬────────────────────┤
│ ₹X,XX,XXX  │ ₹X,XX,XXX     │ ₹XX,XXX            │
│ Today      │ Outstanding   │ Cash in hand       │
├────────────┴───────────────┴────────────────────┤
│ SITES         Plant ✓  Shop 1 ✓  Shop 2 ⚠      │
├─────────────────────────────────────────────────┤
│ Credit ageing: [0-30: ₹X.XL] [31-60: ₹X.XL]   │
│               [61-90: ₹XX,XXX] [90+: 🔴 ₹X,XXX]│
├─────────────────────────────────────────────────┤
│ Active deliveries: 3  │  Alerts: 2             │
├─────────────────────────────────────────────────┤
│ Quick snapshots:                                │
│  Today's P&L  │  Outstanding  │  Cash position  │
│  By product   │  By unit      │  Fleet summary  │
└─────────────────────────────────────────────────┘
```

Notifications the owner always receives:
- Any credit approval over the credit limit (with who approved it)
- Cash discrepancy at day closing (any unit)
- Delivery marked as "Issue" 
- Credit write-off initiated (requires owner PIN)
- New member joined via invite
- Vehicle breakdown / service overdue alert
- Any admin making a deletion

### 4.3 Admin experience

**Mirrors owner but scoped to operations — no owner financial handbook.**

Key differences from owner:
- Cannot set partner permissions (owner only)
- Cannot write off credit
- Cannot override credit limits
- Owner is notified of any admin action on: deletions, bulk edits, credit approvals
- Admin sees a banner on their dashboard: "Owner is notified of key actions"

Admin-specific UI:
- Member management: invite, deactivate, reassign site
- Partner permissions configurator (can view, cannot change — only owner can)
- Organisation settings

### 4.4 Site Manager experience

**Everything for their site(s). Nothing outside.**

Home screen shows:
```
┌─────────────────────────────────────────────────┐
│ PLANT SITE          [Cash: ₹12,450]  [Wed 15/4] │
├─────────────────────────────────────────────────┤
│ Today: 12 sales  ₹1,24,500 │ 3 deliveries live  │
├─────────────────────────────────────────────────┤
│ QUICK ACTIONS (max 2 taps):                     │
│  [+ Cash Sale]  [+ Credit Sale]  [+ Trip]       │
│  [Attendance]   [+ Expense]      [+ Payment]    │
├─────────────────────────────────────────────────┤
│ FOLLOW UP TODAY (3)                             │
│  Ramesh Contractors  ₹45,000  OVERDUE 3 days   │
│  Patil Builders      ₹22,000  DUE TODAY        │
├─────────────────────────────────────────────────┤
│ ACTIVE TRIPS (2)                               │
│  Chanchat → Patil Site    [IN TRANSIT]         │
│  Hywa → Shinde Nagar      [DEPARTED 9:15am]    │
├─────────────────────────────────────────────────┤
│ LOW STOCK ⚠                                    │
│  VSI 20mm: 12B remaining                       │
└─────────────────────────────────────────────────┘
```

Site manager can edit:
- All materials at their site (name, rate, stock levels)
- All vehicles assigned to their site (full edit — not just fuel/mileage)
- All deliveries at their site (create, assign driver, update status)
- All customers/parties linked to their site
- Staff attendance and salary at their site
- Expenses at their site

End-of-day checklist (auto-surfaces at configurable time, default 6pm):
1. Mark pending attendance
2. Log unrecorded expenses
3. Cash closing (physical count vs expected)
4. Review tomorrow's follow-ups

### 4.5 Driver experience

**One thing visible. Three actions possible. Zero confusion.**

Home screen — trip assigned:
```
┌─────────────────────────────────────────────────┐
│                                    [Rajesh K.]  │
│                                                 │
│  DELIVER TO                                     │
│  ┌─────────────────────────────────────────┐   │
│  │  PATIL CONSTRUCTION                     │   │
│  │  Plot 12, Nashik Road, Sinnar          │   │
│  │  📍 Open in Maps                        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  VSI 20mm  ·  2 brass                          │
│  Vehicle: Tata 709  MH12AB1234                 │
│                                                 │
│  Note from manager:                            │
│  "Call before arriving"                        │
│                                                 │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │  DEPARTED  │  │ DELIVERED  │  │  ISSUE   │  │
│  └────────────┘  └────────────┘  └──────────┘  │
└─────────────────────────────────────────────────┘
```

Home screen — no trip:
```
┌─────────────────────────────────────────────────┐
│                                    [Rajesh K.]  │
│                                                 │
│                                                 │
│            No trip assigned                    │
│                                                 │
│           कोणताही ट्रिप नाही                   │
│                                                 │
│                                                 │
│  Vehicle fuel update:                          │
│  [Update fuel level]  [Update mileage]         │
└─────────────────────────────────────────────────┘
```

Driver actions:
- DEPARTED: one tap, no input, auto-timestamps
- DELIVERED: one tap + optional photo
- ISSUE: tap → select issue type from list → optional voice note → notifies manager immediately
- Fuel level update: slider or numeric input (their vehicle only)
- Odometer update: numeric input (their vehicle only)
- View past trips: scrollable list, read-only

Language: defaults to language set during account setup. All text in Marathi/Hindi/English.

### 4.6 Partner experience

**Blank slate until admin grants permissions. No surprises.**

First login with zero permissions:
```
┌─────────────────────────────────────────────────┐
│  Welcome, [Name]                                │
│  Organisation: Reliable Stone Crushing          │
│                                                 │
│  Your access is being configured by the owner.  │
│  You currently have no permissions assigned.   │
│                                                 │
│  Contact the owner or admin to request access.  │
└─────────────────────────────────────────────────┘
```

Once permissions are granted, only permitted modules appear in nav.
No locked/greyed-out items — if you don't have access, the menu item doesn't exist.

Admin/Owner permission configurator for Partner:
```
Partner: Suresh Mehta
Site access: [All sites ▼]

SALES           [View ●] [Edit ○]
EXPENSES        [View ○] [Edit ○]
STOCK           [View ●] [Edit ○]
CUSTOMERS       [View ●] [Edit ○]
DELIVERIES      [View ●] [Edit ○]
REPORTS         [View ●]
STAFF           [View ○]
FINANCIALS      [View ○]

[Save permissions]  [Revoke partner access]
```

---

## PART 5 — SYNC IMPLEMENTATION (UNSTUBBING)

### 5.1 Current state

```typescript
// Current stub in sync.ts — returns nothing
async function pushChanges(changes) {
  return; // TODO
}
async function pullChanges(lastPulledAt) {
  return { changes: {}, timestamp: Date.now() }; // TODO
}
```

### 5.2 Target implementation

```typescript
// src/db/sync.ts — full implementation

import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './database';
import { getAuthToken } from '../auth/token';

const API_BASE = import.meta.env.VITE_API_URL;

export async function syncDatabase() {
  const token = await getAuthToken();
  
  await synchronize({
    database,
    
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const response = await fetch(
        `${API_BASE}/api/sync/pull?lastPulledAt=${lastPulledAt ?? 0}&schemaVersion=${schemaVersion}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Pull failed');
      const { changes, timestamp } = await response.json();
      return { changes, timestamp };
    },

    pushChanges: async ({ changes, lastPulledAt }) => {
      const response = await fetch(`${API_BASE}/api/sync/push?lastPulledAt=${lastPulledAt}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changes }),
      });
      if (!response.ok) {
        const err = await response.json();
        if (response.status === 409) {
          // Version conflict — surface to UI
          throw new VersionConflictError(err.message);
        }
        throw new Error('Push failed');
      }
    },

    migrationsEnabledAtVersion: 1,
  });
}

// Auto-sync: attempt every 30s when online
export function startAutoSync() {
  let interval: ReturnType<typeof setInterval>;
  
  const attemptSync = async () => {
    if (!navigator.onLine) return;
    try {
      await syncDatabase();
    } catch (err) {
      if (err instanceof VersionConflictError) {
        // Dispatch to UI to show conflict modal
        window.dispatchEvent(new CustomEvent('sync:conflict', { detail: err }));
      }
      // Other errors: silently retry next interval
    }
  };

  // Sync on connect
  window.addEventListener('online', attemptSync);
  // Sync periodically
  interval = setInterval(attemptSync, 30_000);
  // Initial sync
  attemptSync();

  return () => {
    clearInterval(interval);
    window.removeEventListener('online', attemptSync);
  };
}

class VersionConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VersionConflictError';
  }
}
```

### 5.3 Backend sync endpoint

```typescript
// routes/sync.ts

router.get('/sync/pull', requireAuth, async (req, res) => {
  const { lastPulledAt, schemaVersion } = req.query;
  const { orgId, siteIds, role } = req.auth;
  const since = new Date(Number(lastPulledAt));

  // Scope all pulls to org and accessible sites
  const siteFilter = (role === 'owner' || role === 'admin')
    ? `org_id = $1`
    : `org_id = $1 AND site_id = ANY($2)`;
  
  const params = (role === 'owner' || role === 'admin')
    ? [orgId]
    : [orgId, siteIds];

  const [customers, sales, expenses, stock_logs, deliveries, vehicles, materials] = 
    await Promise.all([
      db.query(`SELECT * FROM customers WHERE ${siteFilter} AND updated_at > $${params.length + 1}`, [...params, since]),
      db.query(`SELECT * FROM sales WHERE ${siteFilter} AND updated_at > $${params.length + 1}`, [...params, since]),
      db.query(`SELECT * FROM expenses WHERE ${siteFilter} AND updated_at > $${params.length + 1}`, [...params, since]),
      db.query(`SELECT * FROM stock_logs WHERE ${siteFilter} AND updated_at > $${params.length + 1}`, [...params, since]),
      db.query(`SELECT * FROM deliveries WHERE ${siteFilter} AND updated_at > $${params.length + 1}`, [...params, since]),
      db.query(`SELECT * FROM vehicles WHERE org_id = $1 AND updated_at > $2`, [orgId, since]),
      db.query(`SELECT * FROM materials WHERE org_id = $1 AND updated_at > $2`, [orgId, since]),
    ]);

  res.json({
    changes: {
      customers:  { created: customers.rows,  updated: [],  deleted: [] },
      sales:      { created: sales.rows,      updated: [],  deleted: [] },
      expenses:   { created: expenses.rows,   updated: [],  deleted: [] },
      stock_logs: { created: stock_logs.rows, updated: [],  deleted: [] },
      deliveries: { created: deliveries.rows, updated: [],  deleted: [] },
      vehicles:   { created: vehicles.rows,   updated: [],  deleted: [] },
      materials:  { created: materials.rows,  updated: [],  deleted: [] },
    },
    timestamp: Date.now(),
  });
});

router.post('/sync/push', requireAuth, checkVersion('deliveries'), async (req, res) => {
  const { changes } = req.body;
  const { orgId, userId } = req.auth;

  // Process each collection's changes
  // All writes: set updated_by = userId, updated_at = now(), version = version + 1
  // Full implementation per collection follows the same pattern
  
  await db.query('BEGIN');
  try {
    for (const record of changes.deliveries?.created ?? []) {
      await db.query(
        `INSERT INTO deliveries (id, org_id, site_id, status, created_by, updated_by, version, ...)
         VALUES ($1, $2, $3, $4, $5, $5, 1, ...) ON CONFLICT (id) DO NOTHING`,
        [record.id, orgId, record.site_id, record.status, userId, ...]
      );
    }
    for (const record of changes.deliveries?.updated ?? []) {
      const result = await db.query(
        `UPDATE deliveries SET status=$1, updated_by=$2, updated_at=now(), version=version+1
         WHERE id=$3 AND version=$4`,
        [record.status, userId, record.id, record.version]
      );
      if (result.rowCount === 0) {
        await db.query('ROLLBACK');
        return res.status(409).json({ error: 'Version conflict', recordId: record.id });
      }
    }
    await db.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
});
```

---

## PART 6 — NOTIFICATIONS

### 6.1 Events that notify the owner

| Event | Who is notified | Channel |
|---|---|---|
| New member joined via invite | Owner | In-app + push |
| Credit sale over party limit (approved) | Owner | In-app + push |
| Cash discrepancy at closing | Owner | In-app + push |
| Delivery marked as "Issue" | Owner + Site Manager | In-app + push |
| Credit write-off initiated | Owner | In-app (requires PIN) |
| Vehicle breakdown reported | Owner + Site Manager | In-app + push |
| Admin makes a deletion | Owner | In-app |
| Day not closed by 10pm | Owner | In-app |
| 90+ day credit entry | Owner | Daily digest |

### 6.2 Notification record table

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  user_id     UUID NOT NULL REFERENCES users(id),  -- recipient
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB,             -- linked record ids etc
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
```

### 6.3 Notification service

```typescript
// services/notificationService.ts

export async function notifyOwner(orgId: string, event: NotificationEvent) {
  const owner = await db.query(
    `SELECT id FROM users WHERE org_id = $1 AND role = 'owner'`,
    [orgId]
  );
  if (!owner.rows[0]) return;

  await db.query(
    `INSERT INTO notifications (org_id, user_id, type, title, body, data)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [orgId, owner.rows[0].id, event.type, event.title, event.body, event.data]
  );
  
  // If push tokens stored (future: Expo / FCM), send push here
}

export type NotificationEvent =
  | { type: 'member_joined'; title: string; body: string; data: { userId: string } }
  | { type: 'credit_over_limit'; title: string; body: string; data: { partyId: string; amount: number } }
  | { type: 'cash_discrepancy'; title: string; body: string; data: { siteId: string; difference: number } }
  | { type: 'delivery_issue'; title: string; body: string; data: { deliveryId: string } }
  | { type: 'credit_writeoff'; title: string; body: string; data: { partyId: string; amount: number } };
```

---

## PART 7 — BUILD ORDER

Execute in this sequence. Do not start a phase before the previous is tested.

### Phase 1 — Foundation (do this first, nothing else works without it)
- [ ] Run seed data cleanup migration
- [ ] Run `resetIfSeedData()` in app
- [ ] Create new DB tables: `organizations`, `sites`, `invites`, `user_sites`, `vehicles`, `materials`, `deliveries`
- [ ] Add `partner_permissions`, `org_id`, `version` to `users` table
- [ ] Update JWT payload to include `orgId`, `siteIds`, `partnerPermissions`
- [ ] Update RBAC middleware: `requireMinRole`, `requireSiteAccess`, `requirePartnerPermission`, `checkVersion`

### Phase 2 — Onboarding & Invites
- [ ] Owner registration → org creation → site creation flow
- [ ] Invite generation (QR + code + link)
- [ ] Invite acceptance flow (new user joins with role + site)
- [ ] Admin member management screen

### Phase 3 — Sync (unstub)
- [ ] Implement `pullChanges` endpoint (scoped by org + site)
- [ ] Implement `pushChanges` endpoint (with version conflict detection)
- [ ] Implement `syncDatabase()` in client
- [ ] Implement `startAutoSync()` with online/offline detection
- [ ] Conflict modal in UI

### Phase 4 — Role Experiences
- [ ] Owner dashboard (financial handbook view)
- [ ] Site Manager home screen + end-of-day checklist
- [ ] Driver interface (3-action only)
- [ ] Partner zero-permissions screen
- [ ] Owner: partner permissions configurator
- [ ] Role routing: app shows different home screen based on JWT role

### Phase 5 — Dynamic Data
- [ ] Materials: create / edit / deactivate (admin + site manager)
- [ ] Vehicles: create / edit (admin + site manager) / fuel+mileage only (driver)
- [ ] Delivery lifecycle: create → assign driver → departed → delivered / issue
- [ ] Delivery photo upload (driver on delivery)

### Phase 6 — Notifications
- [ ] Notification table + service
- [ ] Owner notification bell + list
- [ ] Push notification scaffolding (in-app first, push later)
- [ ] Per-event triggers wired to `notifyOwner()`

---

## PART 8 — TESTING CHECKLIST

### Data integrity after cleanup
- [ ] All collections return 0 records after reset
- [ ] New records created, saved, and sync correctly
- [ ] No FK violations after seed delete
- [ ] Version numbers start at 1 for all new records

### Role access
- [ ] Owner sees all sites, all data
- [ ] Site Manager cannot see other sites' data (test with direct API call)
- [ ] Driver can only update their own active delivery (test with another driver's delivery ID)
- [ ] Partner with no permissions sees blank screen
- [ ] Partner with `canViewSales: true` sees sales but not edit
- [ ] RLS query scoping confirmed with `EXPLAIN` on key queries

### Conflict resolution
- [ ] Two browsers edit same delivery simultaneously → second save shows conflict modal
- [ ] Conflict modal offers: "Keep yours" or "Accept theirs" → version increments correctly either way

### Invite system
- [ ] QR code, code, and link all resolve to the same invite record
- [ ] Expired invite shows friendly error
- [ ] Max-use invite blocks after limit
- [ ] Revoked invite shows "This invite is no longer valid"
- [ ] Member joins with correct role + site assigned in JWT

### Sync
- [ ] Record created offline → syncs when online → visible in second browser
- [ ] Record edited offline → version checked on push → conflict detected if server has newer version
- [ ] Pull scoping: site manager only receives their site's records

---

*End of development plan. Use this document as the task list for every sprint.*
*Each checkbox in Part 7 is one buildable unit of work.*