import { Link, useLocation } from 'react-router-dom'
import {
  Users,
  CreditCard,
  UserCheck,
  LayoutDashboard,
  ShoppingBag,
  Store,
  GraduationCap,
  Bot,
  MapPin,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar() {
  const { user } = useAuth()
  const location = useLocation()

  const isAdmin = user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'
  const isManufacturer = user?.role === 'manufacturer' || isAdmin
  const isAgent = user?.role === 'agent'
  const isAffiliate = user?.role === 'affiliate'
  const isRetailer = user?.role === 'retailer'

  const items = []

  if (isAdmin) {
    items.push(
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
      { title: 'Zonas de Revenda', url: '/admin/zonas', icon: MapPin },
      { title: 'Agentes Conveniados', url: '/admin/agentes', icon: UserCheck },
      { title: 'Afiliados', url: '/admin/afiliados', icon: Users },
      { title: 'V Club Card', url: '/admin/v-club', icon: CreditCard },
      { title: 'Produtos', url: '/admin/produtos', icon: ShoppingBag },
      { title: 'Fabricantes', url: '/admin/fabricantes', icon: Store },
    )
  } else if (isManufacturer) {
    items.push(
      { title: 'Dashboard', url: '/manufacturer', icon: LayoutDashboard },
      { title: 'Agentes Conveniados', url: '/agente', icon: UserCheck },
      { title: 'Afiliados', url: '/affiliates', icon: Users },
      { title: 'V Club Card', url: '/manufacturer/v-club', icon: CreditCard },
      { title: 'Catálogo', url: '/manufacturer/catalog', icon: ShoppingBag },
    )
  } else if (isRetailer) {
    items.push(
      { title: 'Meu Painel', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Painel Revenda', url: '/revenda', icon: Store },
      { title: 'Academy Fashion', url: '/academy', icon: GraduationCap },
      { title: 'Vallen Consultora', url: '/vallen-consultora', icon: Bot },
      { title: 'V Club Card', url: '/v-club', icon: CreditCard },
    )
  } else {
    items.push({ title: 'Meu Painel', url: '/dashboard', icon: LayoutDashboard })
    if (isAgent) {
      items.push({ title: 'Agentes Conveniados', url: '/agente', icon: UserCheck })
    }
    if (isAffiliate) {
      items.push({ title: 'Afiliados', url: '/affiliates', icon: Users })
    }
    items.push({ title: 'V Club Card', url: '/v-club', icon: CreditCard })
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== '/admin' &&
                    item.url !== '/manufacturer' &&
                    item.url !== '/dashboard' &&
                    location.pathname.startsWith(item.url + '/'))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
