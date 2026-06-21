import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { Search, Loader2, Store, Users, Globe, Edit2, Trash2 } from 'lucide-react'
import { Label } from '@/components/ui/label'

const formatPrice = (p: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p)

export default function AdminPricing() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [adjustments, setAdjustments] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const projs = await pb.collection('projects').getFullList({ sort: '-created' })
      setProjects(projs)

      const adjs = await pb
        .collection('price_adjustments')
        .getFullList({ filter: `merchant="${user.id}"`, expand: 'customer' })
      setAdjustments(adjs)

      const custs = await pb
        .collection('customers')
        .getFullList({ filter: `manufacturer="${user.id}"` })
      setCustomers(custs)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 p-6 pb-20 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestão de Preços</h1>
          <p className="text-muted-foreground mt-1">
            Configure suas margens de lucro e preços personalizados.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Catálogo de Produtos</CardTitle>
              <CardDescription>Margem padrão sugerida: 120% sobre o atacado.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Preço Atacado</TableHead>
                    <TableHead>Preço Varejo (Padrão)</TableHead>
                    <TableHead>Regras Ativas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((proj) => {
                    const wp = proj.wholesale_price || 0
                    const defaultRetail = wp * 2.2
                    const productAdjs = adjustments.filter((a) => a.project === proj.id)

                    return (
                      <TableRow key={proj.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {proj.image && (
                              <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={pb.files.getURL(proj, proj.image, { thumb: '100x100' })}
                                  alt={proj.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <span className="truncate max-w-[200px] block" title={proj.name}>
                              {proj.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatPrice(wp)}</TableCell>
                        <TableCell>{formatPrice(defaultRetail)}</TableCell>
                        <TableCell>
                          {productAdjs.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {productAdjs.map((a) => (
                                <span
                                  key={a.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                                >
                                  {a.customer ? 'Cliente' : a.is_zone_wide ? 'Zona' : 'Geral'}:{' '}
                                  {formatPrice(a.adjusted_price)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Padrão (120%)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <PricingManagerDialog
                            project={proj}
                            adjustments={productAdjs}
                            customers={customers}
                            onUpdate={fetchData}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredProjects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum produto encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PricingManagerDialog({
  project,
  adjustments,
  customers,
  onUpdate,
}: {
  project: any
  adjustments: any[]
  customers: any[]
  onUpdate: () => void
}) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<'all' | 'zone' | 'customer'>('all')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [priceStr, setPriceStr] = useState('')
  const [loading, setLoading] = useState(false)

  const wp = project.wholesale_price || 0
  const defaultRetail = wp * 2.2

  const handleSave = async () => {
    const price = parseFloat(priceStr.replace(',', '.'))
    if (isNaN(price) || price < wp) {
      toast({
        title: 'Preço inválido',
        description: `O preço deve ser no mínimo o valor de atacado (${formatPrice(wp)}).`,
        variant: 'destructive',
      })
      return
    }

    if (scope === 'customer' && !selectedCustomer) {
      toast({ title: 'Aviso', description: 'Selecione um cliente.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const data = {
        merchant: user!.id,
        project: project.id,
        customer: scope === 'customer' ? selectedCustomer : null,
        is_zone_wide: scope === 'zone',
        adjusted_price: price,
      }

      const existing = adjustments.find(
        (a) =>
          (scope === 'all' && !a.customer && !a.is_zone_wide) ||
          (scope === 'zone' && a.is_zone_wide) ||
          (scope === 'customer' && a.customer === selectedCustomer),
      )

      if (existing) {
        await pb.collection('price_adjustments').update(existing.id, data)
      } else {
        await pb.collection('price_adjustments').create(data)
      }

      toast({ title: 'Preço salvo com sucesso' })
      setPriceStr('')
      setOpen(false)
      onUpdate()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta regra de preço?')) return
    try {
      await pb.collection('price_adjustments').delete(id)
      toast({ title: 'Regra removida' })
      onUpdate()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit2 className="w-4 h-4" /> Ajustar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajustar Preço - {project.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg mb-4">
          <div>
            <Label className="text-xs text-muted-foreground">Preço Atacado</Label>
            <div className="font-semibold text-lg">{formatPrice(wp)}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Sugestão Padrão (120%)</Label>
            <div className="font-semibold text-lg text-primary">{formatPrice(defaultRetail)}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold border-b pb-2">Nova Regra de Preço</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Escopo da Regra</Label>
              <Select value={scope} onValueChange={(v: any) => setScope(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o escopo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Aplicar a Todos</SelectItem>
                  <SelectItem value="zone">Minha Zona de Exclusividade</SelectItem>
                  <SelectItem value="customer">Cliente Específico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scope === 'customer' && (
              <div className="space-y-2">
                <Label>Selecione o Cliente</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                    {customers.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nenhum cliente
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Novo Preço de Varejo (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min={wp}
              placeholder={defaultRetail.toFixed(2)}
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Regra
          </Button>
        </div>

        {adjustments.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold border-b pb-2">Regras Ativas</h4>
            <div className="space-y-2">
              {adjustments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between bg-muted/30 p-2 px-3 rounded text-sm border"
                >
                  <div className="flex items-center gap-2">
                    {a.customer ? (
                      <Users className="w-4 h-4 text-blue-500" />
                    ) : a.is_zone_wide ? (
                      <Globe className="w-4 h-4 text-green-500" />
                    ) : (
                      <Store className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="font-medium">
                      {a.customer
                        ? `Cliente: ${a.expand?.customer?.name || a.customer}`
                        : a.is_zone_wide
                          ? 'Zona de Exclusividade'
                          : 'Todos os Clientes'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatPrice(a.adjusted_price)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(a.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
