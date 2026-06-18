import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Store, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { VallenGuiaModaChat } from '@/components/guia-de-moda/VallenGuiaModaChat'

function formatPrice(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export default function GuiaDeModa() {
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchState, setSearchState] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [loading, setLoading] = useState(true)

  const [selectedBrand, setSelectedBrand] = useState<any | null>(null)
  const [brandProjects, setBrandProjects] = useState<any[]>([])
  const [catalogPage, setCatalogPage] = useState(0)
  const [catalogLoading, setCatalogLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const cats = await pb.collection('categories').getFullList({ sort: 'name' })
        setCategories(cats)

        const customers = await pb.collection('customers').getFullList({
          filter: 'manufacturer != ""',
          sort: 'name',
          expand: 'category_id',
        })
        setBrands(customers)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredBrands = brands.filter((b) => {
    if (selectedCategory !== 'all') {
      if (b.category_id !== selectedCategory && b.ranking_category !== selectedCategory) {
        return false
      }
    }
    if (searchState && !b.state?.toLowerCase().includes(searchState.toLowerCase())) return false
    if (searchCity && !b.city?.toLowerCase().includes(searchCity.toLowerCase())) return false
    return true
  })

  const openCatalog = async (brand: any) => {
    setSelectedBrand(brand)
    setCatalogPage(0)
    setBrandProjects([])
    setCatalogLoading(true)
    try {
      const projects = await pb.collection('projects').getList(1, 8, {
        filter: `manufacturer = "${brand.manufacturer}"`,
        sort: '-created',
      })
      setBrandProjects(projects.items)
    } catch (err) {
      console.error(err)
    } finally {
      setCatalogLoading(false)
    }
  }

  const itemsPerPage = 4
  const totalPages = Math.min(2, Math.ceil(brandProjects.length / itemsPerPage))
  const visibleProjects = brandProjects.slice(
    catalogPage * itemsPerPage,
    (catalogPage + 1) * itemsPerPage,
  )

  return (
    <div className="container py-12 animate-fade-in mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Guia de Moda</h1>
          <p className="text-muted-foreground">
            Descubra as melhores marcas, acesse catálogos e consulte condições de atacado e varejo.
          </p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2 rounded-full shadow-lg h-12 px-6 hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
              Falar com Vallen
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0 border-none">
            <VallenGuiaModaChat />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-muted/30 p-4 rounded-xl border">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Categoria
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Estado (UF)
          </label>
          <Input
            placeholder="Ex: SP"
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
            maxLength={2}
            className="bg-background"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Cidade
          </label>
          <Input
            placeholder="Buscar por cidade..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="bg-background"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Store className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Nenhuma marca encontrada com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBrands.map((brand) => (
            <Card
              key={brand.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <CardContent className="p-0">
                <div className="h-24 bg-muted flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 group-hover:scale-110 transition-transform duration-500" />
                  <Avatar className="w-16 h-16 border-4 border-background shadow-sm absolute -bottom-8">
                    <AvatarImage
                      src={
                        brand.avatar
                          ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/customers/${brand.id}/${brand.avatar}`
                          : ''
                      }
                    />
                    <AvatarFallback>
                      <Store className="w-6 h-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="pt-10 pb-6 px-6 text-center">
                  <h3 className="font-semibold text-lg line-clamp-1 mb-1">{brand.name}</h3>
                  <div className="flex items-center justify-center text-xs text-muted-foreground mb-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    {brand.city || 'Cidade não inf.'} - {brand.state || 'UF'}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-xs uppercase tracking-wider"
                    onClick={() => openCatalog(brand)}
                  >
                    Ver Catálogo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedBrand} onOpenChange={(open) => !open && setSelectedBrand(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-serif text-primary">
              Catálogo: {selectedBrand?.name}
            </DialogTitle>
            <DialogDescription>
              Confira os destaques da marca e as condições exclusivas de compra.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {catalogLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : brandProjects.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p>Nenhum produto cadastrado no catálogo desta marca ainda.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visibleProjects.map((project) => (
                    <div key={project.id} className="flex gap-4 border rounded-lg p-3 bg-muted/5">
                      <div className="w-24 h-32 bg-muted rounded-md overflow-hidden shrink-0">
                        <img
                          src={
                            project.image
                              ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/projects/${project.id}/${project.image}?thumb=100x100`
                              : '/placeholder.svg'
                          }
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-medium text-sm line-clamp-2 mb-2">{project.name}</h4>

                        {project.wholesale_price || project.price ? (
                          <div className="mb-2 p-2 bg-primary/5 rounded border border-primary/10">
                            <span className="text-[10px] uppercase font-bold text-primary tracking-wider block mb-0.5">
                              Atacado
                            </span>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">
                                {formatPrice(project.wholesale_price || project.price)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Mínimo {project.min_quantity_wholesale || 6} peças
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {project.retail_price ? (
                          <div className="p-2 bg-accent/5 rounded border border-accent/10">
                            <span className="text-[10px] uppercase font-bold text-accent tracking-wider block mb-0.5">
                              Varejo
                            </span>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">
                                {formatPrice(project.retail_price)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">Sem mínimo</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCatalogPage((p) => Math.max(0, p - 1))}
                      disabled={catalogPage === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                    </Button>
                    <span className="text-xs text-muted-foreground font-medium">
                      Página {catalogPage + 1} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCatalogPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={catalogPage === totalPages - 1}
                    >
                      Próxima <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
