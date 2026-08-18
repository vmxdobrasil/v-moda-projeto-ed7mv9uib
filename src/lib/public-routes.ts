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
  '/orders/view/:id',
  '/cart',
  '/top-marcas',
  '/guia-compras',
  '/explorar',
  '/produto/:id',
  '/fashionista/login',
  '/fashionista/signup',
  '/marketing',
] as const

export const PUBLIC_PREFIXES = ['/assets', '/api/'] as const

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number])) return true
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return true
  }
  return false
}
