import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Store, Sparkles } from 'lucide-react'
import { GuiaDeModaCatalog } from '@/components/guia-de-moda/GuiaDeModaCatalog'
import { VallenGuiaChat } from '@/components/guia-de-moda/VallenGuiaChat'
import { useRealtime } from '@/hooks/use-realtime'

export default function GuiaDeModa() {
  const [brands, setBrands] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [hub, setHub] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<any>(null)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const fetchBrands = async () => {
    try {
      const records = await pb.collection('users').getFullList({
        filter: "role = 'manufacturer'",
        sort: '-created',
      })
      setBrands(records)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  useRealtime('users', () => {
    fetchBrands()
  })

  const filtered = brands.filter((b) => {
    if (search && !b.name?.toLowerCase().includes(search.toLowerCase())) return false
    if (hub !== 'all' && b.fashion_hubs !== hub) return false
    return true
  })

  function openCatalog(brand: any) {
    setSelectedBrand(brand)
    setCatalogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      <div className="bg-zinc-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1200/400?q=fashion%20rack&color=black')] opacity-20 mix-blend-overlay object-cover" />
        <div className="container mx-auto max-w-6xl text-center relative z-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Guia de Moda</h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto">
            Explore catálogos de fornecedores, descubra condições para atacado e varejo, e conte com
            nossa IA para curadoria exclusiva.
          </p>
          <Button
            onClick={() => setChatOpen(true)}
            className="mt-8 rounded-full px-6 py-6 bg-primary text-primary-foreground hover:bg-primary/90 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Consultar Vallen IA
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-10 flex-1">
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar marcas pelo nome..."
              className="pl-9 bg-gray-50 border-transparent focus-visible:bg-white"
            />
          </div>
          <Select value={hub} onValueChange={setHub}>
            <SelectTrigger className="w-full md:w-[260px] bg-gray-50 border-transparent">
              <SelectValue placeholder="Pólo de Moda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Pólos</SelectItem>
              <SelectItem value="44_goiania">44 Goiânia</SelectItem>
              <SelectItem value="fama_goiania">Fama Goiânia</SelectItem>
              <SelectItem value="bras_sp">Brás SP</SelectItem>
              <SelectItem value="bom_retiro_sp">Bom Retiro SP</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((brand) => (
            <Card
              key={brand.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-transparent hover:border-primary/20"
              onClick={() => openCatalog(brand)}
            >
              <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                {brand.avatar ? (
                  <img
                    src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/_pb_users_auth_/${brand.id}/${brand.avatar}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={brand.name}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-zinc-50">
                    <Store className="w-12 h-12 mb-2 opacity-30" />
                    <span className="text-sm font-medium">Sem logo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <Button
                    variant="secondary"
                    className="w-full font-bold shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      openCatalog(brand)
                    }}
                  >
                    Ver Catálogo
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 bg-white">
                <h3 className="font-bold text-lg truncate text-gray-900 group-hover:text-primary transition-colors">
                  {brand.name || 'Marca sem nome'}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mt-2 font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                  {brand.fashion_hubs?.replace('_', ' ') || 'Pólo não definido'}
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              <Store className="w-16 h-16 opacity-20 mb-4 text-primary" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhuma marca encontrada</h3>
              <p>Tente ajustar os filtros ou buscar por outro termo.</p>
            </div>
          )}
        </div>
      </div>

      <GuiaDeModaCatalog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        manufacturerId={selectedBrand?.id || null}
        manufacturerName={selectedBrand?.name || ''}
      />

      <VallenGuiaChat open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  )
}
