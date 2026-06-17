import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, MapPin, Store } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'

const CATEGORY_LABELS: Record<string, string> = {
  moda_feminina: 'TOP 15 MODA FEMININA',
  jeans: 'TOP 10 MODA JEANS',
  moda_praia: 'TOP 5 MODA PRAIA',
  moda_masculina: 'TOP 5 MODA MASCULINA',
  moda_evangelica: 'TOP 5 MODA EVANGELICA',
  plus_size: 'TOP 5 MODA PLUS SIZE',
  moda_country: 'TOP 5 MODA COUNTRY',
  moda_infantil: 'TOP 5 MODA INFANTIL E INFANTO JUVENIL',
  moda_fitness: 'TOP 5 MODA FITNESS',
  bijouterias_semijoias: 'TOP 3 BIJOUTERIAS E SEMI JOIAS',
  calcados: 'TOP 2 CALÇADOS',
}

export default function ManufacturersHub() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pb.collection('customers')
      .getFullList({
        filter: 'ranking_position > 0',
        sort: 'ranking_position',
      })
      .then(setBrands)
      .finally(() => setLoading(false))
  }, [])

  const grouped = brands.reduce(
    (acc, brand) => {
      const cat = brand.ranking_category || 'moda_geral'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(brand)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-fade-in-up">
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center gap-6 border-b pb-8 border-border/50">
        <div className="p-4 bg-primary/10 rounded-full">
          <Store className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2 tracking-tight">Marcas em Destaque</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore as marcas atacadistas líderes e exclusivas, ranqueadas rigorosamente por
            segmento no mercado.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
            const catBrands = grouped[cat]
            if (!catBrands || catBrands.length === 0) return null

            return (
              <div key={cat} className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-7 h-7 text-primary/80" />
                  <h2 className="text-2xl md:text-3xl font-bold font-serif uppercase tracking-tight text-foreground">
                    {label}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {catBrands.map((brand) => (
                    <Card
                      key={brand.id}
                      className="group overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                    >
                      <CardContent className="p-6 relative">
                        <Badge className="absolute top-4 right-4 bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1 shadow-sm">
                          #{brand.ranking_position}
                        </Badge>
                        <div className="flex flex-col items-center text-center mt-6">
                          <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-md group-hover:scale-105 transition-transform duration-500">
                            <AvatarImage
                              src={pb.files.getUrl(brand, brand.avatar, { thumb: '200x200' })}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-xl bg-primary/5 text-primary">
                              {brand.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-bold text-lg mb-2 line-clamp-1">{brand.name}</h3>
                          {brand.city && brand.state && (
                            <div className="flex items-center text-xs text-muted-foreground font-medium mb-3">
                              <MapPin className="w-3 h-3 mr-1 shrink-0" />
                              <span className="truncate">
                                {brand.city}, {brand.state}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
