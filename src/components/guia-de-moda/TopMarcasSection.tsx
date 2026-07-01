import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Crown, MapPin, Store, ToggleLeft } from 'lucide-react'
import { getGlobalTopLimit } from '@/services/curatorship'
import { QueroRevenderButton } from '@/components/QueroRevenderButton'
import { BrandCatalogDialog } from '@/components/guia-de-moda/BrandCatalogDialog'

const CATS = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'moda_feminina', label: 'Feminina' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'moda_praia', label: 'Praia' },
  { value: 'moda_fitness', label: 'Fitness' },
  { value: 'plus_size', label: 'Plus Size' },
]

export function TopMarcasSection() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [topLimit, setTopLimit] = useState(60)
  const [showTop100, setShowTop100] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const limit = await getGlobalTopLimit()
        setTopLimit(limit)
        const res = await pb.collection('customers').getFullList({
          filter: 'ranking_position > 0',
          sort: 'ranking_position',
          expand: 'category_id',
        })
        setBrands(res)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const effectiveLimit = showTop100 ? 100 : Math.min(topLimit, 60)
  const filtered =
    category === 'all'
      ? brands.filter((b) => b.ranking_position <= effectiveLimit)
      : brands.filter(
          (b) => b.ranking_category === category && b.ranking_position <= effectiveLimit,
        )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/10 to-azul/10 p-4 rounded-xl border border-primary/20">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-64 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Modo TOP {effectiveLimit}
          </span>
          <Button
            variant={showTop100 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowTop100(!showTop100)}
            className={showTop100 ? 'bg-azul text-azul-foreground' : 'border-azul/30 text-azul'}
          >
            <ToggleLeft className="w-4 h-4 mr-2" />
            {showTop100 ? 'TOP 100 ATIVO' : 'Ver TOP 100'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Crown className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Nenhuma marca no ranking ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((brand) => (
            <Card
              key={brand.id}
              className={`overflow-hidden hover:shadow-xl transition-all duration-300 group ${
                brand.ranking_position <= 10 ? 'border-primary/40 bg-primary/5' : 'border-border/50'
              }`}
            >
              <CardContent className="p-6 flex flex-col items-center text-center relative">
                {brand.ranking_position <= 10 && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-primary-foreground shadow-sm">
                      <Crown className="w-3 h-3 mr-1" />#{brand.ranking_position}
                    </Badge>
                  </div>
                )}
                <div className="absolute top-3 left-3 text-2xl font-serif font-bold text-muted-foreground/30">
                  {brand.ranking_position}
                </div>
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
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 min-h-[2rem]">
                  {brand.bio || 'Marca verificada no TOP V MODA.'}
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

      <BrandCatalogDialog
        brand={selectedBrand}
        open={!!selectedBrand}
        onOpenChange={(o) => !o && setSelectedBrand(null)}
      />
    </div>
  )
}
