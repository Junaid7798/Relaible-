import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class StockLog extends Model {
  static table = 'stock_logs'

  @date('date') date!: Date
  @field('material') material!: string
  @field('quantity') quantity!: number
  @field('shift') shift!: string
  @field('notes') notes?: string
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
