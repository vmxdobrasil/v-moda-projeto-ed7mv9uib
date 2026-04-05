import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, BusFront, ShoppingBag, Search } from 'lucide-react'

const HUB_LABELS: Record<string, string> = {
  '44_goiania': 'Região da 44',
  fama_goiania: 'Setor Fama',
  bras_sp: 'Brás',
  bom_retiro_sp: 'Bom Retiro',
  outros: 'Outros Polos',
}

export default function Affiliates() {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchRegion, setSearchRegion] = useState('')
  const [hubFilter, setHubFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await pb.collection('users').getFullList({
          filter: 'role="affiliate"',
          sort: '-created',
        })
        setAffiliates(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = affiliates.filter((a) => {
    const matchRegion = searchRegion
      ? (a.operating_regions || '').toLowerCase().includes(searchRegion.toLowerCase())
      : true
    const matchHub = hubFilter !== 'all' ? (a.fashion_hubs || []).includes(hubFilter) : true
    return matchRegion && matchHub
  })

  return (
    <div className="container mx-auto py-12 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-serif font-bold">Guias de Turismo de Compras</h1>
        <p className="text-muted-foreground mt-2">
          Encontre guias de turismo de compras por região ou polo de moda.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por região de atuação (ex: Interior de SP, Bahia...)"
              className="pl-9"
              value={searchRegion}
              onChange={(e) => setSearchRegion(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-64">
          <Select value={hubFilter} onValueChange={setHubFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Polo de Moda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Polos</SelectItem>
              {Object.entries(HUB_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground col-span-full">Carregando parceiros...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground col-span-full">
            Nenhum parceiro encontrado com estes filtros.
          </p>
        ) : (
          filtered.map((affiliate) => (
            <Card
              key={affiliate.id}
              className="overflow-hidden hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-3 bg-muted/30">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {affiliate.name || 'Parceiro Sem Nome'}
                    </CardTitle>
                    <CardDescription>{affiliate.email}</CardDescription>
                  </div>
                  {affiliate.is_transporter && (
                    <Badge
                      variant="default"
                      className="bg-primary hover:bg-primary text-xs shrink-0"
                    >
                      <BusFront className="w-3 h-3 mr-1" />
                      Ônibus
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {affiliate.operating_regions && (
                  <div className="space-y-1">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1.5" /> Regiões de Atuação
                    </div>
                    <p className="text-sm pl-5">{affiliate.operating_regions}</p>
                  </div>
                )}
                {affiliate.fashion_hubs && affiliate.fashion_hubs.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <ShoppingBag className="w-4 h-4 mr-1.5" /> Polos Visitados
                    </div>
                    <div className="flex flex-wrap gap-1 pl-5">
                      {affiliate.fashion_hubs.map((hub: string) => (
                        <Badge key={hub} variant="secondary" className="text-[10px]">
                          {HUB_LABELS[hub] || hub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
