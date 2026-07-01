import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, TrendingUp, Building2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const STATE_NAMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
}

interface RetailerUser {
  id: string
  name: string
  email: string
  brand_name?: string
  operating_cities?: string
  operating_regions?: string
  fashion_hubs?: string
  phone?: string
  created: string
}

export default function AdminGeographic() {
  const [retailers, setRetailers] = useState<RetailerUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await pb.collection('users').getList(1, 500, {
          filter: "role = 'retailer'",
          sort: '-created',
        })
        setRetailers(res.items as unknown as RetailerUser[])
      } catch (err) {
        console.error('Failed to load retailers', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const stateData = useMemo(() => {
    const map = new Map<string, RetailerUser[]>()
    retailers.forEach((r) => {
      const state = (r.operating_regions || '').toUpperCase().trim()
      if (!state) return
      if (!map.has(state)) map.set(state, [])
      map.get(state)!.push(r)
    })
    return Array.from(map.entries())
      .map(([state, users]) => ({ state, users, count: users.length }))
      .sort((a, b) => b.count - a.count)
  }, [retailers])

  const maxCount = Math.max(...stateData.map((s) => s.count), 1)
  const totalStates = stateData.length
  const topState = stateData[0]

  const getIntensity = (count: number) => {
    const ratio = count / maxCount
    if (ratio > 0.75) return 'bg-electric text-white'
    if (ratio > 0.5) return 'bg-primary text-primary-foreground'
    if (ratio > 0.25) return 'bg-primary/60 text-primary-foreground'
    return 'bg-primary/20 text-primary'
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up p-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Distribuição Geográfica</h1>
        <p className="text-muted-foreground mt-2">
          Visualização da distribuição de lojistas e performance regional.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lojistas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retailers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados Ativos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Estado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topState?.state || '-'}</div>
            <p className="text-xs text-muted-foreground">{topState?.count || 0} lojistas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Cadastro Completo</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retailers.filter((r) => r.brand_name && r.operating_regions).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Heatmap por Estado</CardTitle>
          <CardDescription>Densidade de lojistas por unidade federativa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stateData.map(({ state, count }) => (
              <div
                key={state}
                className={`rounded-xl p-4 transition-all hover:scale-105 cursor-default ${getIntensity(count)}`}
              >
                <div className="text-xs font-bold uppercase">{state}</div>
                <div className="text-lg font-bold mt-1">{count}</div>
                <div className="text-[10px] opacity-80">{STATE_NAMES[state] || state}</div>
              </div>
            ))}
            {stateData.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Nenhum lojista com região cadastrada encontrado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relatório Regional</CardTitle>
          <CardDescription>Detalhamento de lojistas por estado</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead>Lojistas</TableHead>
                <TableHead>Cidades</TableHead>
                <TableHead>Representatividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stateData.map(({ state, users, count }) => {
                const cities = new Set(users.map((u) => u.operating_cities).filter(Boolean))
                const pct = ((count / retailers.length) * 100).toFixed(1)
                return (
                  <TableRow key={state}>
                    <TableCell className="font-medium">
                      {STATE_NAMES[state] || state} ({state})
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{count}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cities.size} {cities.size === 1 ? 'cidade' : 'cidades'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-electric rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {stateData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Nenhum dado regional encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lojistas Cadastrados</CardTitle>
          <CardDescription>Lista completa de varejistas ativos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {retailers.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{r.brand_name || r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.email}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{r.operating_regions || 'Sem UF'}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.operating_cities || 'Sem cidade'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
