import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRealtime } from '@/hooks/use-realtime'
import { Store } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export function GuiaDeModaCatalog({
  open,
  onOpenChange,
  manufacturerId,
  manufacturerName,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  manufacturerId: string | null
  manufacturerName: string
}) {
  const [products, setProducts] = useState<any[]>([])

  const loadData = async () => {
    if (manufacturerId) {
      try {
        const res = await pb.collection('projects').getList(1, 8, {
          filter: `manufacturer = "${manufacturerId}"`,
          sort: '-created',
        })
        setProducts(res.items)
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    if (open) loadData()
    else setProducts([])
  }, [open, manufacturerId])

  useRealtime('projects', () => {
    if (open) loadData()
  })

  if (!open) return null

  const page1 = products.slice(0, 4)
  const page2 = products.slice(4, 8)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] w-[95vw] h-[90vh] md:h-[85vh] p-0 flex flex-col bg-zinc-100 overflow-hidden border-none shadow-2xl rounded-xl">
        <DialogHeader className="p-4 bg-white border-b border-zinc-200 flex-shrink-0 z-10 shadow-sm">
          <DialogTitle className="text-xl font-serif text-gray-800 tracking-wide flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Catálogo - {manufacturerName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth relative">
          <div className="snap-start w-full min-h-full flex items-center justify-center p-4 py-8">
            <CatalogPage items={page1} pageNum={1} />
          </div>
          {products.length > 4 && (
            <div className="snap-start w-full min-h-full flex items-center justify-center p-4 py-8">
              <CatalogPage items={page2} pageNum={2} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CatalogPage({ items, pageNum }: { items: any[]; pageNum: number }) {
  return (
    <div className="bg-white shadow-xl rounded-xl w-full max-w-5xl p-4 md:p-8 flex flex-col min-h-[70vh] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />

      <div className="flex justify-between items-end mb-8 border-b-2 border-primary/20 pb-3">
        <h3 className="text-2xl md:text-3xl font-serif text-gray-800 leading-none">
          Coleção Exclusiva
        </h3>
        <span className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
          Pág {pageNum}/2
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 flex-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 md:gap-5 bg-white p-3 md:p-4 rounded-xl border border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg group"
          >
            <div className="w-1/3 md:w-[150px] aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative shadow-inner">
              {item.image ? (
                <img
                  src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/${item.collectionId}/${item.id}/${item.image}?thumb=300x400`}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Sem Foto
                </div>
              )}
              {item.stock_quantity <= 0 && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                    Esgotado
                  </span>
                </div>
              )}
            </div>
            <div className="w-2/3 flex flex-col justify-between py-1">
              <div>
                <h4 className="font-bold text-base md:text-xl text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {item.name}
                </h4>
                {item.description && (
                  <p className="text-xs md:text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="space-y-2 mt-4">
                <div className="bg-primary/5 p-2.5 rounded-lg border border-primary/20 relative overflow-hidden group-hover:bg-primary/10 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider">
                      Atacado
                    </span>
                  </div>
                  <div className="text-base md:text-lg font-black text-gray-900">
                    R$ {item.wholesale_price?.toFixed(2) || '---'}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 font-medium">
                    Mínimo: {item.min_quantity_wholesale || 1} peças
                  </div>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Varejo
                    </span>
                  </div>
                  <div className="text-sm md:text-base font-bold text-gray-700">
                    R$ {item.retail_price?.toFixed(2) || '---'}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-400 mt-0.5">Sem mínimo</div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center text-gray-400 py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Store className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Nenhum produto nesta página</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <div className="flex gap-2">
          <div className={`w-2 h-2 rounded-full ${pageNum === 1 ? 'bg-primary' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${pageNum === 2 ? 'bg-primary' : 'bg-gray-300'}`} />
        </div>
      </div>
    </div>
  )
}
