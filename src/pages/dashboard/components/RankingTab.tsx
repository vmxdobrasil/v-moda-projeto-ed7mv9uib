import { useState } from 'react'
import { Customer, updateCustomer } from '@/services/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Shield, ShieldCheck, Trophy, Trash2, Gift } from 'lucide-react'
import { CustomerBenefits } from '@/components/admin/CustomerBenefits'

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

export default function RankingTab({ customers }: { customers: Customer[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('moda_feminina')
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [benefitsCustomer, setBenefitsCustomer] = useState<Customer | null>(null)

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [assignPosition, setAssignPosition] = useState<string>('1')
  const [assignZone, setAssignZone] = useState('')
  const [isExclusive, setIsExclusive] = useState(true)

  const limitData = CATEGORY_LIMITS[activeCategory]

  const handleAssign = async () => {
    if (!selectedCustomerId) return toast.error('Selecione um parceiro.')
    if (!assignZone.trim()) return toast.error('Informe a zona de exclusividade.')

    const pos = parseInt(assignPosition, 10)

    const posTaken = customers.find(
      (c) => c.ranking_category === activeCategory && c.ranking_position === pos,
    )
    if (posTaken && posTaken.id !== selectedCustomerId) {
      return toast.error(`A posição ${pos} já está ocupada por ${posTaken.name}.`)
    }

    if (isExclusive) {
      const zoneTaken = customers.find(
        (c) =>
          c.ranking_category === activeCategory &&
          c.exclusivity_zone?.toLowerCase() === assignZone.toLowerCase() &&
          c.is_exclusive &&
          c.id !== selectedCustomerId,
      )
      if (zoneTaken) {
        return toast.error(`A zona "${assignZone}" já possui exclusividade com ${zoneTaken.name}.`)
      }
    }

    try {
      await updateCustomer(selectedCustomerId, {
        ranking_category: activeCategory,
        ranking_position: pos,
        exclusivity_zone: assignZone,
        is_exclusive: isExclusive,
      })
      toast.success('Cliente atribuído ao ranking com sucesso!')
      setIsAssignOpen(false)
      setSelectedCustomerId('')
      setAssignZone('')
    } catch (err) {
      toast.error('Erro ao salvar no ranking.')
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Deseja remover este parceiro do ranking?')) return
    try {
      await updateCustomer(id, {
        ranking_category: '',
        ranking_position: null,
        exclusivity_zone: '',
        is_exclusive: false,
      })
      toast.success('Parceiro removido do ranking.')
    } catch (err) {
      toast.error('Erro ao remover.')
    }
  }

  const categoryCustomers = customers.filter((c) => c.ranking_category === activeCategory)

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="w-full sm:w-80">
          <Label className="mb-2 block text-xs font-semibold text-muted-foreground">
            Categoria de Ranking
          </Label>
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LIMITS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogTrigger asChild>
            <Button>
              <Trophy className="w-4 h-4 mr-2" /> Atribuir ao Ranking
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Parceiro - {limitData.label}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Parceiro / Cliente</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um parceiro..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers
                      .filter((c) => c.status !== 'inactive')
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.email || c.phone || 'Sem contato'})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Posição (1 a {limitData.limit})</Label>
                <Select value={assignPosition} onValueChange={setAssignPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: limitData.limit }).map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        #{i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zona de Exclusividade (Cidade/Região)</Label>
                <Input
                  value={assignZone}
                  onChange={(e) => setAssignZone(e.target.value)}
                  placeholder="Ex: São Paulo - Zona Sul"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2 pb-2">
                <Checkbox
                  id="exclusive"
                  checked={isExclusive}
                  onCheckedChange={(c) => setIsExclusive(!!c)}
                />
                <Label
                  htmlFor="exclusive"
                  className="cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Garantir exclusividade territorial nesta zona
                </Label>
              </div>
              <Button className="w-full" onClick={handleAssign}>
                Salvar Ranking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-center">Posição</TableHead>
              <TableHead>Parceiro</TableHead>
              <TableHead>Zona de Exclusividade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Benefícios</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: limitData.limit }).map((_, i) => {
              const pos = i + 1
              const cust = categoryCustomers.find((c) => c.ranking_position === pos)

              return (
                <TableRow key={pos} className={!cust ? 'bg-muted/30' : ''}>
                  <TableCell className="text-center">
                    <span className="font-bold text-lg text-muted-foreground/70">#{pos}</span>
                  </TableCell>
                  <TableCell>
                    {cust ? (
                      <div className="font-medium text-foreground">{cust.name}</div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">Posição Livre</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {cust?.exclusivity_zone ? (
                      <span className="text-sm font-medium">{cust.exclusivity_zone}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {cust?.is_exclusive ? (
                      <Badge
                        variant="default"
                        className="bg-yellow-500 hover:bg-yellow-600 border-none shadow-sm"
                      >
                        <ShieldCheck className="w-3 h-3 mr-1" /> Exclusivo
                      </Badge>
                    ) : cust ? (
                      <Badge variant="secondary" className="border shadow-sm">
                        <Shield className="w-3 h-3 mr-1" /> Normal
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-center">
                    {cust && (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        {Object.values(cust.unlocked_benefits || {}).filter(Boolean).length}/4
                        Ativos
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {cust && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setBenefitsCustomer(cust)}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Esteira de Apoio (Benefícios)"
                        >
                          <Gift className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(cust.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!benefitsCustomer} onOpenChange={(open) => !open && setBenefitsCustomer(null)}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gerenciar Benefícios (Esteira de Apoio)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            {benefitsCustomer && <CustomerBenefits customer={benefitsCustomer} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
