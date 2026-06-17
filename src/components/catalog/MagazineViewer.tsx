import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export function MagazineViewer({
  open,
  onOpenChange,
  manufacturerId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  manufacturerId: string
}) {
  const [pages, setPages] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (open && manufacturerId) {
      loadPages()
    }
  }, [open, manufacturerId])

  async function loadPages() {
    try {
      const res = await pb.collection('projects').getFullList({
        filter: `manufacturer = "${manufacturerId}"`,
        sort: 'created',
      })
      const slots = Array(8).fill(null)
      res.forEach((p, i) => {
        if (i < 8) slots[i] = p
      })
      setPages(slots)
      setCurrentIndex(0)
    } catch (e) {
      console.error(e)
    }
  }

  if (!open) return null

  const isMobile = window.innerWidth < 768

  function getImageUrl(record: any, filename: string) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${filename}`
  }

  function renderPage(page: any, index: number) {
    if (!page) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted/30 text-muted-foreground border-2 border-dashed">
          Página em branco
        </div>
      )
    }

    const isCover = index === 0

    if (isCover) {
      return (
        <div className="w-full h-full relative group bg-white shadow-xl">
          <img
            src={getImageUrl(page, page.image)}
            className="w-full h-full object-cover"
            alt="Cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
            <h2 className="text-3xl font-bold uppercase">{page.name}</h2>
            <p className="opacity-90">{page.description}</p>
          </div>
        </div>
      )
    }

    const galleryImages = page.gallery || []
    const allImages = [page.image, ...galleryImages].slice(0, 4)

    return (
      <div className="w-full h-full bg-white flex flex-col shadow-xl overflow-hidden">
        <div className="p-4 bg-muted/10 border-b">
          <h3 className="text-lg font-bold">{page.name}</h3>
          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
            <span>R$ {page.wholesale_price?.toFixed(2)}</span>
            <span>Mín: {page.min_quantity_wholesale} un</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-gray-100">
          {allImages.map((img: string, i: number) => (
            <img
              key={i}
              src={getImageUrl(page, img)}
              className="w-full h-full object-cover"
              alt=""
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden bg-zinc-900 border-none flex flex-col">
        <DialogHeader className="p-4 bg-black/50 text-white flex flex-row items-center justify-between border-b border-zinc-800">
          <DialogTitle className="text-xl font-light tracking-widest text-white">
            CATÁLOGO DIGITAL
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-y-auto">
          {isMobile ? (
            <div className="flex flex-col gap-6 w-full h-max pb-10">
              {pages.map((p, i) => (
                <div key={i} className="w-full aspect-[3/4] flex-shrink-0">
                  {renderPage(p, i)}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-3xl aspect-[3/4] relative flex items-center justify-center">
              <div className="w-full h-full transition-transform duration-500">
                {renderPage(pages[currentIndex], currentIndex)}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="absolute -left-16 top-1/2 -translate-y-1/2 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/80 hover:text-white"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute -right-16 top-1/2 -translate-y-1/2 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/80 hover:text-white"
                onClick={() => setCurrentIndex((prev) => Math.min(7, prev + 1))}
                disabled={currentIndex === 7}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
