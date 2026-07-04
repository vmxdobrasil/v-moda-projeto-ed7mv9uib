export function getRoleBasedRedirect(user: any): string {
  if (!user) return '/login'

  if (user?.collectionName === '_superusers') return '/admin/master'
  if (user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com') return '/admin/master'
  if (user?.role === 'manufacturer') return '/manufacturer'
  if (user?.role === 'retailer') return '/dashboard'
  if (user?.role === 'agent') return '/agente'
  if (user?.role === 'fashionista') return '/fashionista'
  if (user?.role === 'affiliate') return '/affiliates'
  if (user?.is_transporter === true) return '/logistica-transportadoras'

  return '/dashboard'
}

export function isSuperuserOrAdmin(user: any): boolean {
  return (
    user?.collectionName === '_superusers' ||
    user?.role === 'admin' ||
    user?.email === 'valterpmendonca@gmail.com'
  )
}
