import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  BarChart,
  CreditCard,
  Box,
  BookOpen,
  Megaphone,
  Bell,
  Percent,
  Settings,
  FileText,
  LogOut,
} from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'

const adminNav = [
  {
    title: 'Principal',
    items: [
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
      { title: 'Financeiro', url: '/admin/financeiro', icon: BarChart },
      { title: 'Notificações', url: '/admin/notificacoes', icon: Bell },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { title: 'Clientes', url: '/admin/clientes', icon: Users },
      { title: 'Agentes', url: '/admin/agentes', icon: Users },
      { title: 'Afiliados', url: '/admin/afiliados', icon: Users },
      { title: 'Parceiros', url: '/admin/parceiros', icon: Users },
      { title: 'Marketing', url: '/admin/marketing', icon: Megaphone },
      { title: 'Comissões', url: '/admin/comissoes', icon: Percent },
      { title: 'V-Club', url: '/admin/v-club', icon: CreditCard },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { title: 'Produtos', url: '/admin/produtos', icon: ShoppingBag },
      { title: 'Categorias', url: '/admin/categorias', icon: Box },
      { title: 'Catálogo', url: '/admin/catalogo', icon: BookOpen },
      { title: 'Coleções', url: '/admin/colecoes', icon: FileText },
    ],
  },
  {
    title: 'Sistema',
    items: [{ title: 'Configurações', url: '/admin/configuracoes', icon: Settings }],
  },
]

export default function AdminLayout() {
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="h-16 flex justify-center flex-col px-4 border-b border-border/50">
            <span className="font-bold text-lg text-primary tracking-tight">V MODA ADMIN</span>
          </SidebarHeader>
          <SidebarContent className="py-4">
            {adminNav.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="text-xs uppercase text-muted-foreground font-semibold">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive =
                        location.pathname === item.url ||
                        (item.url !== '/admin' && location.pathname.startsWith(item.url))

                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                            <Link to={item.url}>
                              <item.icon className="h-4 w-4 mr-2" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter className="border-t border-border/50 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={signOut}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sair do Painel</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="h-full w-full p-4 md:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
