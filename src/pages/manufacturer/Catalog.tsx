import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Layers,
  LayoutGrid,
  Image as ImageIcon,
  Trash2,
  Edit2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const MAX_PAGES = 8
const PRODUCTS_PER_PAGE = 4
const MAX_PRODUCTS = MAX_PAGES * PRODUCTS_PER_PAGE

export default function ManufacturerCatalog() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchProducts = async () => {
    if (!user?.id) return
    try {
      const records = await pb.collection('projects').getFullList({
        filter: `manufacturer = "${user.id}"`,
        sort: '-created',
      })
      setProducts(records)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [user])

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalProducts = products.length
  const pagesUsed = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
  const isFull = totalProducts >= MAX_PRODUCTS

  const deleteProduct = async (id: string) => {
    try {
      await pb.collection('projects').delete(id)
      setProducts(products.filter((p) => p.id !== id))
      toast({ title: 'Produto removido do catálogo.' })
    } catch (err) {
      toast({ title: 'Erro ao remover produto.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo Digital</h1>
          <p className="text-muted-foreground">
            Gerencie sua vitrine de alta conversão (Máx 8 páginas).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/#/manufacturer/messages')}
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            Pedir Curadoria IA
          </Button>
          <AddProductDialog onAdded={fetchProducts} disabled={isFull} />
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="space-y-2 flex-1 w-full">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Páginas Utilizadas
                </span>
                <span>
                  {pagesUsed} / {MAX_PAGES} Páginas
                </span>
              </div>
              <Progress value={(pagesUsed / MAX_PAGES) * 100} className="h-3" />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{totalProducts} produtos cadastrados</span>
                <span>Máximo de {MAX_PRODUCTS} produtos</span>
              </div>
            </div>
            {isFull && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-100/50 p-3 rounded-lg">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">
                  Seu catálogo está cheio. Remova itens antigos para adicionar novos ou use a IA
                  para curadoria.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar no catálogo..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from({ length: Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) }).map(
            (_, pageIndex) => {
              const pageProducts = filteredProducts.slice(
                pageIndex * PRODUCTS_PER_PAGE,
                (pageIndex + 1) * PRODUCTS_PER_PAGE,
              )
              return (
                <div key={pageIndex} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Página {pageIndex + 1}
                    </Badge>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {pageProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden group">
                        <div className="aspect-[3/4] relative bg-muted flex items-center justify-center">
                          {product.image ? (
                            <img
                              src={pb.files.getURL(product, product.image)}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {product.category || 'Sem Categoria'}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-bold">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(product.wholesale_price || 0)}
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              Min: {product.min_quantity_wholesale || 1} un
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            },
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
              <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
              <p>Nenhum produto encontrado no seu catálogo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AddProductDialog({ onAdded, disabled }: { onAdded: () => void; disabled: boolean }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('manufacturer', user.id)

    try {
      await pb.collection('projects').create(formData)
      toast({ title: 'Produto adicionado com sucesso!' })
      setOpen(false)
      onAdded()
    } catch (err: any) {
      toast({
        title: 'Erro ao adicionar produto',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar ao Catálogo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Produto</Label>
            <Input name="name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço Atacado (R$)</Label>
              <Input name="wholesale_price" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label>Quantidade Mínima</Label>
              <Input name="min_quantity_wholesale" type="number" defaultValue="6" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Imagem (Obrigatório)</Label>
            <Input name="image" type="file" accept="image/*" required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
