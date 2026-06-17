import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function AuthGuard() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    if (location.pathname === '/login' || location.pathname === '/admin/login') {
      return <Outlet />
    }
    return <Navigate to="/login" state={{ from: location }} replace />
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
    if (location.pathname === '/admin/login' || location.pathname === '/login') {
      return <Outlet />
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />
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
    if (location.pathname === '/login' || location.pathname === '/admin/login') {
      return <Outlet />
    }
    return <Navigate to="/login" state={{ from: location }} replace />
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
