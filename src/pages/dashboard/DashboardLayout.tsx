import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  Package,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Factory,
} from 'lucide-react'
import logoUrl from '@/assets/logo-v-moda-fb088.png'

export default function DashboardLayout() {
  const { signOut, user } = useAuth()
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads / Clientes', path: '/customers', icon: Users },
    { name: 'Projetos', path: '/products', icon: Package },
    { name: 'Mensagens', path: '/messages', icon: MessageSquare },
    { name: 'Fabricantes', path: '/manufacturers', icon: Factory },
    { name: 'Configurações', path: '/settings', icon: SettingsIcon },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <Sidebar>
          <SidebarHeader className="p-6 flex items-center justify-center border-b">
            <img src={logoUrl} alt="V Moda" className="h-10 object-contain" />
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== '/' && location.pathname.startsWith(item.path))

                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                          <Link to={item.path}>
                            <item.icon />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground truncate px-2">{user?.email}</div>
              <Button
                variant="ghost"
                className="justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-card px-6 sticky top-0 z-10 shadow-sm">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
