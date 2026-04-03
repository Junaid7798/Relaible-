import { Model } from '@nozbe/watermelondb'
import { field, date, relation, children } from '@nozbe/watermelondb/decorators'

export default class Site extends Model {
  static table = 'sites'
  static associations = {
    organizations: { type: 'belongs_to' as const, key: 'org_id' },
    user_sites: { type: 'has_many' as const, foreignKey: 'site_id' },
    deliveries: { type: 'has_many' as const, foreignKey: 'site_id' },
  }

  @field('org_id') orgId?: string
  @field('name') name!: string
  @field('type') type!: string // 'plant' | 'shop' | 'warehouse'
  @field('address') address?: string
  @field('is_active') isActive!: boolean
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('organizations', 'org_id') organization: any
  @children('user_sites') userSites: any
}
