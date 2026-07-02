import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import useCartStore from '@/stores/useCartStore'
import { toast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ShoppingCart, Filter } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function Catalog() {
  const [projects, setProjects] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const { addItem } = useCartStore()

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProjects()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search, categoryFilter])

  async function loadProjects() {
    try {
      const conditions: string[] = []
      if (search) conditions.push(`name ~ "${search}"`)
      if (categoryFilter !== 'all') conditions.push(`category = "${categoryFilter}"`)
      const records = await pb.collection('projects').getList(1, 50, {
        filter: conditions.join(' && '),
        expand: 'manufacturer',
      })
      setProjects(records.items)
    } catch (e) {
      console.error(e)
    }
  }

  function getImageUrl(product: any) {
    if (product.gallery) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.gallery}`
    }
    if (product.image) {
      return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${product.collectionId}/${product.id}/${product.image}`
    }
    return `https://img.usecurling.com/p/400/400?q=fashion&color=orange`
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 page-transition">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-muted-foreground mt-1">Explore e adicione itens ao seu carrinho.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-8 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-52 rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="moda_feminina">Moda Feminina</SelectItem>
              <SelectItem value="jeans">Jeans</SelectItem>
              <SelectItem value="moda_praia">Moda Praia</SelectItem>
              <SelectItem value="moda_masculina">Moda Masculina</SelectItem>
              <SelectItem value="moda_fitness">Moda Fitness</SelectItem>
              <SelectItem value="plus_size">Plus Size</SelectItem>
              <SelectItem value="moda_evangelica">Moda Evangélica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Nenhum produto encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              getImageUrl={getImageUrl}
              addItem={addItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({
  product,
  getImageUrl,
  addItem,
}: {
  product: any
  getImageUrl: any
  addItem: any
}) {
  const [size, setSize] = useState<string>('')
  const [color, setColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [open, setOpen] = useState(false)

  const sizesArray = product.sizes ? product.sizes.split(',').map((s: string) => s.trim()) : []
  const colorsArray = product.colors ? product.colors.split(',').map((s: string) => s.trim()) : []

  const handleAdd = () => {
    addItem({ product, size, color, quantity })
    toast({ title: 'Adicionado ao carrinho!' })
    setOpen(false)
  }

  return (
    <Card className="overflow-hidden group">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={getImageUrl(product)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.expand?.manufacturer && (
          <Badge className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm">
            {product.expand.manufacturer.name}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate mb-1">{product.name}</h3>
        <p className="text-orange-600 font-bold text-lg mb-4">
          R$ {(product.price || 0).toFixed(2)}
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{product.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex gap-4 items-center">
                <img src={getImageUrl(product)} alt="" className="w-20 h-20 rounded object-cover" />
                <div className="text-xl font-bold text-orange-600">
                  R$ {(product.price || 0).toFixed(2)}
                </div>
              </div>

              {sizesArray.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tamanho</label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizesArray.map((s: string) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {colorsArray.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cor</label>
                  <Select value={color} onValueChange={setColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cor" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorsArray.map((c: string) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantidade</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <Button
              onClick={handleAdd}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Confirmar Adição
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
