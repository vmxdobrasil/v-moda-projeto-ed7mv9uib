import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut, ChevronUp } from 'lucide-react'

export function Layout() {
  const { signOut, user } = useAuth()
  const location = useLocation()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
          <div className="font-bold text-lg tracking-tight">V Moda</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="mt-4 px-2 space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                <Link to="/">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/customers'}>
                <Link to="/customers">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Clientes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/products'}>
                <Link to="/products">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  <span>Produtos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/settings'}>
                <Link to="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full flex items-center justify-between h-auto py-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            user?.avatar
                              ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`
                              : undefined
                          }
                        />
                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start text-sm overflow-hidden">
                        <span className="font-medium truncate w-full">{user?.name || 'Admin'}</span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {user?.email || 'admin@vmoda.com'}
                        </span>
                      </div>
                    </div>
                    <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <div className="ml-auto text-sm font-medium text-muted-foreground">
            Painel Administrativo
          </div>
        </header>
        <main className="flex-1 p-6 bg-muted/20 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
