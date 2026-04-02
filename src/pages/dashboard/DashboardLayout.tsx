import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Users, CreditCard, LayoutDashboard, LogOut } from 'lucide-react'

export default function DashboardLayout() {
  const location = useLocation()

  if (!pb.authStore.isValid) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    pb.authStore.clear()
    window.location.href = '/login'
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 flex items-center justify-center border-b">
          <h2 className="text-xl font-bold text-primary">V Moda CRM</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === '/dashboard' ||
                      location.pathname === '/painel-fabricante'
                    }
                  >
                    <Link to="/painel-fabricante">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      <span>Painel Principal</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/dashboard/crm')}
                  >
                    <Link to="/dashboard/crm">
                      <Users className="w-4 h-4 mr-2" />
                      <span>CRM de Vendas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith('/dashboard/billing')}
                  >
                    <Link to="/dashboard/billing">
                      <CreditCard className="w-4 h-4 mr-2" />
                      <span>Meu Plano</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sair</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 w-full flex flex-col min-h-screen bg-muted/10 overflow-hidden">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 shrink-0">
          <SidebarTrigger />
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
