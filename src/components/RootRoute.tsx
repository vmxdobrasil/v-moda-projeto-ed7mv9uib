import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import Index from '@/pages/Index'
import { Loader2 } from 'lucide-react'

export function RootRoute() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    if (user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com')
      return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'manufacturer') return <Navigate to="/manufacturer" replace />
    if (user?.role === 'agent') return <Navigate to="/agente" replace />
    if (user?.role === 'affiliate') return <Navigate to="/affiliates" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <Index />
}
