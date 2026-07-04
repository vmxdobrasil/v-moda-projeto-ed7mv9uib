export function getRoleBasedRedirect(user: any): string {
  if (!user) return '/login'

  if (user?.collectionName === '_superusers') return '/admin/dashboard'
  if (user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com')
    return '/admin/dashboard'
  if (user?.role === 'manufacturer') return '/fabricantes'
  if (user?.role === 'retailer') return '/lojistas'
  if (user?.role === 'agent') return '/agentes'
  if (user?.role === 'fashionista') return '/fashionista'
  if (user?.role === 'affiliate') return '/revenda'
  if (user?.is_transporter === true) return '/logistica-transportadoras'

  return '/lojistas'
}

export function isSuperuserOrAdmin(user: any): boolean {
  return (
    user?.collectionName === '_superusers' ||
    user?.role === 'admin' ||
    user?.email === 'valterpmendonca@gmail.com'
  )
}
