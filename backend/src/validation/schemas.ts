import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone"),
  password: z.string().min(6),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(8),
  role: z.enum(["OWNER", "PLANT_MANAGER", "SHOP_MANAGER", "DRIVER"]),
  unit_id: z.string().uuid().nullable().optional(),
  language: z.enum(["en", "mr", "hi"]).default("en"),
});

export const createPartySchema = z.object({
  name: z.string().min(2).max(200),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  address: z.string().max(500).optional().nullable(),
  village: z.string().max(100).optional().nullable(),
  taluka: z.string().max(100).optional().nullable(),
  district: z.string().max(100).optional().nullable(),
  pincode: z.string().regex(/^\d{6}$/).optional().nullable(),
  gstin: z.string().optional().nullable(),
  is_gst_registered: z.boolean().default(false),
  credit_limit_paise: z.number().int().min(0).default(0),
  referred_by: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updatePartySchema = createPartySchema.partial();

export const createOrderSchema = z.object({
  unit_id: z.string().uuid(),
  party_id: z.string().uuid(),
  order_type: z.enum(["spot", "delivery", "retail"]),
  payment_mode: z.enum(["cash", "credit", "upi", "cheque", "neft"]),
  credit_due_date: z.string().datetime().optional().nullable(),
  credit_security_type: z.enum(["cheque", "guarantor", "verbal", "other"]).optional().nullable(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity_brass: z.number().positive(),
    quantity_kg: z.number().positive().optional().nullable(),
    weighbridge_tonnes: z.number().positive().optional().nullable(),
    rate_paise: z.number().int().min(0),
  })).min(1),
});

export const createPaymentSchema = z.object({
  order_id: z.string().uuid().optional().nullable(),
  party_id: z.string().uuid(),
  unit_id: z.string().uuid(),
  amount_paise: z.number().int().positive(),
  mode: z.enum(["cash", "upi", "cheque", "neft", "advance_adjusted"]),
  upi_txn_id: z.string().max(100).optional().nullable(),
  upi_app: z.enum(["gpay", "phonepe", "paytm", "other"]).optional().nullable(),
  cheque_number: z.string().max(20).optional().nullable(),
  cheque_bank: z.string().max(100).optional().nullable(),
  cheque_date: z.string().datetime().optional().nullable(),
  cheque_is_pdc: z.boolean().default(false),
  neft_ref: z.string().max(100).optional().nullable(),
  date: z.string().datetime(),
});

export const createExpenseSchema = z.object({
  unit_id: z.string().uuid(),
  category: z.enum(["fuel", "maintenance", "wages", "electricity", "raw_material", "rent", "other"]),
  description: z.string().min(3).max(500),
  amount_paise: z.number().int().positive(),
  payment_mode: z.enum(["cash", "upi", "bank_transfer", "cheque"]),
  date: z.string().datetime(),
});

export const createStaffSchema = z.object({
  unit_id: z.string().uuid(),
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional().nullable(),
  role: z.string().min(2).max(50),
  salary_type: z.enum(["monthly", "daily"]),
  monthly_salary_paise: z.number().int().min(0).optional().nullable(),
  daily_rate_paise: z.number().int().min(0).optional().nullable(),
  pf_deduction_paise: z.number().int().min(0).default(0),
  esic_deduction_paise: z.number().int().min(0).default(0),
  joining_date: z.string().datetime(),
});

export const markAttendanceSchema = z.object({
  date: z.string().date(),
  entries: z.array(z.object({
    staff_id: z.string().uuid(),
    status: z.enum(["P", "A", "H", "PL", "WO"]),
  })).min(1),
});

export const giveAdvanceSchema = z.object({
  staff_id: z.string().uuid(),
  amount_paise: z.number().int().positive(),
  reason: z.string().max(500).optional().nullable(),
  date: z.string().datetime(),
});

export const createTripSchema = z.object({
  order_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  driver_id: z.string().uuid(),
  party_id: z.string().uuid(),
  delivery_address_id: z.string().uuid().optional().nullable(),
  quantity_brass: z.number().positive(),
  weighbridge_tonnes: z.number().positive().optional().nullable(),
  manager_note: z.string().max(500).optional().nullable(),
});

export const updateTripStatusSchema = z.object({
  status: z.enum(["departed", "delivered", "issue"]),
  fuel_litres: z.number().positive().optional().nullable(),
  fuel_cost_paise: z.number().int().min(0).optional().nullable(),
  distance_km: z.number().positive().optional().nullable(),
  issue_type: z.string().max(100).optional().nullable(),
  issue_note: z.string().max(1000).optional().nullable(),
  delivery_photo_url: z.string().max(500).optional().nullable(),
});

export const stockMovementSchema = z.object({
  unit_id: z.string().uuid(),
  product_id: z.string().uuid(),
  type: z.enum(["production", "sale", "adjustment", "purchase"]),
  quantity_brass: z.number(),
  reason: z.string().max(500).optional().nullable(),
  order_id: z.string().uuid().optional().nullable(),
});

export const createCashClosingSchema = z.object({
  unit_id: z.string().uuid(),
  date: z.string().date(),
  actual_closing_paise: z.number().int().min(0),
  explanation: z.string().max(1000).optional().nullable(),
});