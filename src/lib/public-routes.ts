export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/join/guide',
  '/join/influencer',
  '/join/agent',
  '/admin/login',
  '/colecoes',
  '/lojas-fabricantes',
  '/central-de-abastecimento',
  '/guia-de-moda',
  '/conhecimento',
  '/revista',
  '/sobre-nos',
  '/contato',
  '/empreenda',
  '/faq',
  '/favoritos',
  '/finalizar-compra',
  '/cart',
  '/top-marcas',
  '/guia-compras',
  '/explorar',
  '/fashionista/login',
  '/fashionista/signup',
  '/marketing',
  '/colunas/holofote',
] as const

export const PUBLIC_PREFIXES = ['/assets', '/api/'] as const

export const PUBLIC_AUTH_ROUTES = [
  '/login',
  '/signup',
  '/join/guide',
  '/join/influencer',
  '/join/agent',
  '/admin/login',
  '/fashionista/login',
  '/fashionista/signup',
] as const

/**
 * Normaliza um caminho para comparação de rotas:
 * - Remove query string (?foo=bar) e hash (#section)
 * - Converte para minúsculas
 * - Remove barras duplicadas
 * - Remove trailing slash (/guia-de-moda/ => /guia-de-moda, exceto a raiz '/')
 */
export function normalizePath(path: string | null | undefined): string {
  if (!path || typeof path !== 'string') return '/'
  let clean = path.trim().split('?')[0].split('#')[0]
  clean = clean.replace(/\/+/g, '/')
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1)
  }
  return clean.toLowerCase() || '/'
}

export function isPublicAuthRoute(pathname: string): boolean {
  const norm = normalizePath(pathname)
  return PUBLIC_AUTH_ROUTES.includes(norm as (typeof PUBLIC_AUTH_ROUTES)[number])
}

export function isPublicRoute(pathname: string): boolean {
  const norm = normalizePath(pathname)
  if (PUBLIC_ROUTES.includes(norm as (typeof PUBLIC_ROUTES)[number])) return true
  if (norm.startsWith('/colunas/')) return true
  if (norm.startsWith('/produto/')) return true
  if (norm.startsWith('/orders/view/')) return true
  if (norm.startsWith('/marcas/')) return true
  for (const prefix of PUBLIC_PREFIXES) {
    if (norm.startsWith(prefix)) return true
  }
  return false
}

/**
 * Retorna se a rota é uma rota pública de navegação livre (ou seja,
 * conteúdo público acessível sem login e que NUNCA deve ser gravada
 * como intended_route para redirecionamento após autenticação).
 */
export function isFreePublicContentRoute(pathname: string): boolean {
  const norm = normalizePath(pathname)
  if (isPublicAuthRoute(norm)) return false
  return isPublicRoute(norm)
}
