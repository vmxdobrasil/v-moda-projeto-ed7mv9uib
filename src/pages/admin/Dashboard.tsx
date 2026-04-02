import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MapPin, Users, Award, ShieldCheck } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  status?: string
  ranking_category?: string
  ranking_position?: number
  is_exclusive?: boolean
  exclusivity_zone?: string
}

const CATEGORY_LIMITS: Record<string, { label: string; limit: number }> = {
  moda_feminina: { label: 'TOP 15 MODA FEMININA', limit: 15 },
  jeans: { label: 'TOP 10 JEANS', limit: 10 },
  moda_praia: { label: 'TOP 5 MODA PRAIA', limit: 5 },
  moda_geral: { label: 'TOP 5 MODA (Geral)', limit: 5 },
  moda_masculina: { label: 'TOP 5 MODA MASCULINA', limit: 5 },
  moda_evangelica: { label: 'TOP 5 MODA EVANGÉLICA', limit: 5 },
  moda_country: { label: 'TOP 5 MODA COUNTRY', limit: 5 },
  moda_infantil: { label: 'TOP 5 MODA INFANTIL', limit: 5 },
  bijouterias_semijoias: { label: 'TOP 3 BIJOUTERIAS E SEMIJOIAS', limit: 3 },
  calcados: { label: 'TOP 2 CALÇADOS', limit: 2 },
}

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await pb.collection('customers').getFullList<Customer>({
        sort: '-created',
      })
      setCustomers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => {
    loadData()
  })

  const { categoriesOccupancy, occupiedZones, totalExclusives } = useMemo(() => {
    const occupancy: Record<string, number> = {}
    Object.keys(CATEGORY_LIMITS).forEach((k) => (occupancy[k] = 0))

    const zones: Array<{
      zone: string
      category: string
      customerName: string
      isExclusive: boolean
    }> = []
    let exclusives = 0

    customers.forEach((c) => {
      if (
        c.ranking_category &&
        CATEGORY_LIMITS[c.ranking_category] &&
        c.ranking_position &&
        c.ranking_position > 0
      ) {
        occupancy[c.ranking_category]++
      }

      if (c.is_exclusive || (c.ranking_position && c.ranking_position > 0)) {
        exclusives++
      }

      if (c.exclusivity_zone) {
        zones.push({
          zone: c.exclusivity_zone,
          category: c.ranking_category || 'N/A',
          customerName: c.name,
          isExclusive: c.is_exclusive || false,
        })
      }
    })

    return { categoriesOccupancy: occupancy, occupiedZones: zones, totalExclusives: exclusives }
  }, [customers])

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-fade-in">
        Carregando dashboard macro...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Ocupação</h1>
        <p className="text-muted-foreground">
          Monitore a ocupação de categorias exclusivas e zonas territoriais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Revendedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revendedores TOP / Exclusivos</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalExclusives}</div>
            <p className="text-xs text-muted-foreground">Integrantes das categorias TOP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zonas de Exclusividade</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedZones.length}</div>
            <p className="text-xs text-muted-foreground">Territórios mapeados</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold tracking-tight mt-10 mb-4">Ocupação das Categorias TOP</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(CATEGORY_LIMITS).map(([key, { label, limit }]) => {
          const count = categoriesOccupancy[key] || 0
          const percentage = Math.min(100, Math.round((count / limit) * 100))
          const isFull = count >= limit

          return (
            <Card key={key} className={isFull ? 'border-yellow-500/50 bg-yellow-500/5' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="truncate">{label}</span>
                  {isFull && <ShieldCheck className="w-4 h-4 text-yellow-600 shrink-0" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline mb-2">
                  <span className={`text-2xl font-bold ${isFull ? 'text-yellow-700' : ''}`}>
                    {count}
                  </span>
                  <span className="text-sm text-muted-foreground">/ {limit} vagas</span>
                </div>
                <Progress value={percentage} className={`h-2 ${isFull ? 'bg-yellow-500' : ''}`} />
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {percentage}% ocupado
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <h2 className="text-xl font-bold tracking-tight mt-10 mb-4">
        Mapa de Zonas de Exclusividade
      </h2>
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {occupiedZones.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground col-span-full">
                Nenhuma zona de exclusividade registrada até o momento.
              </div>
            ) : (
              occupiedZones.map((z, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="mt-1 bg-primary/10 p-2 rounded-full shrink-0">
                    {z.isExclusive ? (
                      <ShieldCheck className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <MapPin className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-base truncate">{z.zone}</p>
                    <p className="text-sm text-foreground truncate mt-0.5">{z.customerName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {CATEGORY_LIMITS[z.category]?.label || 'Categoria Indefinida'}
                      </Badge>
                      {z.isExclusive && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-yellow-600 border-yellow-200 bg-yellow-50"
                        >
                          Exclusivo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
