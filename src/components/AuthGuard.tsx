import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function AuthGuard() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}

export function AdminGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  const isAdmin = user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function ManufacturerGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const isManufacturer =
    user?.role === 'manufacturer' ||
    user?.email === 'valterpmendonca@gmail.com' ||
    user?.role === 'admin'

  if (!isManufacturer) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function CrmGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const hasAccess =
    user?.role === 'admin' ||
    user?.email === 'valterpmendonca@gmail.com' ||
    user?.manufacturer_role === 'manager' ||
    user?.brand_role === 'manager'

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function RetailerGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const isRetailer =
    user?.role === 'retailer' ||
    user?.email === 'valterpmendonca@gmail.com' ||
    user?.role === 'admin'

  if (!isRetailer) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function AgentGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const isAgent =
    user?.role === 'agent' || user?.email === 'valterpmendonca@gmail.com' || user?.role === 'admin'

  if (!isAgent) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function AgentOrTransporterGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const hasAccess =
    user?.role === 'agent' ||
    user?.role === 'retailer' ||
    user?.is_transporter === true ||
    user?.email === 'valterpmendonca@gmail.com' ||
    user?.role === 'admin'

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (isAuthenticated) {
    if (location.pathname === '/admin/login') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
