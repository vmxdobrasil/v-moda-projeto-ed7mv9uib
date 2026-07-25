import { ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen'

export function GlobalAuthGate({ children }: { children: ReactNode }) {
  const { loading, isHydrating } = useAuth()
  if (loading || isHydrating) {
    return <AuthLoadingScreen />
  }
  return <>{children}</>
}
