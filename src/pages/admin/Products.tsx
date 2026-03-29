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
import { Plus, Edit2, Trash2, Search, Upload, Download } from 'lucide-react'
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
    stock: 3,
    image: 'https://img.usecurling.com/p/100/100?q=linen%20shirt',
    description: 'Camisa de linho puro, leve e fresca.',
  },
]

export default function Products() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [importText, setImportText] = useState('')

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

  const handleImport = () => {
    try {
      let parsedProducts: Partial<Product>[] = []

      if (importText.trim().startsWith('[')) {
        parsedProducts = JSON.parse(importText)
      } else {
        const lines = importText.split('\n').filter((line) => line.trim())
        parsedProducts = lines.slice(1).map((line) => {
          const [id, name, category, price, stock, image] = line.split(',')
          return {
            id: id || Math.random().toString(36).substr(2, 9),
            name: name?.trim(),
            category: category?.trim(),
            price: Number(price),
            stock: Number(stock),
            image: image?.trim() || 'https://img.usecurling.com/p/100/100?q=product',
            description: '',
          }
        })
      }

      if (!parsedProducts.length) throw new Error('Nenhum dado válido.')

      let updatedProducts = [...products]
      let added = 0
      let updated = 0

      parsedProducts.forEach((p) => {
        if (!p.name || !p.price) return
        const existingIdx = updatedProducts.findIndex((ex) => ex.id === p.id || ex.name === p.name)
        if (existingIdx >= 0) {
          updatedProducts[existingIdx] = { ...updatedProducts[existingIdx], ...p } as Product
          updated++
        } else {
          updatedProducts.push({
            id: p.id || Math.random().toString(36).substr(2, 9),
            name: p.name,
            category: p.category || 'Geral',
            price: p.price,
            stock: p.stock || 0,
            image: p.image || 'https://img.usecurling.com/p/100/100?q=product',
            description: p.description || '',
          })
          added++
        }
      })

      setProducts(updatedProducts)
      toast({ description: `Importação concluída: ${added} adicionados, ${updated} atualizados.` })
      setIsImportModalOpen(false)
      setImportText('')
    } catch (err) {
      toast({
        description: 'Erro ao processar dados. Verifique o formato.',
        variant: 'destructive',
      })
    }
  }

  const downloadTemplate = () => {
    const csvContent =
      'id,name,category,price,stock,image\nPROD-01,Novo Vestido,Vestidos,450.00,10,https://img.usecurling.com/p/100/100?q=dress'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo_importacao.csv'
    a.click()
    URL.revokeObjectURL(url)
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>
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
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock <= 5 ? 'bg-destructive/10 text-destructive' : product.stock < 10 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
                        >
                          {product.stock} un
                        </span>
                        {product.stock <= 5 && (
                          <span className="bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                            Estoque Baixo
                          </span>
                        )}
                      </div>
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

      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Importação em Lote</DialogTitle>
            <DialogDescription>
              Cole abaixo os dados em formato CSV ou JSON para adicionar ou atualizar produtos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Formato CSV: id,name,category,price,stock,image
              </span>
              <Button variant="link" onClick={downloadTemplate} className="h-auto p-0">
                <Download className="w-4 h-4 mr-1" />
                Baixar Modelo
              </Button>
            </div>
            <Textarea
              placeholder="Cole os dados aqui..."
              className="font-mono text-xs"
              rows={10}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImport}>Processar Importação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
