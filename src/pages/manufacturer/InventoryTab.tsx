import { useState } from 'react'
import { PRODUCTS } from '@/lib/data'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Search, Save } from 'lucide-react'

export function InventoryTab({ manufacturerName }: { manufacturerName: string }) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')

  // Create mock inventory state
  const [inventory, setInventory] = useState(() => {
    return PRODUCTS.filter((p) => p.manufacturer === manufacturerName || !manufacturerName).map(
      (p, i) => ({
        id: p.id,
        name: p.name,
        sku: `SKU-${p.id.toUpperCase()}-${1000 + i}`,
        stock: i === 1 ? 3 : 24 + i * 5, // mock some low stock
      }),
    )
  })

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleStockChange = (id: string, value: string) => {
    setInventory(
      inventory.map((item) => (item.id === id ? { ...item, stock: parseInt(value) || 0 } : item)),
    )
  }

  const handleSave = (id: string) => {
    toast({
      title: 'Estoque Atualizado',
      description: 'As alterações foram salvas com sucesso.',
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-serif mb-1">Gestão de Estoque</h2>
        <p className="text-muted-foreground text-sm">
          Atualize os níveis de estoque dos seus produtos no sistema.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou SKU..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Quantidade</TableHead>
              <TableHead className="w-[100px] text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                <TableCell>
                  {item.stock < 5 ? (
                    <Badge
                      variant="destructive"
                      className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
                    >
                      Estoque Baixo
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-600 border-green-500/20"
                    >
                      Em Estoque
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.stock}
                    onChange={(e) => handleStockChange(item.id, e.target.value)}
                    className="h-8 w-24"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => handleSave(item.id)}>
                    <Save className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredInventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
