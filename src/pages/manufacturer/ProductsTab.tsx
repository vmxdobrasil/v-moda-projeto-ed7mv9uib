import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useProductStore } from '@/stores/useProductStore'
import { formatPrice } from '@/lib/data'

export function ProductsTab({ manufacturerName }: { manufacturerName: string }) {
  const { products, updateWholesalePrices } = useProductStore()
  const { toast } = useToast()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkValue, setBulkValue] = useState('')
  const [bulkType, setBulkType] = useState('percentage')

  const myProducts = useMemo(
    () => products.filter((p) => p.manufacturer === manufacturerName),
    [products, manufacturerName],
  )

  const toggleAll = () => {
    if (selectedIds.size === myProducts.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(myProducts.map((p) => p.id)))
  }

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleApply = () => {
    if (selectedIds.size === 0) {
      toast({ title: 'Nenhum produto selecionado', variant: 'destructive' })
      return
    }
    const val = parseFloat(bulkValue)
    if (isNaN(val)) {
      toast({ title: 'Valor inválido', variant: 'destructive' })
      return
    }

    if (
      window.confirm(
        `Tem certeza que deseja aplicar esta alteração em ${selectedIds.size} produtos?`,
      )
    ) {
      updateWholesalePrices(Array.from(selectedIds), bulkType as any, val)
      toast({ title: 'Preços atualizados com sucesso!' })
      setSelectedIds(new Set())
      setBulkValue('')
    }
  }

  return (
    <Card className="animate-in fade-in zoom-in-95 duration-300">
      <CardHeader>
        <CardTitle>Meus Produtos</CardTitle>
        <CardDescription>Gerencie os preços de atacado dos seus produtos em massa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg items-end">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Ação em Massa</label>
            <div className="flex gap-2">
              <Select value={bulkType} onValueChange={setBulkType}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Ajuste Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Preço Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Ex: 10 ou -10"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="w-[120px] bg-background"
              />
            </div>
          </div>
          <Button onClick={handleApply} disabled={selectedIds.size === 0}>
            Aplicar em {selectedIds.size} itens
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.size === myProducts.length && myProducts.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Preço Varejo</TableHead>
                <TableHead>Preço Atacado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                myProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(p.id)}
                        onCheckedChange={() => toggleOne(p.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-8 h-8 rounded-sm object-cover"
                        />
                        {p.name}
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(p.price)}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      {p.wholesalePrice ? formatPrice(p.wholesalePrice) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
