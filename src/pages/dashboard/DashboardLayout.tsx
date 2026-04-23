import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { NotificationsBell } from '@/components/NotificationsBell'
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  LogOut,
  Settings,
  Factory,
  Link as LinkIcon,
  BookOpen,
  BarChart3,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
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
  SidebarInset,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const isAdmin = user?.email === 'valterpmendonca@gmail.com' || user?.role === 'admin'

  const navItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/' },
    { icon: Package, label: 'Catálogo', path: '/products' },
    { icon: Users, label: 'CRM', path: '/customers' },
    { icon: Truck, label: 'Logística', path: '/logistics' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ]

  if (isAdmin) {
    navItems.splice(2, 0, { icon: Package, label: 'Catálogo Admin', path: '/admin-products' })
    navItems.splice(3, 0, { icon: Factory, label: 'Fabricantes', path: '/manufacturers' })
    navItems.splice(4, 0, { icon: LinkIcon, label: 'Afiliados', path: '/affiliates' })
    navItems.splice(5, 0, { icon: BookOpen, label: 'Revista', path: '/magazine' })
    navItems.splice(6, 0, { icon: ImageIcon, label: 'Media Kit', path: '/media-kit' })
  }

  useRealtime('notifications', (e) => {
    if (e.action === 'create') {
      const isForUser = e.record.user === user?.id || e.record.customer_email === user?.email
      if (isForUser) {
        toast.info(e.record.title, { description: e.record.message })
      }
    }
  })

  const currentPage = navItems.find(
    (item) =>
      item.path === location.pathname ||
      (item.path !== '/' && location.pathname.startsWith(item.path)),
  )

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex h-12 items-center px-4 font-bold text-xl tracking-tight text-primary">
            V MODA
          </div>
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
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link to={item.path}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase shrink-0">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{user?.name || 'Usuário'}</span>
                  <span className="text-xs text-muted-foreground truncate capitalize">
                    {user?.role || 'Admin'}
                  </span>
                </div>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={signOut}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background/95 backdrop-blur z-30 sticky top-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/">V Moda Hub</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage?.label || 'Visão Geral'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:block text-muted-foreground">
              Olá, {user?.name || user?.email || 'Usuário'}
            </span>
            <NotificationsBell />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-muted/30">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
