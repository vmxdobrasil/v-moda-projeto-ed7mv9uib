import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSearchParams } from 'react-router-dom'

export default function DashboardProjects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewOpen, setIsNewOpen] = useState(searchParams.get('new') === 'true')

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsNewOpen(true)
      searchParams.delete('new')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])
  const [editingProject, setEditingProject] = useState<any | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    retail_price: '',
    wholesale_price: '',
    stock_quantity: '',
  })
  const [file, setFile] = useState<File | null>(null)

  const CATEGORIES = [
    { value: 'moda_feminina', label: 'Moda Feminina' },
    { value: 'jeans', label: 'Jeans' },
    { value: 'moda_praia', label: 'Moda Praia' },
    { value: 'moda_masculina', label: 'Moda Masculina' },
    { value: 'moda_evangelica', label: 'Moda Evangélica' },
    { value: 'moda_fitness', label: 'Moda Fitness' },
    { value: 'plus_size', label: 'Plus Size' },
  ]

  const isManufacturer = pb.authStore.record?.role === 'manufacturer'

  const loadData = async () => {
    try {
      const records = await pb.collection('projects').getFullList({
        filter: isManufacturer ? `manufacturer = "${pb.authStore.record?.id}"` : '',
        sort: '-created',
      })
      setProjects(records)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('projects', () => loadData())

  const handleCreate = async () => {
    if (!formData.name || !file) {
      toast.error('Nome e imagem são obrigatórios')
      return
    }
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      if (formData.category) data.append('category', formData.category)
      if (formData.retail_price) data.append('retail_price', formData.retail_price)
      if (formData.wholesale_price) data.append('wholesale_price', formData.wholesale_price)
      if (formData.stock_quantity) data.append('stock_quantity', formData.stock_quantity)
      data.append('image', file)

      if (pb.authStore.record?.id) {
        data.append('manufacturer', pb.authStore.record.id)
      }

      await pb.collection('projects').create(data)
      toast.success('Projeto criado com sucesso!')
      setIsNewOpen(false)
      setFormData({
        name: '',
        description: '',
        category: '',
        retail_price: '',
        wholesale_price: '',
        stock_quantity: '',
      })
      setFile(null)
    } catch (e) {
      toast.error('Erro ao criar projeto')
    }
  }

  const handleUpdate = async () => {
    if (!editingProject) return
    try {
      const data = new FormData()
      data.append('name', editingProject.name)
      data.append('description', editingProject.description)
      if (editingProject.category) data.append('category', editingProject.category)
      if (editingProject.retail_price !== undefined)
        data.append('retail_price', String(editingProject.retail_price))
      if (editingProject.wholesale_price !== undefined)
        data.append('wholesale_price', String(editingProject.wholesale_price))
      if (editingProject.stock_quantity !== undefined)
        data.append('stock_quantity', String(editingProject.stock_quantity))
      if (file) data.append('image', file)

      await pb.collection('projects').update(editingProject.id, data)
      toast.success('Projeto atualizado com sucesso!')
      setEditingProject(null)
      setFile(null)
    } catch (e) {
      toast.error('Erro ao atualizar projeto')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await pb.collection('projects').delete(id)
        toast.success('Projeto excluído')
      } catch (e) {
        toast.error('Erro ao excluir projeto')
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isManufacturer ? 'Meu Catálogo' : 'Projetos & Coleções'}
          </h1>
          <p className="text-muted-foreground">
            {isManufacturer
              ? 'Gerencie os produtos do seu catálogo e preços B2B/B2C.'
              : 'Gerencie o portfólio visual da sua marca.'}
          </p>
        </div>

        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Produto</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Varejo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.retail_price}
                    onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Atacado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.wholesale_price}
                    onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estoque</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem Principal</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button className="w-full mt-4" onClick={handleCreate}>
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Varejo</TableHead>
              <TableHead>Atacado</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img
                      src={pb.files.getUrl(p, p.image, { thumb: '100x100' })}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    {p.retail_price ? `R$ ${p.retail_price.toFixed(2).replace('.', ',')}` : '-'}
                  </TableCell>
                  <TableCell>
                    {p.wholesale_price ? (
                      <Badge variant="secondary">
                        R$ {p.wholesale_price.toFixed(2).replace('.', ',')}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {p.stock_quantity > 0 ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600">
                        {p.stock_quantity}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-600">
                        Sem estoque
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditingProject(p)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Produto</Label>
                <Input
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={editingProject.category || ''}
                  onValueChange={(v) => setEditingProject({ ...editingProject, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Varejo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProject.retail_price ?? ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        retail_price: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Atacado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProject.wholesale_price ?? ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        wholesale_price: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estoque</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editingProject.stock_quantity ?? ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        stock_quantity: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingProject.description}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nova Imagem (opcional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button className="w-full mt-4" onClick={handleUpdate}>
                Atualizar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
