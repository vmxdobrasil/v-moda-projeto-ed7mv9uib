import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import {
  logAuthEvent,
  isHardRefresh,
  clearStaleAuthKeys,
  hasAuthInLocalStorage,
} from '@/lib/auth-diagnostics'
import {
  hasActiveBackgroundOperations,
  onBackgroundOperationsChange,
} from '@/lib/background-operations'
import { refreshAuthToken, hasFatalAuthFailure, resetFatalAuthFailure } from '@/lib/token-refresh'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  isHydrating: boolean
  isRefreshing: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
  authError: string | null
  clearAuthError: () => void
  handleAuthFailure: (message?: string) => void
  refreshUser: () => Promise<void>
  hasBackgroundOperations: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

function isJwtExpired(): boolean {
  const token = pb.authStore.token
  if (!token) return true
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    let payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    while (payloadB64.length % 4) payloadB64 += '='
    const payload = JSON.parse(atob(payloadB64))
    if (!payload.exp) return false
    return payload.exp < Math.floor(Date.now() / 1000) - 5
  } catch {
    return true
  }
}

const MIN_REFRESH_INTERVAL_MS = 60_000
const BACKGROUND_REFRESH_INTERVAL_MS = 10 * 60_000

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const hasToken = !!pb.authStore.token
  const [user, setUser] = useState<any>(hasToken ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(hasToken)
  const [loading, setLoading] = useState(true)
  const [isHydrating, setIsHydrating] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [hasBackgroundOperations, setHasBackgroundOperations] = useState(false)
  const commitLockRef = useRef(false)
  const refreshInProgressRef = useRef(false)
  const isRefreshingRef = useRef(false)
  const lastRefreshRef = useRef<number>(0)
  const isInitializingRef = useRef<boolean>(true)
  const sessionClearedRef = useRef(false)
  const lastCommittedRef = useRef<{ auth: boolean; recordId: string | null; hydrating: boolean }>({
    auth: false,
    recordId: null,
    hydrating: true,
  })

  const commitAuthState = useCallback((authenticated: boolean, record: any, hydrating: boolean) => {
    if (commitLockRef.current) return
    const recordId = record?.id ?? null
    const last = lastCommittedRef.current
    if (last.auth === authenticated && last.recordId === recordId && last.hydrating === hydrating) {
      return
    }
    commitLockRef.current = true
    try {
      lastCommittedRef.current = { auth: authenticated, recordId, hydrating }
      setUser(authenticated ? record : null)
      setIsAuthenticated(authenticated)
      setIsHydrating(hydrating)
      useAuthStore.getState().syncState(authenticated ? record : null, authenticated, hydrating)
      logAuthEvent(
        'commitAuthState',
        {
          loading: false,
          isAuthenticated: authenticated,
          isHydrating: hydrating,
          hasToken: !!pb.authStore.token,
          hasRecord: !!record,
          pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
        },
        { userId: record?.id },
      )
    } finally {
      commitLockRef.current = false
    }
  }, [])

  /**
   * Clears the local session exactly once when the refresh token is permanently
   * dead (PocketBase returned 401/403 on auth-refresh). Subsequent calls are
   * no-ops so the app never enters a clear → redirect → refresh → clear loop.
   */
  const handleFatalAuthFailure = useCallback(() => {
    if (sessionClearedRef.current) return
    sessionClearedRef.current = true
    logAuthEvent(
      'fatal_auth_failure_clearing_session',
      {
        loading: false,
        isAuthenticated: false,
        isHydrating: false,
        hasToken: !!pb.authStore.token,
        hasRecord: !!pb.authStore.record,
        pathname: window.location.pathname,
      },
      { fatal: hasFatalAuthFailure() },
    )
    pb.authStore.clear()
    commitAuthState(false, null, false)
    if (!hasActiveBackgroundOperations()) {
      setAuthError('Sua sessão expirou. Por favor, faça login novamente.')
    }
  }, [commitAuthState])

  const silentRefresh = useCallback(async () => {
    if (refreshInProgressRef.current) return
    if (hasFatalAuthFailure()) return
    if (!pb.authStore.token || !pb.authStore.record) return

    const now = Date.now()
    if (now - lastRefreshRef.current < MIN_REFRESH_INTERVAL_MS) return

    if (hasActiveBackgroundOperations()) return

    refreshInProgressRef.current = true
    isRefreshingRef.current = true
    try {
      const success = await refreshAuthToken()
      lastRefreshRef.current = Date.now()
      if (success && pb.authStore.isValid && pb.authStore.record) {
        sessionClearedRef.current = false
        commitAuthState(true, pb.authStore.record, false)
      } else if (hasFatalAuthFailure()) {
        handleFatalAuthFailure()
      }
      // transient failure: keep the existing session optimistically
    } finally {
      refreshInProgressRef.current = false
      isRefreshingRef.current = false
    }
  }, [commitAuthState, handleFatalAuthFailure])

  useEffect(() => {
    let cancelled = false

    if (isHardRefresh()) {
      logAuthEvent('hard_refresh_detected', {
        loading: true,
        isAuthenticated: false,
        isHydrating: true,
        hasToken: !!pb.authStore.token,
        hasRecord: !!pb.authStore.record,
        pathname: window.location.pathname,
      })
      clearStaleAuthKeys()
    }

    logAuthEvent('useEffect_mount', {
      loading: true,
      isAuthenticated: hasToken,
      isHydrating: true,
      hasToken: !!pb.authStore.token,
      hasRecord: !!pb.authStore.record,
      pathname: window.location.pathname,
    })

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      if (cancelled) return
      if (!pb.authStore.token && !record) {
        if (isInitializingRef.current || refreshInProgressRef.current || isRefreshingRef.current) {
          logAuthEvent('authStore_change_skipped_during_init', {
            loading: true,
            isAuthenticated: false,
            isHydrating: true,
            hasToken: false,
            hasRecord: false,
            pathname: window.location.pathname,
          })
          return
        }
        if (hasActiveBackgroundOperations()) {
          logAuthEvent('authStore_change_skipped_background_op', {
            loading: false,
            isAuthenticated: true,
            isHydrating: false,
            hasToken: false,
            hasRecord: false,
            pathname: window.location.pathname,
          })
          return
        }
        logAuthEvent('authStore_change_cleared', {
          loading: false,
          isAuthenticated: false,
          isHydrating: false,
          hasToken: false,
          hasRecord: false,
          pathname: window.location.pathname,
        })
        sessionClearedRef.current = true
        commitAuthState(false, null, false)
      } else if (pb.authStore.token && record && pb.authStore.isValid) {
        if (!isInitializingRef.current && !refreshInProgressRef.current) {
          logAuthEvent('authStore_change_refreshed', {
            loading: false,
            isAuthenticated: true,
            isHydrating: false,
            hasToken: true,
            hasRecord: true,
            pathname: window.location.pathname,
          })
          sessionClearedRef.current = false
          commitAuthState(true, record, false)
        }
      }
    })

    const validateSession = async () => {
      if (!pb.authStore.token || !pb.authStore.record) {
        if (hasAuthInLocalStorage() && !pb.authStore.token) {
          logAuthEvent('validateSession_token_in_storage_not_store', {
            loading: true,
            isAuthenticated: false,
            isHydrating: true,
            hasToken: false,
            hasRecord: false,
            pathname: window.location.pathname,
          })
        }
        if (pb.authStore.record) pb.authStore.clear()
        if (cancelled) return
        isInitializingRef.current = false
        logAuthEvent('validateSession_no_token', {
          loading: false,
          isAuthenticated: false,
          isHydrating: false,
          hasToken: !!pb.authStore.token,
          hasRecord: !!pb.authStore.record,
          pathname: window.location.pathname,
        })
        sessionClearedRef.current = true
        commitAuthState(false, null, false)
        setLoading(false)
        return
      }

      const record = pb.authStore.record
      const jwtExpired = isJwtExpired()

      // If JWT is still valid, optimistically authenticate immediately
      // and refresh in the background — prevents login page flash on F5
      if (!jwtExpired) {
        logAuthEvent('validateSession_jwt_valid', {
          loading: false,
          isAuthenticated: true,
          isHydrating: false,
          hasToken: true,
          hasRecord: true,
          pathname: window.location.pathname,
        })
        commitAuthState(true, record, false)
        setLoading(false)

        try {
          const success = await refreshAuthToken()
          lastRefreshRef.current = Date.now()
          if (cancelled) return
          if (success && pb.authStore.isValid && pb.authStore.record) {
            sessionClearedRef.current = false
            commitAuthState(true, pb.authStore.record, false)
          } else if (hasFatalAuthFailure()) {
            handleFatalAuthFailure()
          }
          // transient refresh error & JWT still valid → retain the session
        } catch {
          // ignore — optimistic session retained
        }
        return
      }

      // JWT is expired — must refresh before rendering protected content
      logAuthEvent('validateSession_jwt_expired_refreshing', {
        loading: true,
        isAuthenticated: false,
        isHydrating: true,
        hasToken: true,
        hasRecord: true,
        pathname: window.location.pathname,
      })
      try {
        const success = await refreshAuthToken()
        lastRefreshRef.current = Date.now()
        if (cancelled) return
        if (success && pb.authStore.isValid && pb.authStore.record) {
          logAuthEvent('validateSession_refresh_success', {
            loading: false,
            isAuthenticated: true,
            isHydrating: false,
            hasToken: true,
            hasRecord: true,
            pathname: window.location.pathname,
          })
          sessionClearedRef.current = false
          commitAuthState(true, pb.authStore.record, false)
        } else {
          logAuthEvent('validateSession_refresh_failed', {
            loading: false,
            isAuthenticated: false,
            isHydrating: false,
            hasToken: !!pb.authStore.token,
            hasRecord: !!pb.authStore.record,
            pathname: window.location.pathname,
          })
          handleFatalAuthFailure()
        }
      } catch {
        if (cancelled) return
        // Unexpected error — treat as fatal to avoid loops
        handleFatalAuthFailure()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    validateSession().finally(() => {
      if (!cancelled) isInitializingRef.current = false
    })

    const refreshInterval = setInterval(() => {
      if (!cancelled && pb.authStore.token && !hasFatalAuthFailure()) {
        silentRefresh()
      }
    }, BACKGROUND_REFRESH_INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pb.authStore.token && !hasFatalAuthFailure()) {
        silentRefresh()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const handleOnline = () => {
      if (pb.authStore.token && !hasFatalAuthFailure()) {
        silentRefresh()
      }
    }
    window.addEventListener('online', handleOnline)

    return () => {
      cancelled = true
      unsubscribe()
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [commitAuthState, silentRefresh, handleFatalAuthFailure])

  useEffect(() => {
    const update = () => setHasBackgroundOperations(hasActiveBackgroundOperations())
    update()
    return onBackgroundOperationsChange(update)
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      setAuthError(null)
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
      })
      await pb.collection('users').authWithPassword(email, password)
      resetFatalAuthFailure()
      sessionClearedRef.current = false
      lastRefreshRef.current = Date.now()
      const record = pb.authStore.record
      commitAuthState(true, record, false)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setAuthError(null)
      await pb.collection('users').authWithPassword(email, password)
      // A fresh login always produces a brand-new refresh token, so clear any
      // previously recorded fatal failure and allow protected pages again.
      resetFatalAuthFailure()
      sessionClearedRef.current = false
      lastRefreshRef.current = Date.now()
      const record = pb.authStore.record
      logAuthEvent(
        'signIn_success',
        {
          loading: false,
          isAuthenticated: true,
          isHydrating: false,
          hasToken: !!pb.authStore.token,
          hasRecord: !!record,
          pathname: window.location.pathname,
        },
        { userId: record?.id },
      )
      commitAuthState(true, record, false)
      return { error: null }
    } catch (error) {
      logAuthEvent(
        'signIn_error',
        {
          loading: false,
          isAuthenticated: false,
          isHydrating: false,
          hasToken: false,
          hasRecord: false,
          pathname: window.location.pathname,
        },
        { error: (error as any)?.status },
      )
      return { error }
    }
  }

  const signOut = () => {
    logAuthEvent('signOut', {
      loading: false,
      isAuthenticated: false,
      isHydrating: false,
      hasToken: false,
      hasRecord: false,
      pathname: window.location.pathname,
    })
    pb.authStore.clear()
    sessionClearedRef.current = true
    commitAuthState(false, null, false)
    setAuthError(null)
  }

  const clearAuthError = () => setAuthError(null)

  const handleAuthFailure = (message?: string) => {
    if (hasActiveBackgroundOperations()) {
      logAuthEvent('handleAuthFailure_skipped_background_op', {
        loading: false,
        isAuthenticated: true,
        isHydrating: false,
        hasToken: !!pb.authStore.token,
        hasRecord: !!pb.authStore.record,
        pathname: window.location.pathname,
      })
      return
    }
    pb.authStore.clear()
    sessionClearedRef.current = true
    commitAuthState(false, null, false)
    setAuthError(message || 'Sua sessão expirou. Por favor, faça login novamente.')
  }

  const refreshUser = async () => {
    if (!pb.authStore.isValid || !pb.authStore.record) return
    try {
      const updated = await pb.collection('users').getOne(pb.authStore.record.id)
      commitAuthState(true, updated, false)
    } catch (err: any) {
      const status = err?.status ?? 0
      if (status === 401 || status === 403) {
        if (hasActiveBackgroundOperations()) return
        pb.authStore.clear()
        sessionClearedRef.current = true
        commitAuthState(false, null, false)
        setAuthError('Sua sessão expirou. Por favor, faça login novamente.')
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isHydrating,
        isRefreshing,
        signUp,
        signIn,
        signOut,
        loading,
        authError,
        clearAuthError,
        handleAuthFailure,
        refreshUser,
        hasBackgroundOperations,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
