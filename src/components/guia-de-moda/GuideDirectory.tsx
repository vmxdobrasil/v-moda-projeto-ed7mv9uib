import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin, Store, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { QueroRevenderButton } from '@/components/QueroRevenderButton'
import { BrandCatalogDialog } from '@/components/guia-de-moda/BrandCatalogDialog'

const CATEGORIES = [
  { value: 'all', label: 'Todas' },
  { value: 'moda_feminina', label: 'Feminina' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'moda_praia', label: 'Praia' },
  { value: 'moda_fitness', label: 'Fitness' },
  { value: 'moda_masculina', label: 'Masculina' },
  { value: 'plus_size', label: 'Plus Size' },
  { value: 'bijouterias_semijoias', label: 'Acessórios' },
]

const HUBS = [
  { value: 'all', label: 'Todos os Pólos' },
  { value: '44_goiania', label: '44 Goiânia' },
  { value: 'fama_goiania', label: 'Fama Goiânia' },
  { value: 'bras_sp', label: 'Brás SP' },
  { value: 'bom_retiro_sp', label: 'Bom Retiro SP' },
  { value: 'outros', label: 'Outros' },
]

const PER_PAGE = 24

export function GuideDirectory() {
  const [brands, setBrands] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [hub, setHub] = useState('all')
  const [priceLevel, setPriceLevel] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const filters: string[] = ['manufacturer != ""']
    if (category !== 'all') filters.push(`ranking_category = "${category}"`)
    if (hub !== 'all') filters.push(`fashion_hub = "${hub}"`)
    if (priceLevel !== 'all') filters.push(`price_level = "${priceLevel}"`)
    if (search.trim()) filters.push(`name ~ "${search.trim()}"`)
    try {
      const res = await pb.collection('customers').getList(page, PER_PAGE, {
        filter: filters.join(' && '),
        sort: 'name',
        expand: 'category_id',
      })
      setBrands(res.items)
      setTotalPages(res.totalPages)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, category, hub, priceLevel, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('customers', loadData)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-azul/5 p-4 rounded-xl border border-azul/10">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar marca..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 bg-background"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={hub}
          onValueChange={(v) => {
            setHub(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Pólo de Moda" />
          </SelectTrigger>
          <SelectContent>
            {HUBS.map((h) => (
              <SelectItem key={h.value} value={h.value}>
                {h.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Store className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Nenhuma marca encontrada com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Card
              key={brand.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-border/50"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-md">
                  <AvatarImage
                    src={
                      brand.avatar ? pb.files.getURL(brand, brand.avatar, { thumb: '200x200' }) : ''
                    }
                  />
                  <AvatarFallback>
                    <Store className="w-8 h-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-serif text-lg font-medium mb-1 line-clamp-1">{brand.name}</h3>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
                  {brand.city && brand.state && (
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {brand.city}, {brand.state}
                    </span>
                  )}
                  {brand.price_level && (
                    <Badge variant="outline" className="text-azul border-azul/30">
                      {brand.price_level}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 min-h-[2rem]">
                  {brand.bio || 'Sem descrição disponível.'}
                </p>
                <div className="w-full space-y-2 mt-auto">
                  <Button
                    variant="outline"
                    className="w-full text-xs uppercase tracking-wider border-azul/30 text-azul hover:bg-azul/10"
                    onClick={() => setSelectedBrand(brand)}
                  >
                    Ver Catálogo
                  </Button>
                  {brand.manufacturer && (
                    <QueroRevenderButton
                      manufacturerId={brand.manufacturer}
                      brandId={brand.id}
                      brandName={brand.name}
                      phone={brand.phone}
                      className="w-full"
                      size="sm"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground font-medium">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      <BrandCatalogDialog
        brand={selectedBrand}
        open={!!selectedBrand}
        onOpenChange={(o) => !o && setSelectedBrand(null)}
      />
    </div>
  )
}
