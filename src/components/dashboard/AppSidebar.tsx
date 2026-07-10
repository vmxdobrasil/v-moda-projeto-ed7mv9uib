import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Truck,
  Settings,
  Wallet,
  Star,
  BarChart,
  CreditCard,
  Users,
  Award,
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
import {
  ADMIN_NAV_SECTIONS,
  AGENT_NAV_SECTIONS,
  type NavItem,
  type NavSection,
} from '@/lib/navigation-config'

const MANUFACTURER_ITEMS: NavItem[] = [
  { name: 'Painel de Gestão', href: '/manufacturer', icon: LayoutDashboard },
  { name: 'Catálogo', href: '/manufacturer/catalog', icon: ShoppingBag },
  { name: 'CRM & Leads', href: '/manufacturer/leads', icon: Users },
  { name: 'Logística', href: '/manufacturer/logistics', icon: Truck },
  { name: 'V Club', href: '/manufacturer/v-club', icon: Award },
  { name: 'Configurações', href: '/manufacturer/settings', icon: Settings },
  { name: 'Financeiro', href: '/financeiro', icon: CreditCard },
  { name: 'Logística & Transporte', href: '/logistica-transportadoras', icon: Truck },
]

const AFFILIATE_ITEMS: NavItem[] = [
  { name: 'Performance & Links', href: '/affiliates', icon: BarChart },
  { name: 'Financeiro', href: '/financeiro', icon: CreditCard },
]

const RETAILER_ITEMS: NavItem[] = [
  { name: 'Central de Pedidos', href: '/revenda', icon: ShoppingBag },
  { name: 'Minha Revenda', href: '/revendedora-dashboard', icon: Wallet },
  { name: 'Vitrine de Marcas', href: '/guia-de-moda', icon: Store },
  { name: 'V Club Wallet', href: '/v-club', icon: Wallet },
  { name: 'Meu Perfil', href: '/perfil', icon: Settings },
  { name: 'Top 100 Marcas', href: '/top-marcas', icon: Star },
  { name: 'Guia de Compras', href: '/guia-compras', icon: Store },
  { name: 'Logística & Transporte', href: '/logistica-transportadoras', icon: Truck },
  { name: 'Financeiro', href: '/financeiro', icon: CreditCard },
]

function isItemActive(href: string, pathname: string, search: string): boolean {
  if (href.includes('?tab=')) {
    const [path, tabQuery] = href.split('?tab=')
    const currentTab = new URLSearchParams(search).get('tab') || 'overview'
    return pathname === path && currentTab === tabQuery
  }
  if (href === '/Agente Credenciado') {
    const currentTab = new URLSearchParams(search).get('tab')
    return pathname === '/Agente Credenciado' && (!currentTab || currentTab === 'overview')
  }
  if (pathname === href) return true
  const exactPaths = [
    '/',
    '/admin',
    '/AdminMaster',
    '/manufacturer',
    '/dashboard',
    '/Agente Credenciado',
  ]
  if (exactPaths.includes(href)) return false
  return pathname.startsWith(href + '/')
}

export function AppSidebar() {
  const { user } = useAuth()
  const location = useLocation()

  const isAdmin = user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'
  const isManufacturer = user?.role === 'manufacturer'
  const isAgent = user?.role === 'agent'
  const isAffiliate = user?.role === 'affiliate'
  const isRetailer =
    user?.role === 'retailer' || (!isAdmin && !isManufacturer && !isAgent && !isAffiliate)
  const isManufacturerContext = location.pathname.startsWith('/manufacturer')
  const isAgentContext = location.pathname.startsWith('/Agente Credenciado')

  const renderItem = (item: NavItem) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        asChild
        isActive={isItemActive(item.href, location.pathname, location.search)}
      >
        <Link to={item.href}>
          <item.icon />
          <span>{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  const renderSection = (section: NavSection) => (
    <SidebarGroup key={section.label}>
      <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>{section.items.map(renderItem)}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  const renderFlatGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup key={label}>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>{items.map(renderItem)}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <Sidebar>
      <SidebarContent>
        {isAdmin &&
          !isManufacturerContext &&
          !isAgentContext &&
          ADMIN_NAV_SECTIONS.map(renderSection)}
        {(isManufacturer || isManufacturerContext) &&
          !isAgentContext &&
          renderFlatGroup('Portal do Fabricante', MANUFACTURER_ITEMS)}
        {(isAgent || isAgentContext) &&
          !isManufacturerContext &&
          AGENT_NAV_SECTIONS.map(renderSection)}
        {isAffiliate &&
          !isManufacturerContext &&
          !isAgentContext &&
          renderFlatGroup('Portal do Afiliado', AFFILIATE_ITEMS)}
        {isRetailer &&
          !isAgentContext &&
          renderFlatGroup('Central de Abastecimento', RETAILER_ITEMS)}
      </SidebarContent>
    </Sidebar>
  )
}
