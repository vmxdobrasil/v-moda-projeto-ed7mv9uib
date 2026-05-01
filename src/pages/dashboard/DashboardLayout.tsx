import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Home,
  Users,
  Package,
  MessageSquare,
  Settings,
  Truck,
  TrendingUp,
  BookOpen,
  UserPlus,
  Factory,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Leads / Clientes', path: '/customers' },
  { icon: Package, label: 'Projetos', path: '/products' },
  { icon: MessageSquare, label: 'Mensagens', path: '/messages' },
  { icon: Truck, label: 'Logística', path: '/logistics' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  {
    icon: BookOpen,
    label: 'Site Oficial',
    path: 'https://revistamodaatual.com.br',
    external: true,
  },
  { icon: UserPlus, label: 'Afiliados', path: '/affiliates' },
  { icon: Factory, label: 'Fabricantes', path: '/manufacturers' },
  { icon: ShieldCheck, label: 'Agentes Credenciados', path: '/admin/agentes', adminOnly: true },
  { icon: Settings, label: 'Configurações', path: '/settings' },
]

export default function DashboardLayout() {
  const { signOut, user } = useAuth()
  const location = useLocation()

  const isAdmin = user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false
    return true
  })

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-background">
        <Sidebar>
          <SidebarHeader className="h-auto min-h-[6rem] flex items-center justify-center border-b px-6 py-6 shrink-0">
            <img
              src={logoUrl}
              alt="V Moda Brasil"
              className="w-full max-w-[240px] h-auto object-contain transition-all duration-300"
            />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavItems.map((item) => {
                    const isActive =
                      !item.external &&
                      (location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path)))
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={isActive ? 'text-primary hover:text-primary' : ''}
                        >
                          {item.external ? (
                            <a
                              href={item.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                if (user) {
                                  pb.collection('referrals')
                                    .create({
                                      affiliate: user.id,
                                      type: 'click',
                                      source_channel: 'social_profile',
                                      metadata: { destination: 'official_site' },
                                    })
                                    .catch(console.error)
                                }
                              }}
                            >
                              <item.icon
                                className={cn('h-4 w-4', isActive && 'text-primary')}
                                strokeWidth={isActive ? 2.5 : 2}
                              />
                              <span className={cn(isActive && 'font-semibold')}>{item.label}</span>
                            </a>
                          ) : (
                            <Link to={item.path}>
                              <item.icon
                                className={cn('h-4 w-4', isActive && 'text-primary')}
                                strokeWidth={isActive ? 2.5 : 2}
                              />
                              <span className={cn(isActive && 'font-semibold')}>{item.label}</span>
                            </Link>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4 shrink-0">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  'U'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold truncate text-foreground">
                  {user?.name || 'Administrador'}
                </span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/20">
          <header className="h-16 border-b flex items-center px-6 bg-background shrink-0 shadow-sm z-10">
            <SidebarTrigger className="md:hidden mr-4" />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
