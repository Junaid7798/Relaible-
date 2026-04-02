import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'
import type Customer from './Customer'

export default class Sale extends Model {
  static table = 'sales'

  @relation('customers', 'customer_id') customer!: Customer
  
  @field('material') material!: string
  @field('quantity') quantity!: number
  @field('unit_price') unitPrice!: number
  @field('total_amount') totalAmount!: number
  @field('payment_method') paymentMethod!: string
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
