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

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  isHydrating: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
  authError: string | null
  clearAuthError: () => void
  handleAuthFailure: (message?: string) => void
  refreshUser: () => Promise<void>
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
    return false
  }
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: any
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err
      if (err?.status === 401 || err?.status === 403) {
        throw err
      }
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}

const MIN_REFRESH_INTERVAL_MS = 60_000
const BACKGROUND_REFRESH_INTERVAL_MS = 10 * 60_000

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const hasToken = !!pb.authStore.token
  const [user, setUser] = useState<any>(hasToken ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(hasToken)
  const [loading, setLoading] = useState(true)
  const [isHydrating, setIsHydrating] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const commitLockRef = useRef(false)
  const refreshInProgressRef = useRef(false)
  const lastRefreshRef = useRef<number>(0)

  const commitAuthState = useCallback((authenticated: boolean, record: any, hydrating: boolean) => {
    if (commitLockRef.current) return
    commitLockRef.current = true
    try {
      setUser(authenticated ? record : null)
      setIsAuthenticated(authenticated)
      setIsHydrating(hydrating)
      useAuthStore.getState().syncState(authenticated ? record : null, authenticated, hydrating)
    } finally {
      commitLockRef.current = false
    }
  }, [])

  const silentRefresh = useCallback(async () => {
    if (refreshInProgressRef.current) return
    if (!pb.authStore.token || !pb.authStore.record) return

    const now = Date.now()
    if (now - lastRefreshRef.current < MIN_REFRESH_INTERVAL_MS) return

    refreshInProgressRef.current = true
    try {
      const record = pb.authStore.record
      const collectionName = record?.collectionName || 'users'
      await retryWithBackoff(() => pb.collection(collectionName).authRefresh(), 2, 1500)
      lastRefreshRef.current = Date.now()
      if (pb.authStore.isValid && pb.authStore.record) {
        commitAuthState(true, pb.authStore.record, false)
      }
    } catch (err: any) {
      const status = err?.status ?? 0
      if (status === 401 || status === 403) {
        pb.authStore.clear()
        commitAuthState(false, null, false)
        setAuthError('Sua sessão expirou. Por favor, faça login novamente.')
      }
      // All other errors (500, 503, network timeouts) — retain current session
    } finally {
      refreshInProgressRef.current = false
    }
  }, [commitAuthState])

  useEffect(() => {
    let cancelled = false

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      if (cancelled) return
      if (!pb.authStore.token && !record) {
        commitAuthState(false, null, false)
      }
    })

    const validateSession = async () => {
      if (!pb.authStore.token || !pb.authStore.record) {
        if (pb.authStore.record) pb.authStore.clear()
        if (cancelled) return
        commitAuthState(false, null, false)
        setLoading(false)
        return
      }

      const record = pb.authStore.record
      const collectionName = record?.collectionName || 'users'
      const jwtExpired = isJwtExpired()

      // If JWT is still valid, optimistically authenticate immediately
      // and refresh in the background — prevents login page flash on F5
      if (!jwtExpired) {
        commitAuthState(true, record, false)
        setLoading(false)

        try {
          await retryWithBackoff(() => pb.collection(collectionName).authRefresh(), 1, 1500)
          lastRefreshRef.current = Date.now()
          if (cancelled) return
          if (pb.authStore.isValid && pb.authStore.record) {
            commitAuthState(true, pb.authStore.record, false)
          }
        } catch (err: any) {
          if (cancelled) return
          const status = err?.status ?? 0
          if (status === 401 || status === 403) {
            pb.authStore.clear()
            commitAuthState(false, null, false)
            setAuthError('Sua sessão expirou. Por favor, faça login novamente.')
          }
          // Network error — retain the still-valid session
        }
        return
      }

      // JWT is expired — must refresh before rendering protected content
      try {
        await retryWithBackoff(() => pb.collection(collectionName).authRefresh())
        lastRefreshRef.current = Date.now()
        if (cancelled) return
        const isValid = pb.authStore.isValid && !!pb.authStore.record
        if (isValid) {
          commitAuthState(true, pb.authStore.record, false)
        } else {
          pb.authStore.clear()
          commitAuthState(false, null, false)
        }
      } catch (err: any) {
        if (cancelled) return
        const status = err?.status ?? 0
        if (status === 401 || status === 403) {
          pb.authStore.clear()
          commitAuthState(false, null, false)
          setAuthError('Sua sessão expirou. Por favor, faça login novamente.')
        } else {
          // Network error with expired JWT — keep session optimistically;
          // the next API call will handle 401 if the token is truly invalid
          commitAuthState(true, record, false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    validateSession()

    const refreshInterval = setInterval(() => {
      if (!cancelled && pb.authStore.token) {
        silentRefresh()
      }
    }, BACKGROUND_REFRESH_INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pb.authStore.token) {
        silentRefresh()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const handleOnline = () => {
      if (pb.authStore.token) {
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
  }, [commitAuthState, silentRefresh])

  const signUp = async (email: string, password: string) => {
    try {
      setAuthError(null)
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
      })
      await pb.collection('users').authWithPassword(email, password)
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
      lastRefreshRef.current = Date.now()
      const record = pb.authStore.record
      commitAuthState(true, record, false)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
    commitAuthState(false, null, false)
    setAuthError(null)
  }

  const clearAuthError = () => setAuthError(null)

  const handleAuthFailure = (message?: string) => {
    pb.authStore.clear()
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
        pb.authStore.clear()
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
        signUp,
        signIn,
        signOut,
        loading,
        authError,
        clearAuthError,
        handleAuthFailure,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
