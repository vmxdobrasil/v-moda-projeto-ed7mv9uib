import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function Index() {
  const [topBrands, setTopBrands] = useState<Record<string, any[]>>({})

  useEffect(() => {
    loadBrands()
  }, [])

  async function loadBrands() {
    try {
      const records = await pb.collection('customers').getFullList({
        filter: 'ranking_position > 0',
        sort: 'ranking_position',
        expand: 'manufacturer',
      })

      const grouped: Record<string, any[]> = {}
      records.forEach((r) => {
        const cat = r.ranking_category || 'outros'
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push(r)
      })

      setTopBrands(grouped)
    } catch (e) {
      console.error(e)
    }
  }

  const categoryLabels: Record<string, string> = {
    moda_feminina: 'TOP 15 Moda Feminina',
    jeans: 'TOP 10 Moda Jeans',
    moda_praia: 'TOP 5 Moda Praia',
    moda_masculina: 'TOP 5 Moda Masculina',
    moda_evangelica: 'TOP 5 Moda Evangélica',
    plus_size: 'TOP 5 Moda Plus Size',
    moda_country: 'TOP 5 Moda Country',
    moda_infantil: 'TOP 5 Moda Infantil',
    moda_fitness: 'TOP 5 Moda Fitness',
    bijouterias_semijoias: 'TOP 3 Bijouterias e Semijoias',
    calcados: 'TOP 2 Calçados',
  }

  function getAvatarUrl(r: any) {
    if (r.avatar)
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${r.collectionId}/${r.id}/${r.avatar}`
    return `https://img.usecurling.com/i?q=fashion&color=multicolor&shape=fill`
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-black text-white py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl space-y-6 animate-fade-in-up">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 hover:bg-primary/30">
            Hub de Compras V MODA
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Encontre as Melhores <span className="text-primary">Marcas</span> do Atacado Brasileiro
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            Descubra fabricantes validados, acesse catálogos digitais e compre no atacado com
            condições exclusivas do V Club.
          </p>
          <div className="pt-6 flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link to="/login">Acesse como Lojista</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 hover:bg-white/10"
              asChild
            >
              <Link to="/revenda">Quero Vender</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto space-y-16">
          {Object.keys(categoryLabels).map((catKey) => {
            const brands = topBrands[catKey]
            if (!brands || brands.length === 0) return null

            return (
              <div key={catKey} className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold uppercase tracking-wide">
                    {categoryLabels[catKey]}
                  </h2>
                  <div className="h-px bg-border flex-1"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {brands.map((brand) => (
                    <Card
                      key={brand.id}
                      className="overflow-hidden hover:border-primary transition-colors group"
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square relative bg-muted overflow-hidden">
                          <img
                            src={getAvatarUrl(brand)}
                            alt={brand.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-2 right-2 bg-black/80 text-primary text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                            #{brand.ranking_position}
                          </div>
                        </div>
                        <div className="p-4 bg-card">
                          <h3 className="font-bold truncate text-lg">{brand.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {brand.city || 'São Paulo'} - {brand.state || 'SP'}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <Badge variant="outline" className="text-xs bg-muted/50">
                              {brand.price_level || '$$'}
                            </Badge>
                            {brand.v_club_status === 'approved' && (
                              <Badge className="bg-primary/10 text-primary border-none text-[10px] hover:bg-primary/20">
                                V Club
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}

          {Object.keys(topBrands).length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              Carregando as melhores marcas do atacado...
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
