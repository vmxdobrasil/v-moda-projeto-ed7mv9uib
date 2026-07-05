import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Users, TrendingUp, Target, DollarSign, ArrowRight } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import useCrmStore from '@/stores/useCrmStore'

const STAT_CARDS = [
  { key: 'customers', label: 'Clientes', icon: Users, color: 'text-primary' },
  { key: 'leads', label: 'Leads Totais', icon: Target, color: 'text-electric' },
  { key: 'converted', label: 'Convertidos', icon: TrendingUp, color: 'text-emerald' },
  { key: 'pending', label: 'Pendentes', icon: DollarSign, color: 'text-azul' },
]

export default function CrmDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [recentClients, setRecentClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { setSelectedClient } = useCrmStore()

  const loadData = async () => {
    try {
      const [cust, leads] = await Promise.all([
        pb
          .collection('customers')
          .getList(1, 6, { sort: '-created' })
          .catch(() => ({ items: [], totalItems: 0 })),
        pb
          .collection('leads_venda')
          .getFullList({ sort: '-created', expand: 'retailer,brand' })
          .catch(() => []),
      ])
      setRecentClients((cust as any).items || [])
      setStats({
        customers: (cust as any).totalItems || 0,
        leads: leads.length,
        converted: leads.filter((l: any) => l.status === 'converted').length,
        pending: leads.filter((l: any) => l.status === 'pending').length,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('customers', loadData)
  useRealtime('leads_venda', loadData)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Painel CRM</h1>
        <p className="text-white/40 mt-1">Visão geral do ecossistema V MODA BRASIL</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.key} className="crm-card p-5">
              <Icon className={`w-5 h-5 ${s.color} mb-3`} />
              <p className="text-3xl font-bold font-display text-white">
                {loading ? '—' : stats[s.key] || 0}
              </p>
              <p className="text-xs text-white/40 mt-1">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="crm-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-display text-white">Clientes Recentes</h2>
          <Link
            to="/crm/leads"
            className="text-xs text-primary hover:text-electric flex items-center gap-1 transition-colors"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentClients.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClient(c)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-primary/20 flex items-center justify-center border border-white/10 shrink-0">
                <span className="text-sm font-bold text-white font-display">
                  {c.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                  {c.name}
                </p>
                <p className="text-xs text-white/40 truncate">{c.city || c.email || '—'}</p>
              </div>
              <span
                className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${
                  c.status === 'converted'
                    ? 'bg-emerald/20 text-emerald'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {c.status || 'new'}
              </span>
            </button>
          ))}
          {!loading && recentClients.length === 0 && (
            <p className="text-center text-white/30 py-8">Nenhum cliente encontrado.</p>
          )}
        </div>
      </div>
    </div>
  )
}
