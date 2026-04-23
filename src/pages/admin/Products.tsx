import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit2, Trash2, Search, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { Project } from '@/services/projects'

export default function Products() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: 'moda_geral',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const loadData = async () => {
    try {
      const user = pb.authStore.record
      if (!user) return

      const records = await pb.collection('projects').getFullList<Project>({
        filter: `manufacturer = "${user.id}"`,
        sort: '-created',
      })
      setProjects(records)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('projects', loadData)

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        name: project.name || '',
        description: project.description || '',
        price: project.price?.toString() || '',
        stock_quantity: project.stock_quantity?.toString() || '',
        category: project.category || 'moda_geral',
      })
    } else {
      setEditingProject(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: 'moda_geral',
      })
    }
    setImageFile(null)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.stock_quantity) {
      toast({
        description: 'Preencha os campos obrigatórios (Nome, Preço, Estoque).',
        variant: 'destructive',
      })
      return
    }

    if (!editingProject && !imageFile) {
      toast({
        description: 'Uma imagem é obrigatória para novos projetos.',
        variant: 'destructive',
      })
      return
    }

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('price', formData.price)
      data.append('stock_quantity', formData.stock_quantity)
      data.append('category', formData.category)

      if (imageFile) {
        data.append('image', imageFile)
      }

      if (editingProject) {
        await pb.collection('projects').update(editingProject.id, data)
        toast({ description: 'Projeto atualizado com sucesso!' })
      } else {
        data.append('manufacturer', pb.authStore.record?.id || '')
        await pb.collection('projects').create(data)
        toast({ description: 'Projeto adicionado com sucesso!' })
      }
      setIsModalOpen(false)
    } catch (err: any) {
      toast({ description: err.message || 'Erro ao salvar projeto.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este projeto?')) {
      try {
        await pb.collection('projects').delete(id)
        toast({ description: 'Projeto removido com sucesso!' })
      } catch (err) {
        toast({ description: 'Erro ao remover projeto.', variant: 'destructive' })
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Meu Catálogo</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie os itens que você pretende vender ou revender.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Projeto
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Catálogo Ativo</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar projeto..."
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
                  <TableHead className="w-[80px]">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço (R$)</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead className="text-center w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      {project.image ? (
                        <img
                          src={pb.files.getUrl(project, project.image, { thumb: '100x100' })}
                          alt={project.name}
                          className="w-10 h-10 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-md border">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="capitalize">
                      {project.category?.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-right">
                      {project.price?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${(project.stock_quantity || 0) <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-emerald-100 text-emerald-800'}`}
                      >
                        {project.stock_quantity || 0} un
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(project)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum projeto encontrado.
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
            <DialogTitle>{editingProject ? 'Editar Projeto' : 'Adicionar Projeto'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do projeto para inclusão no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moda_feminina">Moda Feminina</SelectItem>
                    <SelectItem value="moda_masculina">Moda Masculina</SelectItem>
                    <SelectItem value="jeans">Jeans</SelectItem>
                    <SelectItem value="moda_praia">Moda Praia</SelectItem>
                    <SelectItem value="moda_geral">Moda Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Estoque *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Preço (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Imagem {editingProject ? '(Opcional)' : '*'}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Projeto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
