import { useState, useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const { user } = useAuth()

  const loadNotifications = async () => {
    if (!user) return
    try {
      const records = await pb.collection('notifications').getList(1, 10, {
        sort: '-created',
      })
      setNotifications(records.items)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  useRealtime('notifications', () => loadNotifications(), !!user)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      await pb.collection('notifications').update(id, { read: true })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (e) {
      console.error(e)
    }
  }

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read)
    for (const n of unread) {
      try {
        await pb.collection('notifications').update(n.id, { read: true })
      } catch {
        /* intentionally ignored */
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center justify-center w-9 h-9 rounded-full text-white/60 hover:text-primary hover:bg-white/5 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 outline-none cursor-pointer">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] text-white font-bold px-1 cta-glow">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-card/95 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold text-white font-display">Notificações</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" /> Marcar todas
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        <div className="max-h-[50vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma notificação no momento.
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  'flex flex-col items-start gap-1 p-3 cursor-pointer border-b border-white/5 last:border-b-0',
                  !n.read ? 'bg-primary/5' : '',
                )}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <div className="flex w-full justify-between items-center gap-2">
                  <span className="font-semibold text-sm line-clamp-1 text-white">{n.title}</span>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 cta-glow" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                  {n.message}
                </span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">
                  {formatDistanceToNow(new Date(n.created), { addSuffix: true, locale: ptBR })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
