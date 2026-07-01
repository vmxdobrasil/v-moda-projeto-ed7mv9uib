import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { promoteToTop } from '@/services/curatorship'
import { useToast } from '@/hooks/use-toast'

const CATEGORIES = [
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

export function PromoteBrandDialog({
  brand,
  open,
  onOpenChange,
  onPromoted,
}: {
  brand: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onPromoted: () => void
}) {
  const [category, setCategory] = useState('')
  const [position, setPosition] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePromote = async () => {
    if (!category) {
      toast({ title: 'Selecione uma categoria', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const result = await promoteToTop(
        brand.id,
        category,
        position ? parseInt(position) : undefined,
      )
      if (result.waitlisted) {
        toast({ title: 'Categoria lotada!', description: 'Marca adicionada à lista de espera.' })
      } else {
        toast({ title: 'Marca promovida ao TOP!' })
      }
      onPromoted()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro ao promover', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promover ao TOP — {brand?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Posição (opcional)</Label>
            <Input
              type="number"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Próxima disponível"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handlePromote}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? 'Promovendo...' : 'Promover ao TOP'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
