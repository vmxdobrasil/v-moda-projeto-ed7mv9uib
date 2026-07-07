import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen'
import { getRoleBasedRedirect, isSuperuserOrAdmin } from '@/lib/auth-redirects'
import pb from '@/lib/pocketbase/client'

function useAuthGuardState() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return { status: 'loading' as const }

  if (!isAuthenticated || !user) {
    if (pb.authStore.isValid && pb.authStore.record) {
      return { status: 'loading' as const }
    }
    return {
      status: 'unauthenticated' as const,
      loginState: { from: location.pathname },
    }
  }

  return { status: 'authenticated' as const, user }
}

export function AuthGuard() {
  const state = useAuthGuardState()
  if (state.status === 'loading') return <AuthLoadingScreen />
  if (state.status === 'unauthenticated') {
    return <Navigate to="/login" state={state.loginState} replace />
  }
  return <Outlet />
}

export function AdminGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (!isAuthenticated || !user) {
    if (pb.authStore.isValid && pb.authStore.record) return <AuthLoadingScreen />
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!isSuperuserOrAdmin(user)) return <Navigate to={getRoleBasedRedirect(user)} replace />

  return <Outlet />
}

export function ManufacturerGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (!isAuthenticated || !user) {
    if (pb.authStore.isValid && pb.authStore.record) return <AuthLoadingScreen />
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const isManufacturer = user?.role === 'manufacturer' || isSuperuserOrAdmin(user)

  if (!isManufacturer) return <Navigate to={getRoleBasedRedirect(user)} replace />

  return <Outlet />
}

export function CrmGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (!isAuthenticated || !user) {
    if (pb.authStore.isValid && pb.authStore.record) return <AuthLoadingScreen />
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const hasAccess =
    isSuperuserOrAdmin(user) ||
    user?.manufacturer_role === 'manager' ||
    user?.brand_role === 'manager'

  if (!hasAccess) return <Navigate to={getRoleBasedRedirect(user)} replace />

  return <Outlet />
}

export function RetailerGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (!isAuthenticated || !user) {
    if (pb.authStore.isValid && pb.authStore.record) return <AuthLoadingScreen />
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const isRetailer = user?.role === 'retailer' || isSuperuserOrAdmin(user)

  if (!isRetailer) return <Navigate to={getRoleBasedRedirect(user)} replace />

  return <Outlet />
}

export function AgentGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (!isAuthenticated || !user) {
    if (pb.authStore.isValid && pb.authStore.record) return <AuthLoadingScreen />
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const isAgent = user?.role === 'agent' || isSuperuserOrAdmin(user)

  if (!isAgent) return <Navigate to={getRoleBasedRedirect(user)} replace />

  return <Outlet />
}

export function AgentOrTransporterGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (!isAuthenticated || !user) {
    if (pb.authStore.isValid && pb.authStore.record) return <AuthLoadingScreen />
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const hasAccess =
    user?.role === 'agent' ||
    user?.role === 'retailer' ||
    user?.is_transporter === true ||
    isSuperuserOrAdmin(user)

  if (!hasAccess) return <Navigate to={getRoleBasedRedirect(user)} replace />

  return <Outlet />
}

export function MasterAdminGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (!isAuthenticated || !user) {
    if (pb.authStore.isValid && pb.authStore.record) return <AuthLoadingScreen />
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!isSuperuserOrAdmin(user)) return <Navigate to={getRoleBasedRedirect(user)} replace />

  return <Outlet />
}

export function PublicRoute() {
  const { loading, isAuthenticated, user } = useAuth()

  if (loading) return <AuthLoadingScreen />

  if (isAuthenticated && user) {
    return <Navigate to={getRoleBasedRedirect(user)} replace />
  }

  return <Outlet />
}

export function FinancialGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (!isAuthenticated || !user) {
    if (pb.authStore.isValid && pb.authStore.record) return <AuthLoadingScreen />
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const hasFinancialAccess =
    isSuperuserOrAdmin(user) ||
    user?.role === 'manufacturer' ||
    user?.role === 'retailer' ||
    user?.role === 'agent'

  if (!hasFinancialAccess) return <Navigate to={getRoleBasedRedirect(user)} replace />

  return <Outlet />
}
