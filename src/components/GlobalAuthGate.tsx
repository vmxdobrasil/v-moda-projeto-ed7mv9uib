import { useEffect, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ensureValidToken } from '@/lib/token-refresh'

export function GlobalAuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || loading) return
    ensureValidToken().catch(() => {})
  }, [isAuthenticated, loading])

  return <>{children}</>
}
