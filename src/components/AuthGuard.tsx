import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen'
import { getRoleBasedRedirect, isSuperuserOrAdmin, setIntendedRoute } from '@/lib/auth-redirects'
import { logAuthEvent } from '@/lib/auth-diagnostics'
import pb from '@/lib/pocketbase/client'

type GuardState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; from: string }
  | { status: 'authenticated'; user: any }

function useGuardBase(): GuardState {
  const { isAuthenticated, user, loading, isHydrating } = useAuth()
  const location = useLocation()

  if (loading || isHydrating) {
    logAuthEvent('guard_loading', {
      loading,
      isAuthenticated,
      isHydrating,
      hasToken: !!pb.authStore.token,
      hasRecord: !!user,
      pathname: location.pathname,
    })
    setIntendedRoute(location.pathname + location.search)
    return { status: 'loading' }
  }

  if (!isAuthenticated) {
    logAuthEvent(
      'guard_redirect_to_login',
      {
        loading: false,
        isAuthenticated: false,
        isHydrating: false,
        hasToken: false,
        hasRecord: !!user,
        pathname: location.pathname,
      },
      { from: location.pathname + location.search },
    )
    return { status: 'unauthenticated', from: location.pathname + location.search }
  }

  logAuthEvent(
    'guard_authenticated',
    {
      loading: false,
      isAuthenticated: true,
      isHydrating: false,
      hasToken: true,
      hasRecord: !!user,
      pathname: location.pathname,
    },
    { role: user?.role, userId: user?.id },
  )
  return { status: 'authenticated', user }
}

function toLogin(from: string) {
  setIntendedRoute(from)
  return <Navigate to="/login" state={{ from }} replace />
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
  if (loading || isHydrating) return <AuthLoadingScreen />
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
