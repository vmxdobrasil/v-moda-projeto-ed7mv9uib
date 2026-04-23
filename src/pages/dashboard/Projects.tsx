import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    min_quantity_wholesale: '',
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

  const userRole = pb.authStore.record?.role
  const isAdmin =
    pb.authStore.record?.email === 'valterpmendonca@gmail.com' ||
    pb.authStore.record?.role === 'admin'

  const loadData = async () => {
    try {
      const records = await pb.collection('projects').getFullList({
        filter: !isAdmin ? `manufacturer = "${pb.authStore.record?.id}"` : '',
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
      if (formData.min_quantity_wholesale)
        data.append('min_quantity_wholesale', formData.min_quantity_wholesale)
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
        min_quantity_wholesale: '',
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
      if (editingProject.min_quantity_wholesale !== undefined)
        data.append('min_quantity_wholesale', String(editingProject.min_quantity_wholesale))
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
            {isAdmin ? 'Catálogo Global' : 'Meus Produtos'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Visualize todos os produtos cadastrados na plataforma.'
              : 'Gerencie os produtos do seu catálogo e preços B2B/B2C.'}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="space-y-2">
                  <Label>Mín. Atacado</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.min_quantity_wholesale}
                    onChange={(e) =>
                      setFormData({ ...formData, min_quantity_wholesale: e.target.value })
                    }
                    placeholder="1"
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

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando catálogo...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum produto cadastrado no catálogo.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/5] bg-muted relative">
                <img
                  src={pb.files.getUrl(p, p.image, { thumb: '400x500' })}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                    onClick={() => setEditingProject(p)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {p.stock_quantity <= 0 && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="destructive" className="bg-red-500">
                      Esgotado
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-lg line-clamp-1" title={p.name}>
                    {p.name}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3 capitalize">
                  {p.category?.replace('_', ' ') || 'Sem categoria'}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {p.description || 'Sem descrição.'}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Atacado</span>
                    <span className="font-bold text-primary">
                      {p.wholesale_price
                        ? `R$ ${p.wholesale_price.toFixed(2).replace('.', ',')}`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">Estoque</span>
                    <span className="font-medium">
                      {p.stock_quantity > 0 ? p.stock_quantity : '0'} unid.
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="space-y-2">
                  <Label>Mín. Atacado</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingProject.min_quantity_wholesale ?? ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        min_quantity_wholesale: e.target.value ? Number(e.target.value) : '',
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
