import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

export function AuthGuard() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse">Verificando sessão...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function ProtectedRoute({ allowedRoles = [] }: { allowedRoles?: string[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse">Verificando permissões...</p>
      </div>
    )
  }

  if (!user) {
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
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
      </div>
    )
  }

  if (user) {
    // If we have a stored location to return to, go there (unless it's a login page or root)
    const from = location.state?.from?.pathname
    if (from && !['/login', '/admin/login', '/cadastro', '/'].includes(from)) {
      return <Navigate to={from} replace />
    }

    // Automatically redirect all authenticated users to root as per requirements
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
