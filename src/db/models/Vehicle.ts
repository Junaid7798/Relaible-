import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

export default class Vehicle extends Model {
  static table = 'vehicles'
  static associations = {
    organizations: { type: 'belongs_to' as const, key: 'org_id' },
    sites: { type: 'belongs_to' as const, key: 'site_id' },
    users: { type: 'belongs_to' as const, key: 'driver_id' },
  }

  @field('registration') registration!: string
  @field('type') type!: string
  @field('capacity_brass') capacityBrass!: number
  @field('driver_id') driverId?: string
  @field('org_id') orgId?: string
  @field('site_id') siteId?: string
  @field('fuel_level') fuelLevel!: number
  @field('odometer') odometer!: number
  @date('last_service_date') lastServiceDate?: Date
  @date('next_service_due') nextServiceDue?: Date
  @field('is_active') isActive!: boolean
  @field('version') version!: number
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('organizations', 'org_id') organization: any
  @relation('sites', 'site_id') site: any
  @relation('users', 'driver_id') driver: any
}
