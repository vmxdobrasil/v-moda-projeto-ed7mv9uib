import { useState } from 'react'
import { Filter, SlidersHorizontal } from 'lucide-react'
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

  const filteredProducts = PRODUCTS.filter(
    (p) => activeCategory === 'Todos' || p.category === activeCategory,
  )

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
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  className="w-8 h-8 rounded-full border border-border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="tamanhos" className="border-b-0">
          <AccordionTrigger className="font-serif text-lg py-4 hover:no-underline">
            Tamanho
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  className="px-3 py-1 border border-border text-xs tracking-wider transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {size}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <p className="text-sm text-muted-foreground">{filteredProducts.length} Produtos</p>

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
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="mb-8 text-left">
                <SheetTitle className="font-serif text-2xl">Filtrar por</SheetTitle>
              </SheetHeader>
              <FilterSidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sort (Mock) */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <select className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer">
            <option>Novidades</option>
            <option>Preço: Menor para Maior</option>
            <option>Preço: Maior para Menor</option>
          </select>
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {filteredProducts.map((product, i) => (
                <FadeIn key={product.id} delay={i * 50}>
                  <ProductCard product={product} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground text-lg">
                Nenhum produto encontrado nesta categoria.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-none"
                onClick={() => setActiveCategory('Todos')}
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
