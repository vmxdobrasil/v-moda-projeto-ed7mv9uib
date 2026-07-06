import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LeadGeoDashboard } from '@/components/admin/LeadGeoDashboard'
import { LeadGeoTable } from '@/components/admin/LeadGeoTable'
import { getGeoStats, type GeoStats, type LeadFilters } from '@/services/leads-geographic'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Filter } from 'lucide-react'

export default function AdminLeadAnalytics() {
  const [stats, setStats] = useState<GeoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LeadFilters>({})

  useEffect(() => {
    getGeoStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const dddOptions = (stats?.byDdd ?? []).slice(0, 30)
  const stateOptions = stats?.byState ?? []

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="rounded-[28px] bg-gradient-to-br from-[#001F3F] via-[#001a35] to-[#002d5a] p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-display">
              Lead Analytics — TOP 100 Marcas
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Análise geográfica e segmentação por DDD, região e cidade de{' '}
              {stats?.totalLeads?.toLocaleString('pt-BR') ?? '...'} leads.
            </p>
          </div>
          <Link to="/admin/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : (
          <LeadGeoDashboard stats={stats} />
        )}

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-white/80">Filtros Geográficos</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Select
              value={filters.ddd || 'all'}
              onValueChange={(v) => setFilters({ ...filters, ddd: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                <SelectValue placeholder="Todos os DDDs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os DDDs</SelectItem>
                {dddOptions.map((d) => (
                  <SelectItem key={d.ddd} value={d.ddd}>
                    DDD {d.ddd} ({d.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.state || 'all'}
              onValueChange={(v) => setFilters({ ...filters, state: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                <SelectValue placeholder="Todos os Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                {stateOptions.map((s) => (
                  <SelectItem key={s.state} value={s.state}>
                    {s.state} ({s.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="interested">Interessado</SelectItem>
                <SelectItem value="negotiating">Em Negociação</SelectItem>
                <SelectItem value="converted">Convertido</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <LeadGeoTable filters={filters} onFiltersChange={setFilters} />
      </div>
    </div>
  )
}
