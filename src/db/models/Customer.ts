import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Customer extends Model {
  static table = 'customers'

  @field('name') name!: string
  @field('phone') phone?: string
  @field('outstanding_balance') outstandingBalance!: number
  @field('status') status!: string
  @field('days_overdue') daysOverdue!: number
  @date('last_payment_date') lastPaymentDate?: Date
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
