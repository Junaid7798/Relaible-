import { Model } from '@nozbe/watermelondb'
import { field, date, relation } from '@nozbe/watermelondb/decorators'

export default class Invite extends Model {
  static table = 'invites'
  static associations = {
    organizations: { type: 'belongs_to' as const, key: 'org_id' },
    sites: { type: 'belongs_to' as const, key: 'site_id' },
    users: { type: 'belongs_to' as const, key: 'created_by' },
  }

  @field('org_id') orgId?: string
  @field('site_id') siteId?: string
  @field('code') code!: string
  @field('role') role!: string
  @field('created_by') createdBy?: string
  @field('used_by') usedBy?: string
  @date('used_at') usedAt?: Date
  @date('expires_at') expiresAt?: Date
  @field('max_uses') maxUses!: number
  @field('use_count') useCount!: number
  @field('is_active') isActive!: boolean
  
  @readonly @date('created_at') createdAt!: Date

  @relation('organizations', 'org_id') organization: any
  @relation('sites', 'site_id') site: any
}
