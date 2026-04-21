import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Search, ShoppingBag } from 'lucide-react'

export default function Index() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isWholesale, setIsWholesale] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [prods, cats] = await Promise.all([
          pb.collection('projects').getList(1, 50, {
            expand: 'category_id',
            sort: '-created',
          }),
          pb.collection('categories').getFullList({ sort: 'name' }),
        ])
        setProducts(prods.items)
        setCategories(cats)
      } catch (err) {
        // Error is silently handled in UI
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Hero Banner */}
      <div className="bg-primary/5 border-b relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1200/400?q=fashion')] bg-cover bg-center opacity-10" />
        <div className="container relative z-10 py-16 md:py-24 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground">
            Descubra as Últimas Tendências
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conectando os melhores fabricantes a lojistas e revendedores.
          </p>
        </div>
      </div>

      <div className="container py-8 flex flex-col gap-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-6 items-center bg-card p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center space-x-3 bg-secondary/50 px-4 py-2 rounded-full border">
              <Label htmlFor="price-mode" className="cursor-pointer text-sm font-medium">
                Varejo
              </Label>
              <Switch id="price-mode" checked={isWholesale} onCheckedChange={setIsWholesale} />
              <Label
                htmlFor="price-mode"
                className="cursor-pointer text-sm font-medium text-primary"
              >
                Atacado
              </Label>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="rounded-full shrink-0"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className="rounded-full shrink-0"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} to={`/produto/${product.id}`} className="group">
                <Card className="h-full flex flex-col overflow-hidden border-transparent hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {product.image ? (
                      <img
                        src={pb.files.getURL(product, product.image)}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    {isWholesale && product.min_quantity_wholesale && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-md">
                        Min. {product.min_quantity_wholesale}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="mb-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        {product.expand?.category_id?.name || product.category || 'Moda'}
                      </p>
                      <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </div>
                    <div className="mt-auto pt-4 flex items-end justify-between">
                      <div>
                        {isWholesale ? (
                          <>
                            <p className="text-xl font-bold text-foreground">
                              {formatCurrency(product.wholesale_price || product.price)}
                            </p>
                            <p className="text-[10px] text-primary uppercase font-medium tracking-wider mt-0.5">
                              Preço Atacado
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xl font-bold text-foreground">
                              {formatCurrency(product.retail_price || product.price)}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                              Preço Varejo
                            </p>
                          </>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground mt-2">Tente ajustar seus filtros de busca.</p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
