import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import Index from '@/pages/Index'
import { Loader2 } from 'lucide-react'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'
import { getRoleBasedRedirect } from '@/lib/auth-redirects'

export function RootRoute() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
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
    return <Navigate to={getRoleBasedRedirect(user)} replace />
  }

  if (isAuthenticated && !user) {
    return <Navigate to="/login" replace />
  }

  return <Index />
}
