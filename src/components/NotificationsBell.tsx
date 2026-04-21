import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import useAuthStore from '@/stores/useAuthStore'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const { isAuthenticated, user } = useAuthStore()

  const loadNotifications = async () => {
    if (!isAuthenticated || !user) return
    try {
      const records = await pb.collection('notifications').getList(1, 10, {
        filter: `user = "${user.id}"`,
        sort: '-created',
      })
      setNotifications(records.items)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [isAuthenticated, user])

  useRealtime('notifications', () => loadNotifications())

  if (!isAuthenticated) return null

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      await pb.collection('notifications').update(id, { read: true })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="rounded-full h-12 w-12 shadow-lg relative bg-white text-primary hover:bg-muted"
          size="icon"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold border-2 border-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 shadow-2xl rounded-xl">
        <DropdownMenuLabel className="font-serif text-lg">Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma notificação nova.
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer border-b last:border-b-0 ${
                  !n.read ? 'bg-primary/5' : ''
                }`}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <div className="flex w-full justify-between items-center gap-2">
                  <span className="font-semibold text-sm line-clamp-1">{n.title}</span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                  {n.message}
                </span>
                <span className="text-[10px] text-muted-foreground/70 mt-1 font-medium">
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
