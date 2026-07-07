import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen'
import { getRoleBasedRedirect, isSuperuserOrAdmin } from '@/lib/auth-redirects'

type GuardState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; from: string }
  | { status: 'authenticated'; user: any }

function useGuardBase(): GuardState {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return { status: 'loading' }
  if (!isAuthenticated) return { status: 'unauthenticated', from: location.pathname }
  return { status: 'authenticated', user }
}

function toLogin(from: string) {
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
  const { loading, isAuthenticated, user } = useAuth()
  if (loading) return <AuthLoadingScreen />
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
