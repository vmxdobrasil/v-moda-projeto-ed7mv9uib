import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Collections() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [priceMode, setPriceMode] = useState<'retail' | 'wholesale'>('retail')

  const [categories, setCategories] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      pb.collection('categories').getFullList({ sort: 'name' }),
      pb.collection('projects').getFullList({ sort: '-created', expand: 'category_id' }),
    ])
      .then(([cats, projs]) => {
        setCategories(cats)
        setProjects(projs)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const clearFilters = () => {
    setActiveCategory('all')
    if (searchQuery) {
      setSearchParams({})
    }
  }

  const filteredProjects = useMemo(() => {
    let result = [...projects]

    if (searchQuery) {
      result = result.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (activeCategory !== 'all') {
      result = result.filter(
        (p) => p.category_id === activeCategory || p.category === activeCategory,
      )
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
    }

    return result
  }, [projects, activeCategory, searchQuery, sortBy])

  const FilterSidebar = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-serif text-lg mb-4">Categorias</h3>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => setActiveCategory('all')}
              className={`text-sm tracking-wide transition-colors ${activeCategory === 'all' ? 'font-medium text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Todas as Categorias
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setActiveCategory(cat.id)}
                className={`text-sm tracking-wide transition-colors ${activeCategory === cat.id ? 'font-medium text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {(searchQuery || activeCategory !== 'all') && (
        <Button
          variant="ghost"
          className="w-full text-xs uppercase tracking-widest"
          onClick={clearFilters}
        >
          Limpar Filtros <X className="ml-2 h-3 w-3" />
        </Button>
      )}
    </div>
  )

  return (
    <div className="pt-32 pb-24 container min-h-screen">
      <FadeIn>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Coleções'}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {searchQuery
              ? 'Confira as coleções encontradas com base na sua busca.'
              : 'Descubra nossa seleção completa de peças e projetos de luxo, gerenciados diretamente por nossos fabricantes.'}
          </p>
        </div>
      </FadeIn>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-border gap-4">
        <p className="text-sm text-muted-foreground">{filteredProjects.length} Resultados</p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden w-full sm:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto gap-2 rounded-none uppercase tracking-widest text-xs"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader className="mb-8 text-left">
                  <SheetTitle className="font-serif text-2xl">Filtrar por</SheetTitle>
                </SheetHeader>
                <FilterSidebar />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
            {/* Price Toggle */}
            <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-full">
              <Label
                htmlFor="price-mode"
                className={`text-xs cursor-pointer ${priceMode === 'retail' ? 'text-primary font-bold' : 'text-muted-foreground'}`}
              >
                Varejo
              </Label>
              <Switch
                id="price-mode"
                checked={priceMode === 'wholesale'}
                onCheckedChange={(c) => setPriceMode(c ? 'wholesale' : 'retail')}
              />
              <Label
                htmlFor="price-mode"
                className={`text-xs cursor-pointer ${priceMode === 'wholesale' ? 'text-primary font-bold' : 'text-muted-foreground'}`}
              >
                Atacado
              </Label>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                Ordenar por:
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-9 text-xs uppercase tracking-widest rounded-none bg-transparent border-border">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="text-sm">
                    Mais Recentes
                  </SelectItem>
                  <SelectItem value="oldest" className="text-sm">
                    Mais Antigos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-32">
            <FilterSidebar />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="py-20 text-center text-muted-foreground">Carregando coleções...</div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-12">
              {filteredProjects.map((project, i) => {
                const displayPrice =
                  priceMode === 'wholesale' ? project.wholesale_price : project.retail_price
                return (
                  <FadeIn key={project.id} delay={i * 50}>
                    <Card className="overflow-hidden group flex flex-col h-full rounded-none border-border/50 hover:border-primary/50 transition-colors">
                      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                        <img
                          src={pb.files.getUrl(project, project.image, { thumb: '600x800' })}
                          alt={project.name}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                        />
                        {project.expand?.category_id && (
                          <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 text-[10px] uppercase tracking-wider">
                            {project.expand.category_id.name}
                          </div>
                        )}
                      </div>
                      <CardHeader className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <CardTitle className="font-serif text-lg">{project.name}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {project.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                          <p className="font-medium text-primary">
                            {displayPrice
                              ? `R$ ${displayPrice.toFixed(2).replace('.', ',')}`
                              : 'Preço sob consulta'}
                          </p>
                          {priceMode === 'wholesale' && project.wholesale_price && (
                            <span className="text-[9px] text-accent font-bold uppercase tracking-wider bg-accent/10 px-1.5 py-0.5 rounded">
                              Atacado
                            </span>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  </FadeIn>
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground text-lg">
                Nenhum projeto encontrado nesta categoria.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-none uppercase tracking-widest text-xs"
                onClick={clearFilters}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
