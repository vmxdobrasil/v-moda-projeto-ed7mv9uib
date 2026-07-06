import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Users, Phone, MapPin, Building2, Globe } from 'lucide-react'
import { REGION_COLORS } from '@/lib/brazil-geo'
import type { GeoStats } from '@/services/leads-geographic'

interface Props {
  stats: GeoStats | null
}

export function LeadGeoDashboard({ stats }: Props) {
  const cards = [
    {
      label: 'Total de Leads',
      value: stats?.totalLeads ?? 0,
      icon: Users,
      color: 'text-orange-400',
    },
    {
      label: 'Leads de Lojistas',
      value: stats?.totalRetailerLeads ?? 0,
      icon: Building2,
      color: 'text-blue-400',
    },
    {
      label: 'DDDs Ativos',
      value: stats?.byDdd?.length ?? 0,
      icon: Phone,
      color: 'text-green-400',
    },
    {
      label: 'Estados',
      value: stats?.byState?.length ?? 0,
      icon: MapPin,
      color: 'text-purple-400',
    },
  ]

  const regionConfig: ChartConfig = { count: { label: 'Leads', color: 'hsl(24, 100%, 50%)' } }
  const dddConfig: ChartConfig = { count: { label: 'Leads', color: 'hsl(210, 100%, 50%)' } }
  const topDdd = (stats?.byDdd ?? []).slice(0, 15)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.label}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[20px] p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60 font-medium">{c.label}</span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold text-white font-display">
                {c.value.toLocaleString('pt-BR')}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-400" /> Distribuição por Região
          </h3>
          <ChartContainer config={regionConfig} className="h-[220px] w-full">
            <PieChart>
              <Pie
                data={stats?.byRegion ?? []}
                dataKey="count"
                nameKey="region"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={(e: any) => `${e.region}: ${e.count}`}
              >
                {(stats?.byRegion ?? []).map((r, i) => (
                  <Cell key={i} fill={REGION_COLORS[r.region] || 'hsl(0,0%,60%)'} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-400" /> Top 15 DDDs
          </h3>
          <ChartContainer config={dddConfig} className="h-[220px] w-full">
            <BarChart data={topDdd} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                stroke="rgba(255,255,255,0.4)"
              />
              <YAxis
                type="category"
                dataKey="ddd"
                tickLine={false}
                axisLine={false}
                width={32}
                stroke="rgba(255,255,255,0.4)"
              />
              <Bar dataKey="count" fill="hsl(24, 100%, 50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-4">Top Cidades</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {(stats?.topCities ?? []).slice(0, 10).map((c, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-xs text-white/50">{c.city}</p>
              <p className="text-xs text-white/40">{c.state}</p>
              <p className="text-lg font-bold text-white">{c.count.toLocaleString('pt-BR')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
