import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight, Store } from 'lucide-react'

function formatPrice(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

interface Props {
  brand: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BrandCatalogDialog({ brand, open, onOpenChange }: Props) {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const itemsPerPage = 4

  useEffect(() => {
    if (!brand || !open) return
    setLoading(true)
    setPage(0)
    pb.collection('projects')
      .getList(1, 8, {
        filter: `manufacturer = "${brand.manufacturer}"`,
        sort: '-created',
      })
      .then((res) => setProjects(res.items))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [brand, open])

  const totalPages = Math.min(2, Math.ceil(projects.length / itemsPerPage))
  const visible = projects.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-serif text-primary">
            Catálogo: {brand?.name}
          </DialogTitle>
          <DialogDescription>
            Confira os destaques da marca e as condições exclusivas de compra.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Store className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum produto cadastrado no catálogo desta marca ainda.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visible.map((project) => (
                  <div key={project.id} className="flex gap-4 border rounded-lg p-3 bg-muted/5">
                    <div className="w-24 h-32 bg-muted rounded-md overflow-hidden shrink-0">
                      <img
                        src={
                          project.image
                            ? pb.files.getURL(project, project.image, { thumb: '100x100' })
                            : '/placeholder.svg'
                        }
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-medium text-sm line-clamp-2 mb-2">{project.name}</h4>
                      {project.wholesale_price ? (
                        <div className="mb-2 p-2 bg-primary/5 rounded border border-primary/10">
                          <span className="text-[10px] uppercase font-bold text-primary tracking-wider block mb-0.5">
                            Atacado
                          </span>
                          <span className="font-semibold text-sm">
                            {formatPrice(project.wholesale_price)}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            Mín. {project.min_quantity_wholesale || 6} peças
                          </span>
                        </div>
                      ) : null}
                      {project.retail_price ? (
                        <div className="p-2 bg-azul/5 rounded border border-azul/10">
                          <span className="text-[10px] uppercase font-bold text-azul tracking-wider block mb-0.5">
                            Varejo
                          </span>
                          <span className="font-semibold text-sm">
                            {formatPrice(project.retail_price)}
                          </span>
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
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground font-medium">
                    Página {page + 1} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
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
  )
}
