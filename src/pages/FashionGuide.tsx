import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, BadgeCheck, MessageCircle, MapPin, Loader2, Trophy } from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FadeIn } from '@/components/FadeIn'
import { BrandCard } from '@/components/BrandCard'

const CATEGORIES = [
  { id: 'all', label: 'Todas as Categorias' },
  { id: 'moda_feminina', label: 'Moda Feminina' },
  { id: 'jeans', label: 'Jeans' },
  { id: 'moda_praia', label: 'Moda Praia' },
  { id: 'moda_geral', label: 'Moda Geral' },
  { id: 'moda_masculina', label: 'Moda Masculina' },
  { id: 'moda_fitness', label: 'Moda Fitness' },
  { id: 'moda_evangelica', label: 'Moda Evangélica' },
  { id: 'moda_country', label: 'Moda Country' },
  { id: 'moda_infantil', label: 'Moda Infantil' },
  { id: 'bijouterias_semijoias', label: 'Bijouterias / Semijoias' },
  { id: 'calcados', label: 'Calçados' },
]

export default function FashionGuide() {
  useSEO({
    title: 'Guia de Moda - Revista Moda Atual Digital',
    description:
      'Explore mais de 1000 marcas no nosso guia exclusivo do Polo de Moda de Goiás. Descubra os melhores fabricantes e revendedores.',
  })

  const [brands, setBrands] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [totalItems, setTotalItems] = useState(0)

  const loadBrands = async (pageNumber: number, reset: boolean = false) => {
    setIsLoading(true)
    try {
      const conditions = []

      // Filter for valid brands to be shown in the directory
      conditions.push(`(status = 'converted' || avatar != '' || name != '')`)

      if (searchTerm) {
        conditions.push(`name ~ "${searchTerm.replace(/"/g, '')}"`)
      }
      if (category !== 'all') {
        conditions.push(`ranking_category = "${category}"`)
      }

      const filterStr = conditions.join(' && ')

      const result = await pb.collection('customers').getList(pageNumber, 24, {
        filter: filterStr,
        sort: 'name',
      })

      if (reset) {
        setBrands(result.items)
      } else {
        setBrands((prev) => {
          const existingIds = new Set(prev.map((b) => b.id))
          const newItems = result.items.filter((b) => !existingIds.has(b.id))
          return [...prev, ...newItems]
        })
      }

      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (e) {
      console.error('Error loading brands', e)
    } finally {
      setIsLoading(false)
    }
  }

  // Load data initially and when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1)
      loadBrands(1, true)
    }, 400)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, category])

  // Keep list updated with realtime changes
  useRealtime('customers', () => {
    loadBrands(1, true)
  })

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1
      setPage(nextPage)
      loadBrands(nextPage, false)
    }
  }

  const handleWhatsAppClick = (e: React.MouseEvent, phone: string, id: string) => {
    e.stopPropagation()
    if (id) {
      pb.send(`/backend/v1/partners/${id}/click`, { method: 'POST' }).catch(console.error)
    }
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank')
    }
  }

  return (
    <main className="w-full min-h-screen bg-muted/10 pb-24 pt-32">
      <section className="bg-background border-b border-border py-16 mb-12">
        <div className="container text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 flex flex-col items-center justify-center gap-4">
              <span className="text-2xl md:text-3xl text-muted-foreground uppercase tracking-widest font-sans font-medium">
                Guia de Moda
              </span>
              <span>Revista Moda Atual Digital</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              O diretório definitivo do Polo de Moda de Goiás. Explore nosso catálogo com mais de
              1000 marcas e encontre os melhores fabricantes e revendedores para o seu negócio.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="container mb-12">
        <FadeIn delay={100}>
          <div className="bg-background p-6 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:flex-1 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Buscar por Nome
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ex: Confecções Silva..."
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            <div className="w-full md:w-72 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Categoria
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="hidden lg:flex h-12 items-center px-4 bg-muted/50 rounded-lg text-sm text-muted-foreground whitespace-nowrap">
              {isLoading && page === 1 ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {totalItems} {totalItems === 1 ? 'marca encontrada' : 'marcas encontradas'}
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="container">
        {brands.length === 0 && !isLoading ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center py-24 text-center bg-background rounded-xl border border-dashed">
              <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-2xl font-serif mb-2">Nenhuma marca encontrada</h3>
              <p className="text-muted-foreground max-w-md">
                Não conseguimos encontrar marcas com os filtros selecionados. Tente buscar por outro
                nome ou mudar a categoria.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setSearchTerm('')
                  setCategory('all')
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand, i) => (
              <FadeIn key={brand.id} delay={(i % 10) * 50}>
                <BrandCard brand={brand} />
              </FadeIn>
            ))}
          </div>
        )}

        {page < totalPages && (
          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="rounded-full px-8 h-12 uppercase tracking-widest text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Carregar Mais Marcas'
              )}
            </Button>
          </div>
        )}
      </section>
    </main>
  )
}
