export function setIntendedRoute(path: string): void {
  if (
    path &&
    path !== '/login' &&
    path !== '/signup' &&
    path !== '/admin/login' &&
    path !== '/fashionista/login' &&
    path !== '/fashionista/signup'
  ) {
    sessionStorage.setItem('auth_intended_route', path)
  }
}

export function getIntendedRoute(): string | null {
  const route = sessionStorage.getItem('auth_intended_route')
  if (route) {
    sessionStorage.removeItem('auth_intended_route')
    return route
  }
  return null
}

import pb from '@/lib/pocketbase/client'

function resolveEffectiveUser(user: any): any {
  if (user) return user

  // Fallback 1: pb.authStore.record
  if (pb?.authStore?.record) {
    return pb.authStore.record
  }

  // Fallback 2: localStorage ('pocketbase_auth')
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('pocketbase_auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.record) {
          return parsed.record
        }
      }
    } catch {
      /* best-effort */
    }
  }

  return null
}

export function getRoleBasedRedirect(user: any): string {
  const effectiveUser = resolveEffectiveUser(user)
  if (!effectiveUser) return '/login'

  if (effectiveUser?.collectionName === '_superusers') return '/AdminMaster'
  if (effectiveUser?.role === 'admin' || effectiveUser?.email === 'valterpmendonca@gmail.com')
    return '/AdminMaster'
  if (effectiveUser?.role === 'manufacturer') return '/manufacturer'
  if (effectiveUser?.role === 'retailer') return '/customers'
  if (effectiveUser?.role === 'agent') return '/agente-credenciado'
  if (effectiveUser?.role === 'fashionista') return '/fashionista'
  if (effectiveUser?.role === 'affiliate') return '/affiliates'
  if (effectiveUser?.is_transporter === true) return '/logistica-transportadoras'

  return '/customers'
}

export function isSuperuserOrAdmin(user: any): boolean {
  return (
    user?.collectionName === '_superusers' ||
    user?.role === 'admin' ||
    user?.email === 'valterpmendonca@gmail.com'
  )
}

export function isManufacturer(user: any): boolean {
  return user?.role === 'manufacturer' || isSuperuserOrAdmin(user)
}

export function isRetailer(user: any): boolean {
  return user?.role === 'retailer' || isSuperuserOrAdmin(user)
}

export function isAgent(user: any): boolean {
  return user?.role === 'agent' || isSuperuserOrAdmin(user)
}
