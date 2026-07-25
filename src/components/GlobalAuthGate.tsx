import { ReactNode, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen'
import {
  hasActiveBackgroundOperations,
  onBackgroundOperationsChange,
} from '@/lib/background-operations'
import pb from '@/lib/pocketbase/client'

export function GlobalAuthGate({ children }: { children: ReactNode }) {
  const { loading, isHydrating } = useAuth()
  const [bgOpsActive, setBgOpsActive] = useState(hasActiveBackgroundOperations())

  useEffect(() => {
    return onBackgroundOperationsChange(() => setBgOpsActive(hasActiveBackgroundOperations()))
  }, [])

  if ((loading || isHydrating) && !bgOpsActive) {
    return <AuthLoadingScreen />
  }

  if ((loading || isHydrating) && bgOpsActive && pb.authStore.isValid) {
    return <>{children}</>
  }

  if ((loading || isHydrating) && bgOpsActive) {
    return <AuthLoadingScreen />
  }

  return <>{children}</>
}
