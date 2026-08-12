import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '@/services/notifications'
import {
  deriveCategory,
  CATEGORY_LABELS,
  type ReadFilter,
  type CategoryFilter,
  type SortOrder,
} from '@/lib/notification-utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, CheckCheck, RefreshCw, AlertCircle, Inbox, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function AdminNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminNotifications(100)
      setNotifications(data)
    } catch {
      setError(
        'Não foi possível carregar as notificações. Verifique sua conexão e tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useRealtime('notifications', () => loadNotifications(), !!user)

  const filtered = notifications
    .filter((n) => {
      if (readFilter === 'unread') return !n.read
      if (readFilter === 'read') return n.read
      return true
    })
    .filter(
      (n) => categoryFilter === 'all' || deriveCategory(n.title, n.message) === categoryFilter,
    )
    .sort((a, b) => {
      const cmp = new Date(b.created).getTime() - new Date(a.created).getTime()
      return sortOrder === 'newest' ? cmp : -cmp
    })

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await markNotificationRead(id)
    } catch {
      toast.error('Erro ao marcar notificação como lida.')
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
    }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await markAllNotificationsRead(unreadIds)
      toast.success('Todas as notificações foram marcadas como lidas.')
    } catch {
      toast.error('Erro ao marcar notificações como lidas.')
      loadNotifications()
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Notificações
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white hover:bg-red-600">
                {unreadCount} não lidas
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Central de notificações em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadNotifications}>
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
          {unreadCount > 0 && (
            <Button size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="w-4 h-4 mr-2" /> Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 rounded-lg border p-1">
          {(['all', 'unread', 'read'] as ReadFilter[]).map((r) => (
            <Button
              key={r}
              variant={readFilter === r ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setReadFilter(r)}
            >
              {r === 'all' ? 'Todas' : r === 'unread' ? 'Não lidas' : 'Lidas'}
            </Button>
          ))}
        </div>
        <select
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
        >
          <option value="all">Todas as categorias</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={sortOrder === 'newest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortOrder('newest')}
          >
            Mais recentes
          </Button>
          <Button
            variant={sortOrder === 'oldest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortOrder('oldest')}
          >
            Mais antigas
          </Button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center gap-3 py-12">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-sm text-destructive text-center max-w-md">{error}</p>
          <Button variant="outline" size="sm" onClick={loadNotifications}>
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            {notifications.length === 0
              ? 'Nenhuma notificação no momento.'
              : 'Nenhuma notificação encontrada com os filtros selecionados.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((n) => {
            const cat = deriveCategory(n.title, n.message)
            return (
              <Card
                key={n.id}
                className={cn(
                  'transition-all hover:shadow-md cursor-pointer',
                  !n.read && 'border-primary/40 bg-primary/5',
                )}
                onClick={() => !n.read && handleMarkRead(n.id)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0',
                      !n.read
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{n.title}</span>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        {CATEGORY_LABELS[cat] || 'Outros'}
                      </Badge>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground/70">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(n.created), { addSuffix: true, locale: ptBR })}
                    </div>
                  </div>
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkRead(n.id)
                      }}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
