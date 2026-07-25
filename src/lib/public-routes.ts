export const PUBLIC_ROUTES = [
  '/',
  '/sobre',
  '/sobre-nos',
  '/contato',
  '/login',
  '/cadastro',
  '/signup',
  '/admin/login',
] as const

export const PUBLIC_PREFIXES = ['/assets', '/api/'] as const

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number])) return true
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return true
  }
  return false
}
