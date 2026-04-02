# RSCI Backend API

Reliable Stone Crushing Industry — Complete Backend

## Quick Start

1. Install dependencies:
   npm install

2. Copy environment file:
   copy .env.example .env

3. Configure .env with your PostgreSQL credentials

4. Run database migration:
   - Open Supabase SQL Editor or psql
   - Run sql/migrations/001_complete_schema.sql

5. Seed initial data:
   npm run seed

6. Start development server:
   npm run dev

## API Endpoints

All endpoints are prefixed with /api/v1

### Auth
- POST /auth/login — Login with phone + password
- POST /auth/register — Create user (owner only)
- POST /auth/refresh — Refresh access token
- POST /auth/change-password — Change password
- GET /auth/users — List users

### Parties
- POST /parties — Create party
- GET /parties — List parties (search, filter, paginate)
- GET /parties/top — Top parties by revenue
- GET /parties/:id — Get party details
- PUT /parties/:id — Update party
- DELETE /parties/:id — Soft delete (owner only)
- POST /parties/communications — Log communication
- POST /parties/addresses — Add address
- POST /parties/rates — Set party-specific rate

### Orders
- POST /orders — Create order (auto-calculates GST)
- GET /orders — List orders (filter by unit, party, status)
- GET /orders/:id — Get order with items
- PATCH /orders/:id/status — Update status
- DELETE /orders/:id — Soft delete (owner only)

### Payments
- POST /payments — Record payment (auto-updates ledger)
- GET /payments — List payments
- DELETE /payments/:id — Soft delete (owner only)

### Ledger
- GET /ledger/:partyId — Party ledger with outstanding
- GET /ledger-outstanding — Total outstanding with ageing
- GET /follow-up-list — Credit follow-up list
- POST /ledger/recalculate — Recalculate ageing statuses

### Invoices
- POST /invoices/generate — Generate GST invoice
- GET /invoices/order/:orderId — Get invoice by order
- GET /invoices — List invoices

### Trips
- POST /trips — Create trip
- PATCH /trips/:id/status — Update trip status (departed/delivered/issue)
- GET /trips/my — Driver's trips (driver only)
- GET /trips/active — Active trips (plant manager)
- GET /trips/stats — Trip statistics

### Stock
- POST /stock/movements — Record stock movement
- GET /stock/current — Current stock levels
- GET /stock/today — Today's movements

### Expenses
- POST /expenses — Create expense
- GET /expenses — List expenses (filter by unit, category, date)
- GET /expenses/summary — Expense summary
- DELETE /expenses/:id — Soft delete (owner only)

### Staff
- POST /staff — Create staff member
- GET /staff — List staff
- POST /staff/attendance — Mark attendance (bulk)
- GET /staff/attendance — Get attendance for date
- POST /staff/advances — Give advance
- GET /staff/payroll — Calculate payroll

### Cash Closing
- GET /cash-closing/expected — Calculate expected closing
- POST /cash-closing — Complete cash closing
- GET /cash-closing — List closings
- GET /cash-closing/status — Unit closing status

## Manual Setup Steps

1. Create Supabase project at https://supabase.com
2. Get connection string from Settings > Database
3. Run 001_complete_schema.sql in SQL Editor
4. Create .env from .env.example with your credentials
5. Run npm install && npm run dev