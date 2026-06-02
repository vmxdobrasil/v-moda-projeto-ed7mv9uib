import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pb.collection('projects')
      .getFullList({
        expand: 'manufacturer,category_id',
        sort: '-created',
      })
      .then((res) => {
        setProducts(res)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <p className="text-muted-foreground">Gerencie os produtos cadastrados no sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Produtos</CardTitle>
          <CardDescription>{products.length} produtos encontrados.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço Varejo</TableHead>
                  <TableHead>Preço Atacado</TableHead>
                  <TableHead>Estoque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.expand?.manufacturer?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {p.expand?.category_id?.name || p.category || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.retail_price ? `R$ ${p.retail_price.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {p.wholesale_price ? `R$ ${p.wholesale_price.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>{p.stock_quantity || 0}</TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum produto cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
