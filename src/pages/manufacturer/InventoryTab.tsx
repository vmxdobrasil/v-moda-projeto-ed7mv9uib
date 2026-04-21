import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
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
import { Search, Save, Download } from 'lucide-react'
import type { Project } from '@/services/projects'

export function InventoryTab({ manufacturerName }: { manufacturerName: string }) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [inventory, setInventory] = useState<Project[]>([])

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    const userId = pb.authStore.record?.id
    if (!userId) return
    try {
      const items = await pb.collection('projects').getFullList<Project>({
        filter: `manufacturer = "${userId}"`,
        sort: '-created',
      })
      setInventory(items)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleStockChange = (id: string, value: string) => {
    setInventory(
      inventory.map((item) =>
        item.id === id ? { ...item, stock_quantity: parseInt(value) || 0 } : item,
      ),
    )
  }

  const handleSave = async (id: string) => {
    try {
      const item = inventory.find((i) => i.id === id)
      if (!item) return

      await pb.collection('projects').update(id, { stock_quantity: item.stock_quantity })
      toast({
        title: 'Estoque Atualizado',
        description: 'As alterações foram salvas com sucesso.',
      })
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const exportCSV = () => {
    const headers = ['ID', 'Produto', 'Estoque Atual']
    const rows = filteredInventory.map((p) => `"${p.id}","${p.name}",${p.stock_quantity || 0}`)
    const csv = [headers.join(','), ...rows].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'relatorio-estoque.csv'
    link.click()
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-end">
        <div>
          <h2 className="text-2xl font-serif mb-1">Gestão de Estoque</h2>
          <p className="text-muted-foreground text-sm">
            Atualize os níveis de estoque dos seus produtos no sistema.
          </p>
        </div>
        <Button onClick={exportCSV} variant="secondary">
          <Download className="w-4 h-4 mr-2" /> Exportar Inventário CSV
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="hidden sm:table-cell">ID Referência</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Quantidade</TableHead>
              <TableHead className="w-[100px] text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">
                  {item.id}
                </TableCell>
                <TableCell>
                  {(item.stock_quantity || 0) < 5 ? (
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
                    value={item.stock_quantity || 0}
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
