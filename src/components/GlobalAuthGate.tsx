import { useEffect, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ensureValidToken } from '@/lib/token-refresh'
import { hasActiveBackgroundOperations } from '@/lib/background-operations'

export function GlobalAuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || loading) return
    if (hasActiveBackgroundOperations()) return
    ensureValidToken().catch(() => {})
  }, [isAuthenticated, loading])

  return <>{children}</>
}
