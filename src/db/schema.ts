import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    // Organizations
    tableSchema({
      name: 'organizations',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'owner_id', type: 'string', isOptional: true },
        { name: 'industry_type', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    // Sites (units/locations)
    tableSchema({
      name: 'sites',
      columns: [
        { name: 'org_id', type: 'string', isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    // Users with org and permissions
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'password_hash', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'org_id', type: 'string', isOptional: true },
        { name: 'partner_permissions', type: 'string', isOptional: true },
        { name: 'language', type: 'string' },
        { name: 'is_active', type: 'boolean' },
        { name: 'version', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    // User-Site assignments
    tableSchema({
      name: 'user_sites',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'site_id', type: 'string', isIndexed: true },
      ]
    }),
    // Invite codes
    tableSchema({
      name: 'invites',
      columns: [
        { name: 'org_id', type: 'string', isOptional: true },
        { name: 'site_id', type: 'string', isOptional: true },
        { name: 'code', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'created_by', type: 'string', isOptional: true },
        { name: 'used_by', type: 'string', isOptional: true },
        { name: 'used_at', type: 'number', isOptional: true },
        { name: 'expires_at', type: 'number', isOptional: true },
        { name: 'max_uses', type: 'number' },
        { name: 'use_count', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ]
    }),
    // Materials
    tableSchema({
      name: 'materials',
      columns: [
        { name: 'org_id', type: 'string', isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'unit', type: 'string' },
        { name: 'default_rate_paise', type: 'number' },
        { name: 'hsn_code', type: 'string', isOptional: true },
        { name: 'gst_rate', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'version', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    // Vehicles
    tableSchema({
      name: 'vehicles',
      columns: [
        { name: 'registration', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'capacity_brass', type: 'number' },
        { name: 'driver_id', type: 'string', isOptional: true },
        { name: 'org_id', type: 'string', isOptional: true },
        { name: 'site_id', type: 'string', isOptional: true },
        { name: 'fuel_level', type: 'number' },
        { name: 'odometer', type: 'number' },
        { name: 'last_service_date', type: 'number', isOptional: true },
        { name: 'next_service_due', type: 'number', isOptional: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'version', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    // Deliveries (replacing trips)
    tableSchema({
      name: 'deliveries',
      columns: [
        { name: 'org_id', type: 'string', isOptional: true },
        { name: 'site_id', type: 'string', isOptional: true },
        { name: 'vehicle_id', type: 'string', isOptional: true },
        { name: 'driver_id', type: 'string', isOptional: true },
        { name: 'customer_id', type: 'string', isOptional: true },
        { name: 'material_id', type: 'string', isOptional: true },
        { name: 'quantity_brass', type: 'number' },
        { name: 'quantity_kg', type: 'number' },
        { name: 'rate_paise', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'departed_at', type: 'number', isOptional: true },
        { name: 'delivered_at', type: 'number', isOptional: true },
        { name: 'driver_notes', type: 'string', isOptional: true },
        { name: 'manager_notes', type: 'string', isOptional: true },
        { name: 'issue_type', type: 'string', isOptional: true },
        { name: 'delivery_photo_url', type: 'string', isOptional: true },
        { name: 'version', type: 'number' },
        { name: 'created_by', type: 'string', isOptional: true },
        { name: 'updated_by', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    // Notifications
    tableSchema({
      name: 'notifications',
      columns: [
        { name: 'org_id', type: 'string', isOptional: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'body', type: 'string', isOptional: true },
        { name: 'data', type: 'string', isOptional: true },
        { name: 'read_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
      ]
    }),
    // Legacy tables kept for compatibility
    tableSchema({
      name: 'customers',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'outstanding_balance', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'days_overdue', type: 'number' },
        { name: 'last_payment_date', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'expenses',
      columns: [
        { name: 'date', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'unit', type: 'string' },
        { name: 'payment_mode', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'stock_logs',
      columns: [
        { name: 'date', type: 'number' },
        { name: 'material', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'shift', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'sales',
      columns: [
        { name: 'customer_id', type: 'string', isIndexed: true },
        { name: 'material', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'unit_price', type: 'number' },
        { name: 'total_amount', type: 'number' },
        { name: 'payment_method', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    })
  ]
})
