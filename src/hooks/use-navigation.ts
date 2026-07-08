import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES, buildProdutoRoute } from '@/lib/routes'

export function useNavigation() {
  const navigate = useNavigate()

  const navegar = useCallback(
    (rota: string) => {
      navigate(rota)
    },
    [navigate],
  )

  const voltar = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const irParaRaiz = useCallback(() => {
    navigate(ROUTES.home)
  }, [navigate])

  const navegarParaProduto = useCallback(
    (id: string) => {
      navigate(buildProdutoRoute(id))
    },
    [navigate],
  )

  const navegarParaTab = useCallback(
    (tab: 'home' | 'explorar' | 'admin') => {
      const routeMap: Record<typeof tab, string> = {
        home: ROUTES.home,
        explorar: ROUTES.explorar,
        admin: ROUTES.admin,
      }
      navigate(routeMap[tab])
    },
    [navigate],
  )

  return { navegar, voltar, irParaRaiz, navegarParaProduto, navegarParaTab }
}
