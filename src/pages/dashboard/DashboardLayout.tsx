import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Users,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import pb from '@/lib/pocketbase/client'

const navigation = [
  { name: 'Início', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/dashboard/customers', icon: Users },
  { name: 'Produtos', href: '/dashboard/products', icon: Package },
  { name: 'Mensagens', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive =
          location.pathname === item.href ||
          (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-primary',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span>V MODA</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
            <NavLinks />
          </nav>
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de Navegação</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium mt-4">
                <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
                  <Package className="h-5 w-5" />
                  <span>V MODA</span>
                </Link>
                <div className="grid gap-2">
                  <NavLinks />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 hidden md:flex bg-muted/50 rounded-full pl-1 pr-4 py-1 border border-border/50">
              <Avatar className="h-7 w-7 border bg-background">
                <AvatarImage
                  src={
                    user?.avatar
                      ? pb.files.getUrl(user, user.avatar, { thumb: '100x100' })
                      : undefined
                  }
                  alt={user?.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                  {user?.name?.substring(0, 2).toUpperCase() ||
                    user?.email?.substring(0, 2).toUpperCase() ||
                    'AD'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.name || user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
