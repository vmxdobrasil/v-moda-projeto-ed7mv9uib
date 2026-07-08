import { useAuth } from '@/hooks/use-auth'
import { Navigate, useLocation } from 'react-router-dom'
import Index from '@/pages/Index'
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen'
import { getRoleBasedRedirect, getIntendedRoute, setIntendedRoute } from '@/lib/auth-redirects'
import { logAuthEvent } from '@/lib/auth-diagnostics'
import pb from '@/lib/pocketbase/client'

export function RootRoute() {
  const { isAuthenticated, user, loading, isHydrating } = useAuth()
  const location = useLocation()

  logAuthEvent(
    'RootRoute_render',
    {
      loading,
      isAuthenticated,
      isHydrating,
      hasToken: !!pb.authStore.token,
      hasRecord: !!user,
      pathname: location.pathname,
    },
    { role: user?.role },
  )

  if (loading || isHydrating) {
    setIntendedRoute(location.pathname + location.search)
    return <AuthLoadingScreen />
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
