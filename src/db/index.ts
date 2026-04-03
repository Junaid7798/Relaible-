import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

import { schema } from './schema'
// New models
import Organization from './models/Organization'
import Site from './models/Site'
import UserSite from './models/UserSite'
import Invite from './models/Invite'
import Material from './models/Material'
import Delivery from './models/Delivery'
import Notification from './models/Notification'
import Vehicle from './models/Vehicle'
// Legacy models
import Customer from './models/Customer'
import Expense from './models/Expense'
import StockLog from './models/StockLog'
import Sale from './models/Sale'

const adapter = new LokiJSAdapter({
  schema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onIndexedDBVersionChange: () => {
    if (window.confirm('Database version changed. Please reload the app.')) {
      window.location.reload()
    }
  },
})

export const database = new Database({
  adapter,
  modelClasses: [
    Organization,
    Site,
    UserSite,
    Invite,
    Material,
    Delivery,
    Notification,
    Vehicle,
    Customer,
    Expense,
    StockLog,
    Sale,
  ],
})
