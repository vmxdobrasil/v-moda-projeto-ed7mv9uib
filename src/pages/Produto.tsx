import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Package, Tag, Truck, Check } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigation } from '@/hooks/use-navigation'
import { ROUTES, type ProdutoRouteParams } from '@/lib/routes'

interface Product {
  id: string
  name: string
  description: string
  price: number
  wholesale_price: number
  retail_price: number
  stock_quantity: number
  colors: string
  sizes: string
  category: string
  image: string
}

export default function Produto() {
  const { id } = useParams<ProdutoRouteParams>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { voltar, navegar } = useNavigation()

  useEffect(() => {
    if (!id) {
      setError('ID do produto não fornecido.')
      setLoading(false)
      return
    }
    const fetchProduct = async () => {
      try {
        const record = await pb.collection('projects').getOne(id)
        setProduct(record as unknown as Product)
      } catch {
        setError('Produto não encontrado.')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Package className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{error || 'Produto não encontrado'}</h1>
        <p className="text-muted-foreground mb-6">
          O produto que você procura pode ter sido removido ou não está disponível.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => voltar()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={() => navegar(ROUTES.explorar)}>Explorar Produtos</Button>
        </div>
      </div>
    )
  }

  const imageUrl = product.image
    ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/projects/${product.id}/${product.image}`
    : null
  const colors =
    product.colors
      ?.split(',')
      .map((c) => c.trim())
      .filter(Boolean) || []
  const sizes =
    product.sizes
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => voltar()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-muted-foreground">Detalhes do Produto</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-24 h-24 text-muted-foreground/30" />
          )}
          {product.category && (
            <Badge className="absolute top-4 left-4 capitalize" variant="secondary">
              {product.category.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex items-baseline gap-3">
            {product.retail_price && product.retail_price > 0 ? (
              <>
                <span className="text-3xl font-bold text-primary">
                  R$ {product.retail_price.toFixed(2).replace('.', ',')}
                </span>
                {product.price && product.price !== product.retail_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">
                R$ {(product.price || 0).toFixed(2).replace('.', ',')}
              </span>
            )}
            {product.wholesale_price && product.wholesale_price > 0 && (
              <Badge variant="outline" className="ml-auto">
                Atacado: R$ {product.wholesale_price.toFixed(2).replace('.', ',')}
              </Badge>
            )}
          </div>

          {colors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Cores
              </h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <Badge key={color} variant="secondary">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Tamanhos</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <Badge key={size} variant="outline">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            {product.stock_quantity > 0 ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">Em estoque</span>
                <span className="text-muted-foreground">({product.stock_quantity} unidades)</span>
              </>
            ) : (
              <span className="text-red-500 font-medium">Fora de estoque</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
            <Truck className="w-4 h-4" />
            <span>Envio para todo o Brasil</span>
          </div>

          <div className="flex gap-3 mt-2">
            <Button className="flex-1" size="lg" disabled={product.stock_quantity <= 0}>
              <ShoppingBag className="w-5 h-5 mr-2" />
              Adicionar ao Carrinho
            </Button>
            <Button variant="outline" size="lg" onClick={() => navegar(ROUTES.explorar)}>
              Ver Mais
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
