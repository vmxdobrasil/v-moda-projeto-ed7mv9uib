import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminCatalog() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pb.collection('projects')
      .getList(1, 40, {
        expand: 'manufacturer,category_id',
        sort: '-created',
      })
      .then((res) => {
        setProducts(res.items)
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
        <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
        <p className="text-muted-foreground">Visão geral do catálogo de produtos.</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando catálogo...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">Nenhum produto no catálogo.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {p.image ? (
                  <img
                    src={pb.files.getUrl(p, p.image, { thumb: '400x400' })}
                    alt={p.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">Sem Imagem</span>
                )}
                {p.stock_quantity === 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive">Esgotado</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <CardTitle className="text-lg line-clamp-1">{p.name}</CardTitle>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">
                    {p.expand?.manufacturer?.name || 'V Moda'}
                  </span>
                  <Badge variant="secondary" className="text-[10px] whitespace-nowrap">
                    {p.expand?.category_id?.name || 'Geral'}
                  </Badge>
                </div>
                <div className="font-semibold text-primary pt-2">
                  R${' '}
                  {p.retail_price
                    ? p.retail_price.toFixed(2)
                    : p.price
                      ? p.price.toFixed(2)
                      : '0.00'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
