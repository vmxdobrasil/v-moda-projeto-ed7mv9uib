import { useState, useEffect } from 'react'
import { Search, Sparkles, TrendingUp, Package } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useNavigation } from '@/hooks/use-navigation'
import { ROUTES, buildProdutoRoute } from '@/lib/routes'

interface Category {
  id: string
  name: string
  slug: string
}

interface Project {
  id: string
  name: string
  description: string
  price: number
  category: string
}

const CATEGORY_ICONS: Record<string, string> = {
  moda_feminina: '👗',
  jeans: '👖',
  moda_praia: '🏖️',
  moda_masculina: '👔',
  moda_fitness: '🏋️',
  plus_size: '💃',
  moda_evangelica: '🙏',
  moda_country: '🤠',
  moda_infantil: '🧸',
  bijouterias_semijoias: '💎',
  calcados: '👠',
  moda_geral: '🛍️',
}

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Moda Feminina', slug: 'moda_feminina' },
  { id: '2', name: 'Jeans', slug: 'jeans' },
  { id: '3', name: 'Moda Praia', slug: 'moda_praia' },
  { id: '4', name: 'Moda Masculina', slug: 'moda_masculina' },
  { id: '5', name: 'Moda Fitness', slug: 'moda_fitness' },
  { id: '6', name: 'Plus Size', slug: 'plus_size' },
]

const MOCK_PRODUCTS: Project[] = [
  {
    id: '1',
    name: 'Vestido Floral Primavera',
    description: 'Vestido leve e elegante',
    price: 89.9,
    category: 'moda_feminina',
  },
  {
    id: '2',
    name: 'Calça Jeans Slim Fit',
    description: 'Jeans de alta qualidade',
    price: 129.9,
    category: 'jeans',
  },
  {
    id: '3',
    name: 'Biquíni Verão Tropical',
    description: 'Conjunto de praia estampado',
    price: 79.9,
    category: 'moda_praia',
  },
  {
    id: '4',
    name: 'Camisa Social Masculina',
    description: 'Camisa elegante para o trabalho',
    price: 99.9,
    category: 'moda_masculina',
  },
  {
    id: '5',
    name: 'Conjunto Fitness Pro',
    description: 'Tecido respirável e confortável',
    price: 159.9,
    category: 'moda_fitness',
  },
  {
    id: '6',
    name: 'Vestido Plus Size Elegance',
    description: 'Estilo e conforto em todos os tamanhos',
    price: 119.9,
    category: 'plus_size',
  },
  {
    id: '7',
    name: 'Blazer Premium',
    description: 'Blazer estruturado para ocasiões especiais',
    price: 199.9,
    category: 'moda_feminina',
  },
  {
    id: '8',
    name: 'Jaqueta Jeans Destroyed',
    description: 'Jeans moderno com detalhes rasgados',
    price: 179.9,
    category: 'jeans',
  },
]

export default function Explorar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { navegar } = useNavigation()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await pb.collection('categories').getFullList({ sort: 'name' })
        setCategories(cats as unknown as Category[])
        const prods = await pb.collection('projects').getList(1, 12, { sort: '-created' })
        setProducts(prods.items as unknown as Project[])
      } catch {
        setCategories(MOCK_CATEGORIES)
        setProducts(MOCK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = products.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <Badge variant="secondary">Catálogo Completo</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Explorar Moda</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Descubra as melhores marcas e produtos do ecossistema V Moda Brasil
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Categorias
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navegar(`${ROUTES.explorar}?categoria=${cat.slug}`)}
                className="group relative aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border p-4 flex flex-col items-center justify-center gap-2 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 hover:scale-105"
              >
                <span className="text-3xl">{CATEGORY_ICONS[cat.slug] || '🛍️'}</span>
                <span className="text-sm font-medium text-center capitalize">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          Produtos em Destaque
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse h-80" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">Nenhum produto encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow duration-300"
                onClick={() => navegar(buildProdutoRoute(product.id))}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                  <Package className="w-12 h-12 text-muted-foreground/50 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs capitalize">
                    {product.category?.replace(/_/g, ' ') || 'Geral'}
                  </Badge>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                  </p>
                  <p className="font-bold text-primary">
                    R$ {(product.price || 0).toFixed(2).replace('.', ',')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
