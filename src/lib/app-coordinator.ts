import { ROUTES, CRM_ROUTES, type RouteName, isValidRoute } from './routes'

interface NavigationState {
  rotaAtual: string
  historico: string[]
  podeVoltar: boolean
}

type NavigationListener = (state: NavigationState) => void
type NavigateFn = (path: string) => void
type BackFn = () => void

class AppCoordinator {
  private state: NavigationState = {
    rotaAtual: ROUTES.home,
    historico: [],
    podeVoltar: false,
  }
  private listeners = new Set<NavigationListener>()
  private navigateFn: NavigateFn | null = null
  private backFn: BackFn | null = null

  registrarNavegadores(navigate: NavigateFn, back: BackFn): void {
    this.navigateFn = navigate
    this.backFn = back
  }

  navegar(path: string): void {
    if (!this.validarCaminho(path)) return
    this.state = {
      rotaAtual: path,
      historico: [...this.state.historico, this.state.rotaAtual],
      podeVoltar: true,
    }
    this.navigateFn?.(path)
    this.notificar()
  }

  navegarPorNome(name: RouteName): void {
    const path = ROUTES[name]
    if (path) this.navegar(path)
  }

  voltar(): void {
    if (!this.state.podeVoltar || !this.backFn) return
    this.backFn()
    const historico = [...this.state.historico]
    const anterior = historico.pop() || ROUTES.home
    this.state = {
      rotaAtual: anterior,
      historico,
      podeVoltar: historico.length > 0,
    }
    this.notificar()
  }

  irParaRaiz(): void {
    this.state = {
      rotaAtual: ROUTES.home,
      historico: [],
      podeVoltar: false,
    }
    this.navigateFn?.(ROUTES.home)
    this.notificar()
  }

  irParaCrm(): void {
    this.navegar(ROUTES.crm)
  }

  navegarCrmSubRota(subRota: keyof typeof CRM_ROUTES): void {
    const path = CRM_ROUTES[subRota]
    if (path) this.navegar(path)
  }

  obterState(): NavigationState {
    return { ...this.state }
  }

  inscrever(listener: NavigationListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private validarCaminho(path: string): boolean {
    if (typeof path !== 'string' || !path.startsWith('/')) return false
    return isValidRoute(path)
  }

  private notificar(): void {
    this.listeners.forEach((listener) => listener(this.obterState()))
  }
}

export const appCoordinator = new AppCoordinator()
export type { NavigationState }
