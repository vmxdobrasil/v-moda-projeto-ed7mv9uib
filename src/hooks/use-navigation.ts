import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES, CRM_ROUTES, buildProdutoRoute, type RouteName } from '@/lib/routes'
import { appCoordinator, type NavigationState } from '@/lib/app-coordinator'

type TabName = 'home' | 'explorar' | 'admin' | 'crm'

export function useNavigation() {
  const navigate = useNavigate()
  const [state, setState] = useState<NavigationState>(appCoordinator.obterState())

  useEffect(() => {
    appCoordinator.registrarNavegadores(
      (path: string) => navigate(path),
      () => navigate(-1),
    )
    const unsub = appCoordinator.inscrever(setState)
    return () => unsub()
  }, [navigate])

  const navegar = useCallback((rota: string) => {
    appCoordinator.navegar(rota)
  }, [])

  const voltar = useCallback(() => {
    appCoordinator.voltar()
  }, [])

  const irParaRaiz = useCallback(() => {
    appCoordinator.irParaRaiz()
  }, [])

  const navegarParaProduto = useCallback((id: string) => {
    appCoordinator.navegar(buildProdutoRoute(id))
  }, [])

  const navegarParaTab = useCallback((tab: TabName) => {
    const routeMap: Record<TabName, string> = {
      home: ROUTES.home,
      explorar: ROUTES.explorar,
      admin: ROUTES.admin,
      crm: ROUTES.crm,
    }
    appCoordinator.navegar(routeMap[tab])
  }, [])

  const navegarParaCrm = useCallback((subRota?: keyof typeof CRM_ROUTES) => {
    if (subRota) {
      appCoordinator.navegarCrmSubRota(subRota)
    } else {
      appCoordinator.irParaCrm()
    }
  }, [])

  const navegarPorNome = useCallback((name: RouteName) => {
    appCoordinator.navegarPorNome(name)
  }, [])

  return {
    ...state,
    navegar,
    voltar,
    irParaRaiz,
    navegarParaProduto,
    navegarParaTab,
    navegarParaCrm,
    navegarPorNome,
  }
}
