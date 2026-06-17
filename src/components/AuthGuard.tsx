import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function AuthGuard() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function AdminGuard() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const isAdmin = user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function ManufacturerGuard() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
