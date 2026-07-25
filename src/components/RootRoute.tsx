import { useAuth } from '@/hooks/use-auth'
import { Navigate, useLocation } from 'react-router-dom'
import Index from '@/pages/Index'
import { Loader2 } from 'lucide-react'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'
import { getRoleBasedRedirect, getIntendedRoute, setIntendedRoute } from '@/lib/auth-redirects'

export function RootRoute() {
  const { isAuthenticated, user, loading, isHydrating } = useAuth()
  const location = useLocation()

  if (loading || isHydrating) {
    setIntendedRoute(location.pathname + location.search)
    return (
      <div className="flex h-screen items-center justify-center bg-background animate-fade-transition">
        <div className="flex flex-col items-center gap-4">
          <img
            src={logoUrl}
            alt="V MODA Brasil"
            className="h-12 w-auto object-contain opacity-80"
          />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    const intended = getIntendedRoute()
    if (intended && intended !== '/') {
      return <Navigate to={intended} replace />
    }
    return <Navigate to={getRoleBasedRedirect(user)} replace />
  }

  if (isAuthenticated && !user) {
    return <Navigate to="/login" replace />
  }

  return <Index />
}
