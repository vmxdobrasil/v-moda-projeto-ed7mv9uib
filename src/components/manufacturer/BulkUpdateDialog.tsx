import { useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Layers } from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import { RecordModel } from 'pocketbase'

export function BulkUpdateDialog({
  projects,
  onUpdated,
}: {
  projects: RecordModel[]
  onUpdated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [wholesale, setWholesale] = useState('')
  const [retail, setRetail] = useState('')
  const [stock, setStock] = useState('')

  const handleBulkUpdate = async () => {
    const updates: Promise<unknown>[] = []
    for (const p of projects) {
      const data: Record<string, number> = {}
      if (wholesale) data.wholesale_price = Number(wholesale)
      if (retail) data.retail_price = Number(retail)
      if (stock) data.stock_quantity = Number(stock)
      if (Object.keys(data).length > 0) {
        updates.push(pb.collection('projects').update(p.id, data))
      }
    }
    if (updates.length === 0) {
      sonnerToast.error('Preencha pelo menos um campo para atualizar.')
      return
    }
    try {
      await Promise.all(updates)
      sonnerToast.success(`${updates.length} produtos atualizados com sucesso!`)
      setOpen(false)
      setWholesale('')
      setRetail('')
      setStock('')
      onUpdated()
    } catch {
      sonnerToast.error('Erro ao atualizar produtos.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          <Layers className="h-4 w-4 mr-2" /> Atualização em Lote
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Atualização em Lote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Atualize {projects.length} produtos de uma vez. Deixe em branco para manter o valor
            atual.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Preço Atacado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={wholesale}
                onChange={(e) => setWholesale(e.target.value)}
                className="rounded-xl"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Preço Varejo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={retail}
                onChange={(e) => setRetail(e.target.value)}
                className="rounded-xl"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Estoque</Label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="rounded-xl"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button className="cta-glow rounded-xl" onClick={handleBulkUpdate}>
            Atualizar Tudo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
