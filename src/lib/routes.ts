export const ROUTES = {
  home: '/',
  admin: '/admin',
  adminProdutos: '/admin/produtos',
  adminPedidos: '/admin/pedidos',
  adminUsuarios: '/admin/usuarios',
  adminRelatorios: '/admin/relatorios',
  crm: '/crm',
  explorar: '/explorar',
  perfil: '/perfil',
  login: '/login',
  produto: '/produto',
} as const

export const CRM_ROUTES = {
  dashboard: '/crm',
  leads: '/crm/leads',
  clientes: '/crm/clientes',
  funil: '/crm/funil',
  exportacoes: '/crm/exportacoes',
} as const

export function isValidRoute(path: string): boolean {
  if (typeof path !== 'string' || !path.startsWith('/')) return false
  return true
}

export type RouteName = keyof typeof ROUTES

export function buildProdutoRoute(id: string): string {
  return `/produto/${encodeURIComponent(id)}`
}

export type ProdutoRouteParams = {
  id?: string
  [key: string]: string | undefined
}

export interface NavegacaoState {
  rotaAtual: string
  historico: string[]
}
