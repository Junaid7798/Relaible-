import { Model } from '@nozbe/watermelondb'
import { field, relation } from '@nozbe/watermelondb/decorators'

export default class UserSite extends Model {
  static table = 'user_sites'
  static associations = {
    users: { type: 'belongs_to' as const, key: 'user_id' },
    sites: { type: 'belongs_to' as const, key: 'site_id' },
  }

  @field('user_id') userId!: string
  @field('site_id') siteId!: string

  @relation('users', 'user_id') user: any
  @relation('sites', 'site_id') site: any
}
