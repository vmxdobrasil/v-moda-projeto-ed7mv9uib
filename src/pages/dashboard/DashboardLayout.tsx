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
    const baseLinks = []

    if (userRecord?.role === 'affiliate') {
      baseLinks.push(
        { href: '/dashboard/affiliate', label: 'Painel do Guia', icon: BusFront },
        { href: '/dashboard/logistics', label: 'Logística', icon: Truck },
        { href: '/dashboard/indicacoes', label: 'Indicações', icon: Share2 },
        { href: '/dashboard/performance', label: 'Performance', icon: BarChart },
      )
    } else if (userRecord?.role === 'manufacturer' || userRecord?.type === 'Lojista Fabricante') {
      baseLinks.push(
        { href: '/dashboard/crm', label: 'CRM / Leads', icon: Users },
        { href: '/dashboard/projects', label: 'Catálogo / Vitrine', icon: FolderKanban },
        { href: '/dashboard/logistics', label: 'Logística', icon: Truck },
        { href: '/dashboard/video-sessions', label: 'Vídeo Negociação', icon: Video },
        { href: '/dashboard/recursos', label: 'Academy', icon: GraduationCap },
        {
          href: '/dashboard/settings/whatsapp',
          label: 'Integrações (WhatsApp)',
          icon: MessageSquare,
        },
        { href: '/dashboard/indicacoes', label: 'Indicações', icon: Share2 },
        { href: '/dashboard/billing', label: 'Meu Plano', icon: CreditCard },
      )
    } else {
      baseLinks.push(
        { href: '/dashboard/crm', label: 'CRM / Leads', icon: Users },
        { href: '/dashboard/logistics', label: 'Minhas Entregas', icon: Truck },
        { href: '/dashboard/video-sessions', label: 'Vídeo Negociação', icon: Video },
        { href: '/dashboard/recursos', label: 'Academy', icon: GraduationCap },
        { href: '/dashboard/billing', label: 'Meu Plano', icon: CreditCard },
      )
    }

    return baseLinks
  }, [userRecord?.role, userRecord?.type])

  if (!pb.authStore.isValid) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-muted/20">
      <aside className="w-64 bg-background border-r flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">Painel</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t">
          <Link
            to="/perfil"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
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
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-background border-b flex items-center justify-between px-6 gap-4">
          <div className="flex flex-1 items-center">
            <Button
              variant="outline"
              className="relative h-9 w-9 p-0 md:h-10 md:w-64 md:justify-start md:px-3 md:py-2 text-muted-foreground"
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
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Buscar módulos (ex: Customers, Messages)..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Módulos">
            <CommandItem onSelect={() => handleSearchSelect('/dashboard/crm')}>
              <Users className="mr-2 h-4 w-4" />
              <span>CRM / Leads</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSearchSelect('/dashboard/projects')}>
              <FolderKanban className="mr-2 h-4 w-4" />
              <span>Catálogo / Vitrine</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSearchSelect('/dashboard/logistics')}>
              <Truck className="mr-2 h-4 w-4" />
              <span>Logística</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSearchSelect('/dashboard/video-sessions')}>
              <Video className="mr-2 h-4 w-4" />
              <span>Vídeo Negociação</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSearchSelect('/dashboard/recursos')}>
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Academy</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSearchSelect('/dashboard/settings/whatsapp')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Integrações (WhatsApp)</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
