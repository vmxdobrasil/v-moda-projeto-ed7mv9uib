import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { getGlobalTopLimit, setGlobalTopLimit, removeFromTop } from '@/services/curatorship'
import { PromoteBrandDialog } from '@/components/admin/PromoteBrandDialog'
import { Trophy, Crown, Plus } from 'lucide-react'
import { RecordModel } from 'pocketbase'

const CATS = [
  { value: 'all', label: 'Todas' },
  { value: 'moda_feminina', label: 'Feminina' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'moda_praia', label: 'Praia' },
  { value: 'moda_fitness', label: 'Fitness' },
  { value: 'moda_masculina', label: 'Masculina' },
  { value: 'plus_size', label: 'Plus Size' },
  { value: 'moda_evangelica', label: 'Evangélica' },
  { value: 'moda_country', label: 'Country' },
  { value: 'moda_infantil', label: 'Infantil' },
  { value: 'bijouterias_semijoias', label: 'Acessórios' },
  { value: 'calcados', label: 'Calçados' },
]
const CAT_LABELS: Record<string, string> = Object.fromEntries(
  CATS.filter((c) => c.value !== 'all').map((c) => [c.value, c.label]),
)

export default function AdminTopBrands() {
  const [topBrands, setTopBrands] = useState<RecordModel[]>([])
  const [candidates, setCandidates] = useState<RecordModel[]>([])
  const [globalLimit, setGlobalLimitState] = useState(60)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [promoteTarget, setPromoteTarget] = useState<RecordModel | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [top, cand, limit] = await Promise.all([
        pb
          .collection('customers')
          .getFullList({ filter: 'ranking_position > 0', sort: 'ranking_position' }),
        pb.collection('customers').getList(1, 20, {
          filter: 'ranking_position = 0 && is_verified = true',
          sort: '-created',
        }),
        getGlobalTopLimit(),
      ])
      setTopBrands(top)
      setCandidates(cand.items)
      setGlobalLimitState(limit)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('customers', loadData)

  const handleGlobalLimitChange = async (limit: number) => {
    try {
      await setGlobalTopLimit(limit)
      setGlobalLimitState(limit)
      toast({ title: `Limite global atualizado para TOP ${limit}` })
    } catch {
      toast({ title: 'Erro ao atualizar limite', variant: 'destructive' })
    }
  }

  const updateField = async (id: string, field: string, value: any, label: string) => {
    try {
      await pb.collection('customers').update(id, { [field]: value })
      toast({ title: `${label} atualizada` })
      loadData()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeFromTop(id)
      toast({ title: 'Marca removida do TOP' })
      loadData()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const filteredTop =
    categoryFilter === 'all'
      ? topBrands
      : topBrands.filter((b) => b.ranking_category === categoryFilter)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Top Marcas</h1>
        <Card className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium">Limite Global:</span>
            <Select
              value={String(globalLimit)}
              onValueChange={(v) => handleGlobalLimitChange(parseInt(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">TOP 60</SelectItem>
                <SelectItem value="100">TOP 100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filtrar por categoria" />
        </SelectTrigger>
        <SelectContent>
          {CATS.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-orange-500" /> Marcas no TOP ({filteredTop.length}/
            {globalLimit})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Posição</TableHead>
                <TableHead>Exclusiva</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTop.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={brand.ranking_category || ''}
                      onValueChange={(v) =>
                        updateField(brand.id, 'ranking_category', v, 'Categoria')
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATS.filter((c) => c.value !== 'all').map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="w-20"
                      defaultValue={brand.ranking_position}
                      onBlur={(e) =>
                        updateField(
                          brand.id,
                          'ranking_position',
                          parseInt(e.target.value) || 0,
                          'Posição',
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={brand.is_exclusive}
                      onCheckedChange={(v) =>
                        updateField(brand.id, 'is_exclusive', v, 'Exclusividade')
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleRemove(brand.id)}>
                      Remover do TOP
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTop.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma marca no TOP.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marcas Candidatas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {candidates.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.name}</span>
                  <Badge variant="outline">
                    {CAT_LABELS[c.ranking_category] || 'Sem categoria'}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setPromoteTarget(c)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Promover ao TOP
                </Button>
              </div>
            ))}
            {candidates.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhuma marca candidata.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <PromoteBrandDialog
        brand={promoteTarget}
        open={!!promoteTarget}
        onOpenChange={(o) => !o && setPromoteTarget(null)}
        onPromoted={loadData}
      />
    </div>
  )
}
