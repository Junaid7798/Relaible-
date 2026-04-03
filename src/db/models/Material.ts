import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

export default class Material extends Model {
  static table = 'materials'
  static associations = {
    organizations: { type: 'belongs_to' as const, key: 'org_id' },
  }

  @field('org_id') orgId?: string
  @field('name') name!: string
  @field('unit') unit!: string // 'brass' | 'bag' | 'piece' | 'kg' | 'tonnes'
  @field('default_rate_paise') defaultRatePaise!: number
  @field('hsn_code') hsnCode?: string
  @field('gst_rate') gstRate!: number
  @field('is_active') isActive!: boolean
  @field('version') version!: number
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('organizations', 'org_id') organization: any
}
