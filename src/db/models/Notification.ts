import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

export default class Notification extends Model {
  static table = 'notifications'
  static associations = {
    organizations: { type: 'belongs_to' as const, key: 'org_id' },
    users: { type: 'belongs_to' as const, key: 'user_id' },
  }

  @field('org_id') orgId?: string
  @field('user_id') userId!: string
  @field('type') type!: string
  @field('title') title!: string
  @field('body') body?: string
  @field('data') data?: string // JSON string
  @date('read_at') readAt?: Date
  
  @readonly @date('created_at') createdAt!: Date

  @relation('organizations', 'org_id') organization: any
  @relation('users', 'user_id') user: any
}
