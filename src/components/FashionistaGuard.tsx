import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function FashionistaGuard() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/fashionista/login" state={{ from: location.pathname }} replace />
  }

  const isFashionista =
    user?.role === 'fashionista' ||
    user?.role === 'admin' ||
    user?.email === 'valterpmendonca@gmail.com'

  if (!isFashionista) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
