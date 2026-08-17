import { useEffect, useRef, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ensureValidToken, hasFatalAuthFailure } from '@/lib/token-refresh'
import { hasActiveBackgroundOperations } from '@/lib/background-operations'

/**
 * Top-level gate that makes sure the JWT is still valid (refreshing it once in
 * the background if it is about to expire) before the protected app runs.
 *
 * It guards against two race conditions:
 *  1. Multiple components mounting at once and each calling ensureValidToken()
 *     — refreshAuthToken() already serialises via a module-level lock, but we
 *     also keep a local in-flight ref so the effect itself is idempotent.
 *  2. Hammering auth-refresh after a permanent 401 — once hasFatalAuthFailure()
 *     is set we stop attempting refreshes entirely; the AuthProvider will have
 *     already cleared the session and the AuthGuard will redirect to /login
 *     exactly once.
 */
export function GlobalAuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const inFlightRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || loading) return
    if (hasActiveBackgroundOperations()) return
    if (hasFatalAuthFailure()) return
    if (inFlightRef.current) return

    inFlightRef.current = true
    ensureValidToken()
      .catch(() => {})
      .finally(() => {
        inFlightRef.current = false
      })
  }, [isAuthenticated, loading])

  return <>{children}</>
}
