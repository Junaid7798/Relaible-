import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Expense extends Model {
  static table = 'expenses'

  @date('date') date!: Date
  @field('category') category!: string
  @field('description') description!: string
  @field('amount') amount!: number
  @field('unit') unit!: string
  @field('payment_mode') paymentMode!: string
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
