import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from './index'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('accessToken')
}

export async function syncDatabase() {
  const token = getAuthToken()
  
  if (!token) {
    console.log('No auth token, skipping sync')
    return
  }

  await synchronize({
    database,
    
    pullChanges: async ({ lastPulledAt, schemaVersion }) => {
      const url = `${API_BASE}/api/sync/pull?lastPulledAt=${lastPulledAt ?? 0}&schemaVersion=${schemaVersion}`
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Pull failed' }))
        throw new Error(error.error || 'Pull failed')
      }
      
      const data = await response.json()
      return {
        changes: data.changes || {},
        timestamp: data.timestamp || Date.now(),
      }
    },

    pushChanges: async ({ changes, lastPulledAt }) => {
      const url = `${API_BASE}/api/sync/push?lastPulledAt=${lastPulledAt}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changes }),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Push failed' }))
        if (response.status === 409) {
          throw new VersionConflictError(error.message, error.conflictData)
        }
        throw new Error(error.error || 'Push failed')
      }
      
      return await response.json()
    },

    migrationsEnabledAtVersion: 1,
  })
}

// Auto-sync management
let syncInterval: ReturnType<typeof setInterval> | null = null
let isOnline = navigator.onLine

export function startAutoSync(intervalMs: number = 30000) {
  // Clear any existing interval
  if (syncInterval) {
    clearInterval(syncInterval)
  }
  
  const attemptSync = async () => {
    if (!navigator.onLine) {
      console.log('Offline, skipping sync')
      return
    }
    
    const token = getAuthToken()
    if (!token) {
      console.log('No auth, skipping sync')
      return
    }
    
    try {
      await syncDatabase()
      console.log('Sync completed successfully')
    } catch (err) {
      if (err instanceof VersionConflictError) {
        // Dispatch event for UI to handle
        window.dispatchEvent(new CustomEvent('sync:conflict', { 
          detail: { message: err.message, data: err.conflictData } 
        }))
      } else {
        console.error('Sync error:', err)
      }
    }
  }

  // Sync on online event
  const handleOnline = () => {
    if (!isOnline) {
      isOnline = true
      console.log('Back online, attempting sync...')
      attemptSync()
    }
  }
  
  const handleOffline = () => {
    isOnline = false
    console.log('Went offline')
  }
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // Periodic sync
  syncInterval = setInterval(attemptSync, intervalMs)
  
  // Initial sync
  attemptSync()
  
  // Return cleanup function
  return () => {
    if (syncInterval) {
      clearInterval(syncInterval)
      syncInterval = null
    }
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

// Version conflict error for UI handling
export class VersionConflictError extends Error {
  conflictData?: any
  
  constructor(message: string, conflictData?: any) {
    super(message)
    this.name = 'VersionConflictError'
    this.conflictData = conflictData
  }
}

// Manual sync trigger
export async function triggerSync() {
  const token = getAuthToken()
  if (!token || !navigator.onLine) {
    return { success: false, error: 'Offline or not authenticated' }
  }
  
  try {
    await syncDatabase()
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Sync failed' }
  }
}
