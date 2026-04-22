import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, Home, Menu, Users, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function Layout() {
  const { signOut, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Produtos', href: '/produtos', icon: ShoppingBag },
  ]

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground',
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
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Alternar menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 flex flex-col">
            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
            <div className="flex h-16 items-center border-b px-2 font-bold text-lg">V Moda</div>
            <nav className="grid gap-2 py-4">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-between gap-4 md:justify-end">
          <div className="hidden md:flex font-bold text-xl mr-auto">V Moda</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
          <nav className="grid items-start gap-2 px-4 py-4 text-sm font-medium">
            <NavLinks />
          </nav>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
