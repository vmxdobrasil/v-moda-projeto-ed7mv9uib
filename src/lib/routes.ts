export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  perfil: '/perfil',
  explorar: '/explorar',
  cart: '/cart',
  catalog: '/colecoes',
  admin: '/admin',
  crm: '/crm',
  manufacturer: '/manufacturer',
  agente: '/agente',
  affiliates: '/affiliates',
  fashionista: '/fashionista',
  produto: '/produto',
  topMarcas: '/top-marcas',
  guiaCompras: '/guia-compras',
  guiaDeModa: '/guia-de-moda',
  conhecimento: '/conhecimento',
  revista: '/revista',
  sobreNos: '/sobre-nos',
  contato: '/contato',
  revenda: '/revenda',
  empreenda: '/empreenda',
  faq: '/faq',
  favoritos: '/favoritos',
  finalizarCompra: '/finalizar-compra',
  adminProdutos: '/admin/produtos',
  adminPedidos: '/admin/pedidos',
  adminUsuarios: '/admin/usuarios',
  adminRelatorios: '/admin/relatorios',
  adminLogin: '/admin/login',
} as const

export const CRM_ROUTES = {
  dashboard: '/crm',
  leads: '/crm/leads',
  pipeline: '/crm/pipeline',
  atividades: '/crm/atividades',
  tarefas: '/crm/tarefas',
  propostas: '/crm/propostas',
  relatorios: '/crm/relatorios',
  fundadores: '/crm/fundadores',
  admin: '/crm/admin',
} as const

export type RouteName = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteName]
export type CrmRouteName = keyof typeof CRM_ROUTES

const ALL_ROUTE_PATHS = new Set<string>([...Object.values(ROUTES), ...Object.values(CRM_ROUTES)])

export function buildProdutoRoute(id: string): string {
  return `/produto/${encodeURIComponent(id)}`
}

export function buildRoute(base: string, ...segments: string[]): string {
  return [base, ...segments.map(encodeURIComponent)].join('/')
}

export function isValidRoute(path: string): boolean {
  const normalized = path.split('?')[0].split('#')[0]
  if (ALL_ROUTE_PATHS.has(normalized)) return true
  return [...ALL_ROUTE_PATHS].some((route) => normalized.startsWith(route + '/'))
}

export function getRouteName(path: string): RouteName | null {
  const normalized = path.split('?')[0].split('#')[0]
  for (const [name, routePath] of Object.entries(ROUTES)) {
    if (normalized === routePath || normalized.startsWith(routePath + '/')) {
      return name as RouteName
    }
  }
  return null
}

export interface ProdutoRouteParams {
  id: string
}

export interface NavegacaoState {
  rotaAtual: string
  historico: string[]
}
