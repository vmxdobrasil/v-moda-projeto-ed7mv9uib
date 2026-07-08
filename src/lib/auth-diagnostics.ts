interface AuthStateLog {
  loading: boolean
  isAuthenticated: boolean
  isHydrating: boolean
  hasToken: boolean
  hasRecord: boolean
  pathname?: string
}

const PREFIX = '[V-Moda Auth]'

const PROTECTED_PATTERNS = ['pocketbase', 'pb_auth', 'auth_token', 'token']
const STALE_PREFIXES = ['temp_', 'cache_', 'pending_', 'old_']

export function logAuthEvent(
  event: string,
  state: AuthStateLog,
  extras?: Record<string, unknown>,
): void {
  console.log(PREFIX, event, {
    ...state,
    ...extras,
    timestamp: new Date().toISOString(),
  })
}

export function isHardRefresh(): boolean {
  try {
    const entries = performance.getEntriesByType('navigation')
    if (entries.length > 0) {
      const nav = entries[0] as PerformanceNavigationTiming
      return nav.type === 'reload' || nav.type === 'navigate'
    }
  } catch {
    /* intentionally ignored */
  }
  return false
}

function isProtectedKey(key: string): boolean {
  const lower = key.toLowerCase()
  return PROTECTED_PATTERNS.some((p) => lower.includes(p))
}

function isStaleKey(key: string): boolean {
  return STALE_PREFIXES.some((p) => key.startsWith(p))
}

export function clearStaleAuthKeys(): void {
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || isProtectedKey(key)) continue
      if (isStaleKey(key)) toRemove.push(key)
    }
    toRemove.forEach((key) => localStorage.removeItem(key))
    if (toRemove.length > 0) {
      logAuthEvent(
        'clearStaleAuthKeys',
        {
          loading: true,
          isAuthenticated: false,
          isHydrating: true,
          hasToken: false,
          hasRecord: false,
        },
        { keysRemoved: toRemove },
      )
    }
  } catch (err) {
    console.warn(PREFIX, 'clearStaleAuthKeys error:', err)
  }
}

export function hasAuthInLocalStorage(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && isProtectedKey(key)) {
        const val = localStorage.getItem(key)
        if (val && val.length > 10) return true
      }
    }
  } catch {
    /* intentionally ignored */
  }
  return false
}
