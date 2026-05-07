import { useState } from 'react'
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
  GraduationCap,
  Globe,
  CheckCircle2,
  Clock,
  X,
  Play,
  ExternalLink,
} from 'lucide-react'
import { Suspense } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'
import { ExternalLink as CustomExternalLink } from '@/components/ExternalLink'
import { WhatsappStatusWidget } from '@/components/WhatsappStatusWidget'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Leads / Clientes', path: '/customers' },
  { icon: GraduationCap, label: 'Academy', path: '/resources' },
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
  {
    icon: Play,
    label: 'Play Store',
    path: 'https://play.google.com/store/apps/details?id=com.revista-moda-atual/id6475497663',
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
                        {item.external ? (
                          <CustomExternalLink
                            href={item.path}
                            className="group flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm font-medium text-sidebar-foreground outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2"
                            title={item.label}
                            forceTopBreakout={item.path.includes('play.google.com')}
                          >
                            <div className="flex flex-1 items-center gap-2 overflow-hidden">
                              <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
                          </CustomExternalLink>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                            className={isActive ? 'text-primary hover:text-primary' : ''}
                          >
                            <Link to={item.path}>
                              <item.icon
                                className={cn('h-4 w-4', isActive && 'text-primary')}
                                strokeWidth={isActive ? 2.5 : 2}
                              />
                              <span className={cn(isActive && 'font-semibold')}>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
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
              <div className="hidden md:flex items-center gap-3 mr-2">
                <CustomExternalLink
                  href="https://revistamodaatual.com.br"
                  className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span>Site Oficial</span>
                  <ExternalLink className="ml-0.5 h-3 w-3 opacity-50" />
                </CustomExternalLink>
                <CustomExternalLink
                  href="https://play.google.com/store/apps/details?id=com.revista-moda-atual/id6475497663"
                  forceTopBreakout={true}
                  className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <Play className="h-4 w-4 text-emerald-500" />
                  <span>Play Store</span>
                  <ExternalLink className="ml-0.5 h-3 w-3 opacity-50" />
                </CustomExternalLink>
              </div>
              <WhatsappStatusWidget />
              <div className="text-sm font-medium text-muted-foreground hidden lg:block border-l pl-4 py-1">
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
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <p className="text-muted-foreground">Sincronizando Dados do Serviço...</p>
                    </div>
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
