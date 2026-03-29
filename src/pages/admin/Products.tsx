import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image: string
  description: string
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Vestido Seda Longo',
    category: 'Vestidos',
    price: 1250.0,
    stock: 15,
    image: 'https://img.usecurling.com/p/100/100?q=silk%20dress',
    description: 'Vestido de seda elegante para festas.',
  },
  {
    id: '2',
    name: 'Blazer Alfaiataria',
    category: 'Casacos',
    price: 1500.0,
    stock: 8,
    image: 'https://img.usecurling.com/p/100/100?q=blazer',
    description: 'Blazer com corte impecável.',
  },
  {
    id: '3',
    name: 'Calça Pantalona',
    category: 'Calças',
    price: 890.0,
    stock: 20,
    image: 'https://img.usecurling.com/p/100/100?q=pants',
    description: 'Calça pantalona confortável e elegante.',
  },
  {
    id: '4',
    name: 'Camisa Linho',
    category: 'Camisas',
    price: 450.0,
    stock: 5,
    image: 'https://img.usecurling.com/p/100/100?q=linen%20shirt',
    description: 'Camisa de linho puro, leve e fresca.',
  },
]

export default function Products() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    image: '',
    description: '',
  })

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData(product)
    } else {
      setEditingProduct(null)
      setFormData({ name: '', category: '', price: 0, stock: 0, image: '', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (
      !formData.name ||
      !formData.category ||
      !formData.price ||
      !formData.stock ||
      !formData.image
    ) {
      toast({ description: 'Preencha todos os campos obrigatórios.', variant: 'destructive' })
      return
    }

    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? ({ ...p, ...formData } as Product) : p)),
      )
      toast({ description: 'Produto atualizado com sucesso!' })
    } else {
      const newProduct = { ...formData, id: Math.random().toString(36).substr(2, 9) } as Product
      setProducts([...products, newProduct])
      toast({ description: 'Produto adicionado com sucesso!' })
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      setProducts(products.filter((p) => p.id !== id))
      toast({ description: 'Produto removido com sucesso!' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciar Produtos</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Adicione, edite ou remova produtos do catálogo.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Catálogo de Produtos</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Miniatura</TableHead>
                  <TableHead>Nome do Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead className="text-center w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-md border"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      R$ {product.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock < 10 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
                      >
                        {product.stock} un
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenModal(product)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do produto abaixo. Os campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Vestido Floral"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  id="category"
                  placeholder="Ex: Vestidos"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Estoque *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">URL da Imagem *</Label>
              <Input
                id="image"
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Detalhes do produto..."
                className="resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Produto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
