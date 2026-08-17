import { useState, useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import {
  hasActiveBackgroundOperations,
  onBackgroundOperationsChange,
} from '@/lib/background-operations'
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen'
import { getRoleBasedRedirect, isSuperuserOrAdmin, setIntendedRoute } from '@/lib/auth-redirects'
import { isPublicRoute } from '@/lib/public-routes'
import { waitForTokenRenewal, hasFatalAuthFailure } from '@/lib/token-refresh'
import { hasAuthInLocalStorage } from '@/lib/auth-diagnostics'

const GRACE_PERIOD_MS = 120_000

type GuardState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; from: string }
  | { status: 'authenticated'; user: any }

function useGuardBase(): GuardState {
  const { isAuthenticated, user, loading, isHydrating } = useAuth()
  const location = useLocation()
  const [bgOpsActive, setBgOpsActive] = useState(hasActiveBackgroundOperations())
  const [inGracePeriod, setInGracePeriod] = useState(false)
  const graceAttemptedRef = useRef(false)

  useEffect(() => {
    return onBackgroundOperationsChange(() => setBgOpsActive(hasActiveBackgroundOperations()))
  }, [])

  useEffect(() => {
    if (isPublicRoute(location.pathname)) return
    if (loading || isHydrating) return
    if (isAuthenticated) {
      setInGracePeriod(false)
      graceAttemptedRef.current = false
      return
    }
    if (bgOpsActive) return
    // If refresh is permanently dead (PocketBase already returned 401/403 on
    // auth-refresh) there is nothing to wait for — do NOT enter the grace
    // period, just let the guard redirect to /login immediately.
    if (hasFatalAuthFailure()) {
      setInGracePeriod(false)
      return
    }
    // Enter the grace period whenever there is ANY trace of an auth session —
    // either in the in-memory store (token + record) or persisted in
    // localStorage. The PocketBase SDK can briefly clear `authStore.record`
    // during a transient refresh failure; if the store is empty but the
    // session is still in localStorage, the grace period / token renewal can
    // restore it instead of bouncing the user to /login.
    const hasStoreAuth = !!(pb.authStore.token && pb.authStore.record)
    const hasLocalAuth = hasAuthInLocalStorage()
    if (!hasStoreAuth && !hasLocalAuth) return
    if (graceAttemptedRef.current) return

    graceAttemptedRef.current = true
    setInGracePeriod(true)

    waitForTokenRenewal(GRACE_PERIOD_MS).then(() => {
      setInGracePeriod(false)
    })
  }, [isAuthenticated, loading, isHydrating, bgOpsActive, location.pathname])

  if (isPublicRoute(location.pathname)) {
    return { status: 'authenticated', user }
  }

  if (loading || isHydrating) {
    setIntendedRoute(location.pathname + location.search)
    return { status: 'loading' }
  }

  if (!isAuthenticated && bgOpsActive) {
    return { status: 'loading' }
  }

  if (!isAuthenticated && inGracePeriod) {
    setIntendedRoute(location.pathname + location.search)
    return { status: 'loading' }
  }

  if (!isAuthenticated) {
    return { status: 'unauthenticated', from: location.pathname + location.search }
  }

  return { status: 'authenticated', user }
}

function toLogin(from: string) {
  setIntendedRoute(from)
  const redirectParam = `?redirect=${encodeURIComponent(from)}`
  return <Navigate to={`/login${redirectParam}`} state={{ from }} replace />
}

export function AuthGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  return <Outlet />
}

export function AdminGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  if (!isSuperuserOrAdmin(s.user)) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function ManufacturerGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok = s.user?.role === 'manufacturer' || isSuperuserOrAdmin(s.user)
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function CrmGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok =
    isSuperuserOrAdmin(s.user) ||
    s.user?.manufacturer_role === 'manager' ||
    s.user?.brand_role === 'manager'
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function RetailerGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok = s.user?.role === 'retailer' || isSuperuserOrAdmin(s.user)
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function AgentGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok = s.user?.role === 'agent' || isSuperuserOrAdmin(s.user)
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function AgentOrTransporterGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok =
    s.user?.role === 'agent' ||
    s.user?.role === 'retailer' ||
    s.user?.is_transporter === true ||
    isSuperuserOrAdmin(s.user)
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function MasterAdminGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  if (!isSuperuserOrAdmin(s.user)) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function PublicRoute() {
  const { loading, isHydrating, isAuthenticated, user } = useAuth()
  const [bgOpsActive, setBgOpsActive] = useState(hasActiveBackgroundOperations())

  useEffect(() => {
    return onBackgroundOperationsChange(() => setBgOpsActive(hasActiveBackgroundOperations()))
  }, [])

  if (loading || isHydrating) return <AuthLoadingScreen />
  if (bgOpsActive && !isAuthenticated) return <AuthLoadingScreen />
  if (isAuthenticated && user) return <Navigate to={getRoleBasedRedirect(user)} replace />
  return <Outlet />
}

export function FinancialGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok =
    isSuperuserOrAdmin(s.user) ||
    s.user?.role === 'manufacturer' ||
    s.user?.role === 'retailer' ||
    s.user?.role === 'agent'
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}
