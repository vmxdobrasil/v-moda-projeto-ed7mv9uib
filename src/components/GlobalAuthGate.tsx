import { ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen'

export function GlobalAuthGate({ children }: { children: ReactNode }) {
  const { loading, isHydrating, isRefreshing } = useAuth()
  if (loading || isHydrating || isRefreshing) {
    return <AuthLoadingScreen />
  }
  return <>{children}</>
}
