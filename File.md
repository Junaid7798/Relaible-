# Reliable Stone Crushing Industry — App Product Brief

> **Document type:** Product brainstorm + requirements brief  
> **Prepared by:** Khan (with AI-assisted structuring)  
> **Status:** Draft v1 — for client review and development planning  
> **Last updated:** April 2026

---

## 1. Business Overview

**Client:** Reliable Stone Crushing Industry  
**Location:** Maharashtra, India  
**Nature of business:** Stone crushing and aggregate production, wholesale delivery, and multi-product retail

The business operates three distinct units under a single owner:

| Unit | Type | Notes |
|---|---|---|
| Stone Crushing Plant | Manufacturing + wholesale | Core operation — produces aggregates |
| Retail Shop 1 | Retail | Sells cement, bricks, river sand, and other materials |
| Retail Shop 2 | Retail | Same product range, separate location |

The two retail shops are **fully independent businesses** that share only the same owner. They do not draw stock from the plant. Each must be tracked separately in the app.

---

## 2. Products

### Plant products (sold in brass or by weight)

| Product | Notes |
|---|---|
| VSI 20mm | Coarse aggregate |
| 10mm | Medium aggregate |
| Crush sand | Fine aggregate (manufactured sand) |
| Dust | Fine by-product |
| Other aggregates | As produced |

### Retail shop products

- Cement (bags)
- Bricks
- River sand
- Other building materials

**Unit of measurement:** The primary unit at the plant is **brass** (1 brass = 100 cubic feet ≈ 2.83 m³). All vehicle loads, orders, stock, and invoices are measured in brass. The plant also has a **weighbridge** for weight-based (tonne) measurement. Both values must be recorded on every transaction.

---

## 3. Fleet (Delivery Vehicles)

| Vehicle | Type | Capacity | Count |
|---|---|---|---|
| Tata Chanchat | Light truck | ~1 brass | 1 |
| Tata 709 | Medium truck | ~2 brass | 2 |
| Tata Hywa | Heavy truck | 4–6 brass | Multiple |

Each vehicle has a driver. Drivers own their own smartphones and will use the app on personal devices.

Every delivery trip must be logged as a self-contained record covering: vehicle, driver, customer, product, brass loaded, weighbridge reading (if applicable), delivery location, departure time, return time, and fuel consumed.

---

## 4. User Roles

| Role | Access level | Primary device |
|---|---|---|
| Owner | Full — all units, all data, all reports | Mobile (Android/iOS) |
| Plant manager | Plant operations, sales, fleet, stock, staff | Mobile |
| Shop manager (×2) | Own shop only — POS, stock, ledger | Mobile |
| Driver | Own trips only — log and view | Mobile (own phone) |

### Role rules
- The owner can see everything across all three units at any time.
- Plant managers and shop managers are scoped to their unit only.
- Drivers see only their own trip history and active delivery.
- No role can view or edit another unit's data except the owner.

---

## 5. Core App Modules

### Module 1 — Orders & Sales

Handles all sales transactions across all three units.

**Sale types:**

- **Spot sale (plant):** Customer arrives with own vehicle, loads on the spot, pays (cash/UPI/cheque) or takes on credit.
- **Delivery order (plant):** Customer orders ahead, company fleet dispatches, delivery logged against the trip.
- **Retail sale (shop):** Counter sale of cement, bricks, sand etc. with bill generated.

**Key fields per order:**
- Date and time
- Customer name + phone
- Product(s) + quantity in brass and/or kg/tonnes
- Vehicle (customer's or company's)
- Rate per brass / per unit
- Total amount
- Payment mode: Cash / UPI / Cheque / Credit
- If credit: expected payment date + follow-up flag
- Invoice number (auto-generated, GST-ready)

---

### Module 2 — Customer Ledger (Khata / Udhari)

The most critical module for cash flow control. Credit is common and the current paper-based system creates silent leakage.

**Features:**
- Every customer has a running ledger showing all sales, payments received, and outstanding balance.
- Credit entries are flagged with expected payment dates.
- Overdue entries are highlighted prominently on the manager's dashboard.
- Owner sees a consolidated outstanding balance across all units.
- Managers can log partial payments against any credit entry.
- Full payment history per customer (all transactions chronologically).
- Search and filter by customer name, outstanding amount, overdue status.

**Follow-up workflow:**
- Overdue entries surface automatically on the dashboard.
- Manager can mark "contacted" with a note.
- WhatsApp reminder can be sent to customer directly from the ledger entry (Phase 3).

---

### Module 3 — Billing & Invoicing

**GST status:** The business is GST registered. All invoices must be GST-compliant tax invoices.

**Invoice requirements:**
- Business name, GSTIN, address
- Customer name, GSTIN (if applicable), address
- Invoice number (sequential, per unit)
- HSN code per product
- Quantity, rate, taxable value
- GST breakup: CGST + SGST (or IGST for inter-state)
- Total amount in figures and words
- Payment mode

**Output formats:**
- Print (thermal or A4)
- Share via WhatsApp (PDF)
- Save as PDF

**Products and approximate HSN codes (to be confirmed with CA):**
- Crushed stone / aggregates: HSN 2517
- Manufactured sand: HSN 2505
- Cement: HSN 2523
- Bricks: HSN 6901
- River sand: HSN 2505

---

### Module 4 — Fleet & Delivery Management

Full trip lifecycle for all plant delivery vehicles.

**Trip record fields:**
- Trip date and time (departure + return)
- Vehicle (Chanchat / 709 / Hywa — selected from list)
- Driver (selected from staff list)
- Linked to which order / customer
- Product and quantity loaded (brass)
- Weighbridge reading at gate (tonnes) — if weighed
- Delivery location / address
- Fuel consumed (litres) + fuel cost
- Trip status: Pending / In transit / Delivered / Issue reported
- Driver notes / delivery proof (photo upload, Phase 2)

**Vehicle maintenance log:**
- Per vehicle: service date, odometer, work done, cost, next service due
- Alert when vehicle is due for service

**Dashboard view:**
- Active trips in real time
- Trips completed today
- Fuel spend this week/month per vehicle
- Maintenance alerts

---

### Module 5 — Stock & Inventory

Tracks stock levels at the plant and each retail shop separately.

**Plant stock:**
- Opening stock per product (in brass)
- Production added (daily crushing output)
- Sales deducted automatically when order is created
- Adjustments (wastage, measurement corrections)
- Closing stock per day

**Retail shop stock:**
- Opening stock per product (bags / units)
- Purchase entries (new stock received)
- Sales deducted when retail sale is created
- Low stock alert threshold per product (configurable)

**Key behaviour:**
- Stock is never manually editable without a reason note (audit trail).
- Owner sees consolidated stock across all units.
- Low stock alerts appear on dashboard.

---

### Module 6 — Expenses

Tracks all outgoing costs for each unit.

**Expense categories:**

| Category | Examples |
|---|---|
| Fuel | Per vehicle, per trip or bulk fill |
| Vehicle maintenance | Repairs, service, tyres |
| Raw material purchase | Boulders, river sand bought in |
| Electricity | Plant power bill |
| Staff wages | Daily/monthly payments, advances |
| Rent | If applicable |
| Other | Miscellaneous |

Each expense entry: date, category, amount, payment mode, unit (plant or shop), notes, recorded by.

---

### Module 7 — Staff & Salary

~50 staff across plant, shops, and fleet.

**Attendance:**
- Daily attendance marked by manager (present / absent / half day / leave)
- Per employee, per unit

**Salary structure:**
- Monthly salary or daily wage rate per employee
- Advance tracking: any advance given is logged and deducted automatically from month-end payout
- Net payable = Salary earned – Advances – Deductions
- Salary payment logged with date and mode

**Staff records:**
- Name, role, phone, joining date, daily/monthly rate
- Advance history
- Monthly salary summary

---

### Module 8 — Reports & Dashboard

**Owner dashboard (home screen):**
- Today's total sales (plant + shops, separate + combined)
- Total outstanding credit balance
- Active deliveries
- Low stock alerts
- Overdue payments
- This month: revenue, expenses, net

**Manager dashboard:**
- Today's sales for their unit
- Their unit's outstanding credit
- Low stock alerts
- Active trips (plant manager only)

**Reports (generate on demand):**
- Daily sales report (per unit or all)
- Customer ledger report (one customer or all)
- Outstanding credit list (sorted by amount or overdue days)
- Trip/delivery report (per vehicle, per driver, date range)
- Stock movement report
- Expense report (by category, by date range)
- Staff attendance + salary summary (monthly)
- P&L summary (revenue vs expenses, monthly)

**Export:** All reports exportable as PDF and shareable via WhatsApp.

---

### Module 9 — Offline-First Sync

The plant site may have poor or no internet connectivity. The app must work fully offline.

**Behaviour:**
- All data entry (sales, trips, attendance, expenses) works without internet.
- Data is stored locally on the device in SQLite.
- When internet is available, the app syncs automatically in the background.
- Conflict resolution: last-write-wins with timestamp, flagged for manager review if needed.
- Sync status indicator visible in the app (synced / pending / error).

---

### Module 10 — WhatsApp & Notifications (Phase 3)

- Share invoice PDF to customer on WhatsApp directly from the order screen.
- Send credit payment reminders to overdue customers.
- Delivery status update sent to customer when trip departs.
- Internal notifications for managers: low stock, overdue payment, vehicle service due.

---

## 6. Language Support

The app must support three languages with the ability to switch at any time:

- **English** (default)
- **Marathi** (मराठी)
- **Hindi** (हिंदी)

All UI labels, buttons, form fields, error messages, and dashboard text must be translated. Invoices are generated in English (standard for GST compliance) but the rest of the app UI can be in any selected language.

---

## 7. Tech Stack Recommendation

| Layer | Technology | Reason |
|---|---|---|
| Mobile (Android + iOS) | React Native via Expo | Single codebase for both platforms |
| Web (owner access / backup) | React (Expo Web) | Same codebase, no extra effort |
| Backend & database | Supabase | Auth, realtime DB, storage, APIs |
| Offline storage | WatermelonDB + SQLite | Reliable offline-first with Supabase sync |
| Invoicing / PDF | react-native-html-to-pdf | Generate GST invoices on device |
| WhatsApp sharing | Expo Sharing + WhatsApp deep link | Native share sheet |
| State management | Zustand | Lightweight, works well with RN |
| i18n (language) | i18next + react-i18next | Mature, supports Marathi/Hindi |

### Why React Native via Expo
- One codebase → Android, iOS, and Web.
- Expo Go allows testing on real devices immediately without builds.
- EAS Build for production APK/IPA.
- Khan has React + Supabase experience from ClinicFlow — the patterns transfer directly.

### Database structure (key tables)
- `units` — plant, shop_1, shop_2
- `users` — with role and unit_id
- `customers` — shared across units
- `orders` — with unit_id, order_type, payment_mode
- `order_items` — product, quantity_brass, quantity_kg, rate
- `ledger_entries` — linked to orders and payment records
- `payments` — cash/UPI/cheque/credit, linked to order or ledger
- `trips` — vehicle, driver, order_id, timestamps, fuel
- `vehicles` — fleet list with maintenance log
- `stock_movements` — per product per unit, in/out with reason
- `expenses` — per unit, per category
- `staff` — attendance, advances, salary records
- `invoices` — GST invoice records linked to orders

---

## 8. Build Phases

### Phase 1 — Core MVP (Month 1–2)
Goal: Replace the paper + Excel system for daily operations.

- User auth and role-based access (Owner, Plant Manager, Shop Manager, Driver)
- Orders and sales (spot + delivery + retail)
- Customer ledger and credit tracking
- Basic billing (non-GST first, add GST in Phase 2)
- Fleet trip logging
- Stock tracking (manual adjustments + sales deductions)
- Expense logging
- Owner dashboard with daily summary
- Offline support (basic — queue entries, sync on connect)

### Phase 2 — Operations Layer (Month 3–4)
Goal: Full operational visibility and staff management.

- GST invoice generation and PDF export
- Staff attendance and salary module
- Vehicle maintenance tracking and alerts
- Full reports (P&L, ledger, trips, stock movement)
- WhatsApp PDF sharing (invoices)
- Low stock and overdue payment alerts
- Language switching (Marathi / Hindi)
- Improved offline sync with conflict resolution

### Phase 3 — Intelligence & Communication (Month 5–6)
Goal: Proactive insights and customer communication.

- WhatsApp credit reminders (automated or one-tap)
- Delivery status updates to customers
- Analytics: top customers, best-selling products, peak days
- Tally export (for accountant — optional)
- Multi-device sync and session management
- Performance optimisation and battery/data efficiency

---

## 9. Key Design Decisions

**Brass as the primary unit.** Every screen that deals with plant product quantity shows brass first, with kg/tonne as secondary. Vehicle capacity presets (Chanchat = 1B, 709 = 2B, Hywa = 4–6B) speed up order entry.

**Credit is never invisible.** Outstanding balances surface on every relevant screen. Managers see their unit's credit exposure. The owner sees the total. No one has to go looking for it.

**Dual measurement always recorded.** When a weighbridge reading exists, both brass and weight are stored on the transaction. Disputes are resolved with both numbers available.

**Offline is a first-class feature, not a fallback.** The plant site may have no signal. The app must be fully usable offline. Sync happens silently in the background.

**Three units, one app, one login.** The owner logs in once and can switch between plant, shop 1, and shop 2. Managers and drivers only ever see their own unit.

**Simplicity for drivers.** The driver interface is a stripped-down 3-screen flow: view assigned trip, mark departed, mark delivered. Nothing else visible.

---

## 10. Open Questions (to resolve before development)

1. **CA confirmation** — HSN codes and GST rates for each product to be confirmed with the client's chartered accountant before building the invoice module.
2. **Tally integration** — Does the client want data to flow into Tally for year-end accounting, or is the app self-contained?
3. **Customer database** — Does the client have an existing customer list (even in Excel) to import, or do we build from scratch?
4. **Internet at plant** — What is the actual connectivity situation at the crushing site? (Determines how aggressively to engineer offline mode.)
5. **Retail shop POS** — Do shop managers need a barcode scanner or is manual product selection sufficient?
6. **Pricing per customer** — Do different customers get different rates for the same product, or is pricing fixed per product?
7. **App name** — "Reliable Stone Crushing Industry" as the app name, or a shorter branded name for the app icon?
8. **Weighbridge integration** — Is the weighbridge a standalone device or does it have a digital output that could connect to the app?

---

## 11. What This Replaces

| Current system | Replaced by |
|---|---|
| Paper records for all plant activity | Orders, trips, stock, expenses modules |
| Paper attendance register | Staff & salary module |
| Excel billing (manual) | GST invoice module (automated) |
| Mental tracking of credit/udhari | Customer ledger module |
| Verbal driver briefings | Trip assignment and logging |
| No delivery tracking | Fleet & delivery module |

---

*End of brief. Next step: client review of this document → confirm open questions → begin Phase 1 screen designs.*