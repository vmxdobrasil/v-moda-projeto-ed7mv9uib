interface AuthDiagnosticEntry {
  timestamp: string
  event: string
  loading: boolean
  isAuthenticated: boolean
  isHydrating: boolean
  hasToken: boolean
  hasRecord: boolean
  pathname?: string
  details?: Record<string, unknown>
}

const STORAGE_KEY = 'v_moda_auth_diagnostics'
const MAX_ENTRIES = 30

export function logAuthEvent(
  event: string,
  state: {
    loading?: boolean
    isAuthenticated?: boolean
    isHydrating?: boolean
    hasToken?: boolean
    hasRecord?: boolean
    pathname?: string
  },
  details?: Record<string, unknown>,
): void {
  const entry: AuthDiagnosticEntry = {
    timestamp: new Date().toISOString(),
    event,
    loading: state.loading ?? false,
    isAuthenticated: state.isAuthenticated ?? false,
    isHydrating: state.isHydrating ?? false,
    hasToken: state.hasToken ?? false,
    hasRecord: state.hasRecord ?? false,
    pathname: state.pathname,
    details,
  }

  if (import.meta.env.DEV) {
    console.log(`[Auth] ${event}`, {
      loading: entry.loading,
      isAuthenticated: entry.isAuthenticated,
      isHydrating: entry.isHydrating,
      hasToken: entry.hasToken,
      hasRecord: entry.hasRecord,
      pathname: entry.pathname,
      ...details,
    })
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const logs: AuthDiagnosticEntry[] = raw ? JSON.parse(raw) : []
    logs.push(entry)
    if (logs.length > MAX_ENTRIES) logs.shift()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  } catch {
    // localStorage unavailable
  }
}

export function getAuthDiagnostics(): AuthDiagnosticEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearAuthDiagnostics(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function isHardRefresh(): boolean {
  try {
    const entries = performance.getEntriesByType('navigation')
    if (entries.length > 0) {
      return (entries[0] as PerformanceNavigationTiming).type === 'reload'
    }
  } catch {
    // Performance API unavailable
  }
  return false
}

export function clearStaleAuthKeys(): void {
  try {
    const raw = localStorage.getItem('pocketbase_auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (!parsed || !parsed.token || typeof parsed.token !== 'string') {
        localStorage.removeItem('pocketbase_auth')
      }
    }
  } catch {
    try {
      localStorage.removeItem('pocketbase_auth')
    } catch {
      // ignore
    }
  }
}
