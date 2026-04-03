import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

export default class Delivery extends Model {
  static table = 'deliveries'
  static associations = {
    organizations: { type: 'belongs_to' as const, key: 'org_id' },
    sites: { type: 'belongs_to' as const, key: 'site_id' },
    vehicles: { type: 'belongs_to' as const, key: 'vehicle_id' },
    users: { type: 'belongs_to' as const, key: 'driver_id' },
  }

  @field('org_id') orgId?: string
  @field('site_id') siteId?: string
  @field('vehicle_id') vehicleId?: string
  @field('driver_id') driverId?: string
  @field('customer_id') customerId?: string
  @field('material_id') materialId?: string
  @field('quantity_brass') quantityBrass?: number
  @field('quantity_kg') quantityKg?: number
  @field('rate_paise') ratePaise?: number
  @field('status') status!: string
  @date('departed_at') departedAt?: Date
  @date('delivered_at') deliveredAt?: Date
  @field('driver_notes') driverNotes?: string
  @field('manager_notes') managerNotes?: string
  @field('issue_type') issueType?: string
  @field('delivery_photo_url') deliveryPhotoUrl?: string
  @field('version') version!: number
  @field('created_by') createdBy?: string
  @field('updated_by') updatedBy?: string
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('organizations', 'org_id') organization: any
  @relation('sites', 'site_id') site: any
  @relation('vehicles', 'vehicle_id') vehicle: any
  @relation('users', 'driver_id') driver: any
}
