import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { Loader2 } from 'lucide-react'

export function AuthGuard() {
  const { isAuthenticated, isInitialized } = useAuthStore()
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function ProtectedRoute({ allowedRoles = [] }: { allowedRoles?: string[] }) {
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admin bypass for all protected routes
  if (user?.email === 'valterpmendonca@gmail.com' || user?.role === 'admin') {
    return <Outlet />
  }

  // If there are roles specified and the user doesn't have one of them
  if (allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    // If we have a stored location to return to, go there (unless it's a login page or root)
    const from = location.state?.from?.pathname
    if (from && !['/login', '/admin/login', '/cadastro', '/'].includes(from)) {
      return <Navigate to={from} replace />
    }

    // Automatically redirect authenticated users to dashboard if they are admins/manufacturers/affiliates
    if (
      user?.email === 'valterpmendonca@gmail.com' ||
      user?.role === 'admin' ||
      user?.role === 'manufacturer' ||
      user?.role === 'affiliate'
    ) {
      return <Navigate to="/dashboard" replace />
    }

    return <Navigate to="/perfil" replace />
  }

  return <Outlet />
}
