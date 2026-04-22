import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import {
  Users,
  CreditCard,
  BarChart,
  Bell,
  BusFront,
  Share2,
  Search,
  MessageSquare,
  Megaphone,
  FolderKanban,
  Truck,
  Video,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Database,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useMemo } from 'react'
import { getMyNotifications, markNotificationRead, Notification } from '@/services/notifications'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import pb from '@/lib/pocketbase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar'

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userRecord, setUserRecord] = useState(pb.authStore.record)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSearchSelect = (path: string) => {
    setSearchOpen(false)
    navigate(path)
  }

  useEffect(() => {
    return pb.authStore.onChange((token, record) => {
      setUserRecord(record)
    })
  }, [])

  useRealtime('users', (e) => {
    if (e.action === 'update' && e.record.id === pb.authStore.record?.id) {
      setUserRecord(e.record)
      pb.authStore.save(pb.authStore.token, e.record)
    }
  })

  const loadNotifications = async () => {
    try {
      const data = await getMyNotifications()
      setNotifications(data)
    } catch (e) {
      console.error('Failed to load notifications:', e)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useRealtime('notifications', () => {
    loadNotifications()
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const links = useMemo(() => {
    return [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: '/dashboard/customers',
        label: 'Customers / Leads',
        icon: Users,
      },
      {
        href: '/dashboard/projects',
        label: 'Projects / Products',
        icon: FolderKanban,
      },
      {
        href: '/dashboard/resources',
        label: 'Resources',
        icon: Database,
      },
      {
        href: '/dashboard/settings',
        label: 'Settings',
        icon: Settings,
      },
    ]
  }, [])

  if (!pb.authStore.isValid) {
    return <Navigate to="/login" replace />
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-muted/20 w-full overflow-hidden">
        <Sidebar variant="inset">
          <SidebarHeader className="p-4 border-b">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-serif text-lg">
                V
              </div>
              V Moda
            </h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarMenu>
                {links.map((link, i) => {
                  const Icon = link.icon
                  const isActive = link.exact
                    ? location.pathname === link.href
                    : location.pathname.startsWith(link.href)
                  return (
                    <SidebarMenuItem key={link.href + i}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={link.label}>
                        <Link to={link.href}>
                          <Icon className="w-4 h-4" />
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Link
              to="/perfil"
              className="flex items-center gap-3 rounded-md hover:bg-muted transition-colors"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    userRecord?.avatar
                      ? pb.files.getUrl(userRecord, userRecord.avatar, { thumb: '100x100' })
                      : undefined
                  }
                  alt={userRecord?.name}
                />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {userRecord?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userRecord?.name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground truncate">{userRecord?.email}</p>
              </div>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 gap-4 shrink-0 bg-background/80 backdrop-blur-sm z-10">
            <div className="flex flex-1 items-center gap-4">
              <SidebarTrigger />
              <Button
                variant="outline"
                className="relative h-9 w-9 p-0 md:h-10 md:w-64 md:justify-start md:px-3 md:py-2 text-muted-foreground hidden sm:flex"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline-flex">Buscar módulos...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold">Notificações</h4>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-center text-muted-foreground">
                        Nenhuma notificação
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            'p-4 border-b text-sm cursor-pointer hover:bg-muted/50 transition-colors',
                            !n.read && 'bg-primary/5',
                          )}
                          onClick={() => !n.read && handleMarkAsRead(n.id)}
                        >
                          <h5 className="font-medium">{n.title}</h5>
                          <p className="text-muted-foreground mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6 pb-24">
            <Outlet />
          </div>
        </SidebarInset>

        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput placeholder="Buscar módulos (ex: CRM, Academy)..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup heading="Módulos">
              <CommandItem onSelect={() => handleSearchSelect('/dashboard/customers')}>
                <Users className="mr-2 h-4 w-4" />
                <span>Customers / Leads</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSearchSelect('/dashboard/projects')}>
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Projects / Products</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSearchSelect('/dashboard/resources')}>
                <Database className="mr-2 h-4 w-4" />
                <span>Resources</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSearchSelect('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </SidebarProvider>
  )
}
