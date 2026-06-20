import { Link, useLocation } from 'react-router-dom'
import {
  Users,
  CreditCard,
  LayoutDashboard,
  ShoppingBag,
  Store,
  MapPin,
  Truck,
  Settings,
  Activity,
  Wallet,
  Star,
  Award,
  BarChart,
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
  const isManufacturer = user?.role === 'manufacturer'
  const isAgent = user?.role === 'agent'
  const isAffiliate = user?.role === 'affiliate'
  const isRetailer =
    user?.role === 'retailer' || (!isAdmin && !isManufacturer && !isAgent && !isAffiliate)

  const getIsActive = (url: string) => {
    return (
      location.pathname === url ||
      (url !== '/' &&
        url !== '/admin' &&
        url !== '/manufacturer' &&
        url !== '/dashboard' &&
        location.pathname.startsWith(url + '/'))
    )
  }

  return (
    <Sidebar>
      <SidebarContent>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/admin')}>
                    <Link to="/admin">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/admin/fabricantes')}>
                    <Link to="/admin/fabricantes">
                      <Star />
                      <span>Top 60 Marcas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/admin/guia-marcas')}>
                    <Link to="/admin/guia-marcas">
                      <Store />
                      <span>Fabricantes do Guia</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/admin/clientes')}>
                    <Link to="/admin/clientes">
                      <Users />
                      <span>Clientes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/admin/assinaturas')}>
                    <Link to="/admin/assinaturas">
                      <Wallet />
                      <span>Assinaturas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/admin/comissoes')}>
                    <Link to="/admin/comissoes">
                      <CreditCard />
                      <span>Comissões</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/admin/insights')}>
                    <Link to="/admin/insights">
                      <Activity />
                      <span>Insights</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/admin/v-club')}>
                    <Link to="/admin/v-club">
                      <Award />
                      <span>V Club (Admin)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/admin/agentes')}>
                    <Link to="/admin/agentes">
                      <MapPin />
                      <span>Agentes & Parceiros</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/admin/produtos')}>
                    <Link to="/admin/produtos">
                      <ShoppingBag />
                      <span>Produtos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isManufacturer && (
          <SidebarGroup>
            <SidebarGroupLabel>Portal do Fabricante</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/manufacturer')}>
                    <Link to="/manufacturer">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/manufacturer/catalog')}>
                    <Link to="/manufacturer/catalog">
                      <ShoppingBag />
                      <span>Catálogo</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/manufacturer/leads')}>
                    <Link to="/manufacturer/leads">
                      <Users />
                      <span>CRM & Leads</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/manufacturer/logistics')}>
                    <Link to="/manufacturer/logistics">
                      <Truck />
                      <span>Logística</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/manufacturer/v-club')}>
                    <Link to="/manufacturer/v-club">
                      <Award />
                      <span>V Club</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/manufacturer/settings')}>
                    <Link to="/manufacturer/settings">
                      <Settings />
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAgent && (
          <SidebarGroup>
            <SidebarGroupLabel>Portal do Agente</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/agente')}>
                    <Link to="/agente">
                      <MapPin />
                      <span>Minhas Regiões & Clientes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAffiliate && (
          <SidebarGroup>
            <SidebarGroupLabel>Portal do Afiliado</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/affiliates')}>
                    <Link to="/affiliates">
                      <BarChart />
                      <span>Performance & Links</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isRetailer && (
          <SidebarGroup>
            <SidebarGroupLabel>Minha Conta</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/dashboard')}>
                    <Link to="/dashboard">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/v-club')}>
                    <Link to="/v-club">
                      <Wallet />
                      <span>V Club Wallet</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive('/perfil')}>
                    <Link to="/perfil">
                      <Settings />
                      <span>Perfil</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
