import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators'

export default class Organization extends Model {
  static table = 'organizations'
  static associations = {
    sites: { type: 'has_many' as const, foreignKey: 'org_id' },
    users: { type: 'has_many' as const, foreignKey: 'org_id' },
    materials: { type: 'has_many' as const, foreignKey: 'org_id' },
    vehicles: { type: 'has_many' as const, foreignKey: 'org_id' },
  }

  @field('name') name!: string
  @field('owner_id') ownerId?: string
  @field('industry_type') industryType!: string
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @children('sites') sites: any
  @children('materials') materials: any
  @children('vehicles') vehicles: any
}
