import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

import { schema } from './schema'
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
    Customer,
    Expense,
    StockLog,
    Sale,
  ],
})
