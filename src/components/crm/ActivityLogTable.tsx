import { useState, useEffect, useCallback } from 'react'
import { getActivityLogs } from '@/services/activity-logs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Search, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRealtime } from '@/hooks/use-realtime'

const ACTION_TYPES = [
  { value: '', label: 'Todas as ações' },
  { value: 'user_role_updated', label: 'Role Atualizado' },
  { value: 'user_deleted', label: 'Usuário Removido' },
  { value: 'user_waitlist_toggled', label: 'Lista de Espera' },
  { value: 'user_approval_updated', label: 'Aprovação Atualizada' },
  { value: 'lead_updated', label: 'Lead Atualizado' },
  { value: 'leads_retailers_updated', label: 'Lead Lojista Atualizado' },
  { value: 'data_import', label: 'Importação de Dados' },
  { value: 'status_update', label: 'Status Atualizado' },
]

export function ActivityLogTable() {
  const [logs, setLogs] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const filters: string[] = []
      if (actionFilter) filters.push(`action_type = "${actionFilter}"`)
      if (startDate) filters.push(`created >= "${startDate}T00:00:00"`)
      if (endDate) filters.push(`created <= "${endDate}T23:59:59"`)
      if (search) filters.push(`(action_type ~ "${search}" || description ~ "${search}")`)
      const filter = filters.join(' && ')
      const res = await getActivityLogs(page, 15, filter, '')
      setLogs(res.items)
      setTotalPages(res.totalPages)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, actionFilter, startDate, endDate])

  useEffect(() => {
    const timer = setTimeout(() => loadLogs(), 300)
    return () => clearTimeout(timer)
  }, [loadLogs])

  useRealtime('activity_logs', () => loadLogs())

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-white/40 mr-2" />
          <Input
            placeholder="Buscar nas atividades..."
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
            className="border-0 bg-transparent p-0 h-auto text-sm text-white placeholder:text-white/40 focus-visible:ring-0"
          />
        </div>
        <Select
          value={actionFilter}
          onValueChange={(v) => {
            setPage(1)
            setActionFilter(v)
          }}
        >
          <SelectTrigger className="w-48 h-10 bg-white/5 border-white/10 text-white text-sm rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
          <Calendar className="w-4 h-4 text-white/40" />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setPage(1)
              setStartDate(e.target.value)
            }}
            className="border-0 bg-transparent p-0 h-auto text-sm text-white focus-visible:ring-0 w-36"
          />
          <span className="text-white/30 text-xs">até</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setPage(1)
              setEndDate(e.target.value)
            }}
            className="border-0 bg-transparent p-0 h-auto text-sm text-white focus-visible:ring-0 w-36"
          />
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-xs text-white/50 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Data/Hora</th>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Ação</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-white/40">
                    Carregando...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-white/40">
                    Nenhuma atividade encontrada.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-white/60 whitespace-nowrap">
                      {log.created
                        ? format(new Date(log.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7 border border-white/10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-electric text-white text-[10px]">
                            {(log.expand?.user?.name || log.expand?.user?.email || 'S')
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white/80">
                          {log.expand?.user?.name || log.expand?.user?.email || 'Sistema'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">{log.description || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border-white/10 text-white/60 hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border-white/10 text-white/60 hover:bg-white/5"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
