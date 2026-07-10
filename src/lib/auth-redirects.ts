export function setIntendedRoute(path: string): void {
  if (path && path !== '/login' && path !== '/signup' && path !== '/admin/login') {
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

export function getRoleBasedRedirect(user: any): string {
  if (!user) return '/login'

  if (user?.collectionName === '_superusers') return '/AdminMaster'
  if (user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com') return '/AdminMaster'
  if (user?.role === 'manufacturer') return '/manufacturer'
  if (user?.role === 'retailer') return '/customers'
  if (user?.role === 'agent') return '/Agente Credenciado'
  if (user?.role === 'fashionista') return '/fashionista'
  if (user?.role === 'affiliate') return '/affiliates'
  if (user?.is_transporter === true) return '/logistica-transportadoras'

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
