import { useState, useMemo } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { FadeIn } from '@/components/FadeIn'
import { ProductCard } from '@/components/ProductCard'
import { PRODUCTS } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Todos', 'Vestidos', 'Casacos', 'Calças', 'Acessórios', 'Calçados']
const SIZES = ['P', 'M', 'G', 'GG', '36', '38', '40', '42', 'Único']
const COLORS = [
  { name: 'Preto', value: '#000000' },
  { name: 'Branco', value: '#FFFFFF' },
  { name: 'Bege', value: '#F5F5DC' },
  { name: 'Dourado', value: '#C5A059' },
  { name: 'Marrom', value: '#8B4513' },
]

export default function Collections() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')

  const toggleColor = (colorHex: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorHex) ? prev.filter((c) => c !== colorHex) : [...prev, colorHex],
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    )
  }

  const clearFilters = () => {
    setActiveCategory('Todos')
    setSelectedColors([])
    setSelectedSizes([])
  }

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS]

    if (activeCategory !== 'Todos') {
      result = result.filter((p) => p.category === activeCategory)
    }

    if (selectedColors.length > 0) {
      result = result.filter((p) => p.colors.some((c) => selectedColors.includes(c)))
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)))
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [activeCategory, selectedColors, selectedSizes, sortBy])

  const FilterSidebar = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-serif text-lg mb-4">Categorias</h3>
        <ul className="space-y-3">
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => setActiveCategory(cat)}
                className={`text-sm tracking-wide transition-colors ${activeCategory === cat ? 'font-medium text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Accordion type="multiple" defaultValue={['cores', 'tamanhos']} className="w-full">
        <AccordionItem value="cores" className="border-b-0">
          <AccordionTrigger className="font-serif text-lg py-4 hover:no-underline">
            Cores
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-3 pt-2">
              {COLORS.map((color) => {
                const isSelected = selectedColors.includes(color.value)
                return (
                  <button
                    key={color.name}
                    onClick={() => toggleColor(color.value)}
                    className={cn(
                      'w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      isSelected
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-border',
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="tamanhos" className="border-b-0">
          <AccordionTrigger className="font-serif text-lg py-4 hover:no-underline">
            Tamanho
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size)
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'px-3 py-1 border text-xs tracking-wider transition-colors hover:border-primary hover:bg-primary/5',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                        : 'border-border text-foreground',
                    )}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {(activeCategory !== 'Todos' || selectedColors.length > 0 || selectedSizes.length > 0) && (
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
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Coleções</h1>
          <p className="text-muted-foreground max-w-2xl">
            Descubra nossa seleção completa de peças ready-to-wear e acessórios de luxo, projetados
            para a vida moderna.
          </p>
        </div>
      </FadeIn>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-border gap-4">
        <p className="text-sm text-muted-foreground">{filteredProducts.length} Resultados</p>

        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-none uppercase tracking-widest text-xs"
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

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              Ordenar por:
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-9 text-xs uppercase tracking-widest rounded-none bg-transparent border-border">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="text-sm">
                  Lançamentos
                </SelectItem>
                <SelectItem value="price-asc" className="text-sm">
                  Menor Preço
                </SelectItem>
                <SelectItem value="price-desc" className="text-sm">
                  Maior Preço
                </SelectItem>
              </SelectContent>
            </Select>
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
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {filteredProducts.map((product, i) => (
                <FadeIn key={product.id} delay={i * 50}>
                  <ProductCard product={product} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground text-lg">
                Nenhum produto encontrado nesta coleção.
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
