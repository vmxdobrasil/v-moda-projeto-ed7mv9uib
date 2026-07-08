export const ROUTES = {
  home: '/',
  admin: '/admin',
  explorar: '/explorar',
  perfil: '/perfil',
  login: '/login',
} as const

export type RouteName = keyof typeof ROUTES

export function buildProdutoRoute(id: string): string {
  return `/produto/${encodeURIComponent(id)}`
}

export interface ProdutoRouteParams {
  id: string
}

export interface NavegacaoState {
  rotaAtual: string
  historico: string[]
}
