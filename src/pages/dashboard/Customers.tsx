import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Filter } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { format } from 'date-fns'

export default function DashboardCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('')

  const loadData = async () => {
    try {
      const records = await pb.collection('customers').getFullList({
        sort: '-created',
      })
      setCustomers(records)
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

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search)
    const matchesSource = sourceFilter === 'all' || c.source === sourceFilter
    const matchesBrand =
      !brandFilter ||
      (c.whatsapp_group_name || '').toLowerCase().includes(brandFilter.toLowerCase())
    return matchesSearch && matchesSource && matchesBrand
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads / Clientes</h1>
        <p className="text-muted-foreground">
          Gestão de leads com informações detalhadas de origem e marca.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>Refine a lista de clientes capturados.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full md:w-[250px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por Origem" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Origens</SelectItem>
              <SelectItem value="whatsapp_group">Grupos de WhatsApp</SelectItem>
              <SelectItem value="social_profile">Perfil Social (FB/IG)</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Filtrar por Loja/Marca..."
            className="w-full md:w-[250px]"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-muted-foreground bg-muted/50 border-b uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome / Telefone</th>
                  <th className="px-6 py-4 font-medium">Origem</th>
                  <th className="px-6 py-4 font-medium">Origem (Loja/Marca)</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Data Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                      Carregando leads...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum lead encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{c.name || 'Sem Nome'}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {c.phone || 'Sem telefone'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">
                          {(c.source || 'manual').replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {c.whatsapp_group_name ? (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                          >
                            {c.whatsapp_group_name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={c.status === 'new' ? 'default' : 'secondary'}>
                          {c.status || 'new'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {c.created ? format(new Date(c.created), 'dd/MM/yyyy HH:mm') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
