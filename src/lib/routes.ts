export const ROUTES = {
  home: '/',
  admin: '/admin',
  adminProdutos: '/admin/produtos',
  adminPedidos: '/admin/pedidos',
  adminUsuarios: '/admin/usuarios',
  adminRelatorios: '/admin/relatorios',
  explorar: '/explorar',
  perfil: '/perfil',
  login: '/login',
  produto: '/produto',
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
