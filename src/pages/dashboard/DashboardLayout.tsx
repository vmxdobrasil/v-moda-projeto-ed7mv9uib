import { Outlet, Link, useLocation } from 'react-router-dom'
import { Users, CreditCard, BarChart, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { getMyNotifications, markNotificationRead, Notification } from '@/services/notifications'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import pb from '@/lib/pocketbase/client'

export default function DashboardLayout() {
  const location = useLocation()
  const [notifications, setNotifications] = useState<Notification[]>([])

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

  const links = [
    { href: '/dashboard/crm', label: 'CRM', icon: Users },
    { href: '/dashboard/performance', label: 'Performance', icon: BarChart },
    { href: '/dashboard/billing', label: 'Meu Plano', icon: CreditCard },
  ]

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
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {pb.authStore.record?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {pb.authStore.record?.name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{pb.authStore.record?.email}</p>
            </div>
          </Link>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-background border-b flex items-center justify-end px-6">
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
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
