import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
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
