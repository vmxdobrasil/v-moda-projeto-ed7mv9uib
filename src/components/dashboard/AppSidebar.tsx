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
  MessageSquare,
  Truck,
  Settings,
  User as UserIcon,
  FileText,
  Activity,
  Bell,
  Wallet,
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
          <>
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
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Parceiros & Zonas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/admin/agentes')}>
                      <Link to="/admin/agentes">
                        <UserCheck />
                        <span>Agentes Conveniados</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/admin/afiliados')}>
                      <Link to="/admin/afiliados">
                        <Users />
                        <span>Afiliados</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/admin/zonas')}>
                      <Link to="/admin/zonas">
                        <MapPin />
                        <span>Zonas de Revenda</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Catálogo & Sistema</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/admin/produtos')}>
                      <Link to="/admin/produtos">
                        <ShoppingBag />
                        <span>Produtos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/admin/v-club')}>
                      <Link to="/admin/v-club">
                        <CreditCard />
                        <span>V Club Card</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/admin/notificacoes')}>
                      <Link to="/admin/notificacoes">
                        <Bell />
                        <span>Notificações</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/admin/logs-importacao')}>
                      <Link to="/admin/logs-importacao">
                        <FileText />
                        <span>Logs de Importação</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {!isAdmin && isManufacturer && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Principal</SidebarGroupLabel>
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
                    <SidebarMenuButton asChild isActive={getIsActive('/perfil')}>
                      <Link to="/perfil">
                        <UserIcon />
                        <span>Meu Perfil</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>CRM & Vendas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/manufacturer/leads')}>
                      <Link to="/manufacturer/leads">
                        <Users />
                        <span>Leads & CRM</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/manufacturer/messages')}>
                      <Link to="/manufacturer/messages">
                        <MessageSquare />
                        <span>Mensagens</span>
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
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Logística & Operações</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/manufacturer/logistics')}>
                      <Link to="/manufacturer/logistics">
                        <Truck />
                        <span>Logística</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/manufacturer/team')}>
                      <Link to="/manufacturer/team">
                        <UserCheck />
                        <span>Equipe</span>
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
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/manufacturer/v-club')}>
                      <Link to="/manufacturer/v-club">
                        <CreditCard />
                        <span>V Club Card</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {!isAdmin && !isManufacturer && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/dashboard')}>
                      <Link to="/dashboard">
                        <LayoutDashboard />
                        <span>Meu Painel</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/perfil')}>
                      <Link to="/perfil">
                        <UserIcon />
                        <span>Meu Perfil</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Minhas Ferramentas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {isRetailer && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={getIsActive('/revenda')}>
                          <Link to="/revenda">
                            <Store />
                            <span>Painel Revenda</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={getIsActive('/academy')}>
                          <Link to="/academy">
                            <GraduationCap />
                            <span>Academy Fashion</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={getIsActive('/vallen-consultora')}>
                          <Link to="/vallen-consultora">
                            <Bot />
                            <span>Vallen Consultora</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  {isAgent && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={getIsActive('/agente')}>
                        <Link to="/agente">
                          <UserCheck />
                          <span>Agentes Conveniados</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isAffiliate && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={getIsActive('/affiliates')}>
                        <Link to="/affiliates">
                          <Users />
                          <span>Afiliados</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={getIsActive('/v-club')}>
                      <Link to="/v-club">
                        <CreditCard />
                        <span>V Club Card</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
