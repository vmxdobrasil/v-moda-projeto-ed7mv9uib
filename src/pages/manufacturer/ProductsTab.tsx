import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/data'
import { Download } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Project } from '@/services/projects'

export function ProductsTab({ manufacturerName }: { manufacturerName: string }) {
  const [products, setProducts] = useState<Project[]>([])
  const [viewMode, setViewMode] = useState<'wholesale' | 'retail'>('wholesale')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) return

      const items = await pb.collection('projects').getFullList<Project>({
        filter: `manufacturer = "${userId}"`,
        sort: '-created',
      })
      setProducts(items)
    } catch (err) {
      console.error(err)
    }
  }

  const exportCSV = () => {
    const headers = [
      'ID',
      'Produto',
      'Preço Atacado',
      'Preço Varejo',
      'Qtd Min. Atacado',
      'Estoque',
    ]
    const rows = products.map(
      (p) =>
        `"${p.id}","${p.name}",${p.wholesale_price || 0},${p.retail_price || p.price || 0},${p.min_quantity_wholesale || 1},${p.stock_quantity || 0}`,
    )
    const csv = [headers.join(','), ...rows].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'catalogo-produtos.csv'
    link.click()
  }

  return (
    <Card className="animate-in fade-in zoom-in-95 duration-300">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>Catálogo de Produtos</CardTitle>
          <CardDescription>
            Gerencie seu catálogo e alternância de preços B2B e B2C.
          </CardDescription>
        </div>
        <Button onClick={exportCSV} variant="outline" className="shrink-0">
          <Download className="w-4 h-4 mr-2" /> Exportar Catálogo CSV
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as 'wholesale' | 'retail')}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wholesale">Visão Atacado (B2B)</TabsTrigger>
              <TabsTrigger value="retail">Visão Varejo (B2C)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>{viewMode === 'wholesale' ? 'Preço Atacado' : 'Preço Varejo'}</TableHead>
                {viewMode === 'wholesale' && <TableHead>Qtd. Mínima</TableHead>}
                <TableHead>Estoque Disponível</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum produto cadastrado em seu catálogo.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={pb.files.getUrl(p, p.image, { thumb: '100x100' })}
                            alt={p.name}
                            className="w-10 h-10 rounded-md object-cover bg-secondary"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                            Sem Img
                          </div>
                        )}
                        <span className="line-clamp-1">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {viewMode === 'wholesale'
                        ? formatPrice(p.wholesale_price || 0)
                        : formatPrice(p.retail_price || p.price || 0)}
                    </TableCell>
                    {viewMode === 'wholesale' && (
                      <TableCell>{p.min_quantity_wholesale || 1} un.</TableCell>
                    )}
                    <TableCell>
                      <span
                        className={
                          p.stock_quantity && p.stock_quantity > 5
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }
                      >
                        {p.stock_quantity || 0} un.
                      </span>
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
