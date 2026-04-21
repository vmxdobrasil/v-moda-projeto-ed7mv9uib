import { useState, useEffect, useRef } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'

export default function AdminCollections() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  })

  const fileRef = useRef<HTMLInputElement>(null)

  const CATEGORIES = [
    { value: 'moda_feminina', label: 'Moda Feminina' },
    { value: 'jeans', label: 'Jeans' },
    { value: 'moda_praia', label: 'Moda Praia' },
    { value: 'moda_masculina', label: 'Moda Masculina' },
    { value: 'moda_evangelica', label: 'Moda Evangélica' },
    { value: 'moda_fitness', label: 'Moda Fitness' },
    { value: 'plus_size', label: 'Plus Size' },
  ]

  const loadData = async () => {
    try {
      const records = await pb.collection('projects').getFullList({
        sort: '-created',
      })
      setProjects(records)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar coleções')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('projects', () => loadData())

  const handleCreate = async () => {
    if (!formData.name || !fileRef.current?.files?.[0]) {
      toast.error('Nome e imagem são obrigatórios')
      return
    }
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      if (formData.category) data.append('category', formData.category)
      data.append('image', fileRef.current.files[0])

      if (pb.authStore.record?.id) {
        data.append('manufacturer', pb.authStore.record.id)
      }

      await pb.collection('projects').create(data)
      toast.success('Coleção criada com sucesso!')
      setIsNewOpen(false)
      setFormData({ name: '', description: '', category: '' })
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      toast.error('Erro ao criar coleção')
    }
  }

  const handleUpdate = async () => {
    if (!editingProject) return
    try {
      const data = new FormData()
      data.append('name', editingProject.name)
      data.append('description', editingProject.description)
      if (editingProject.category) data.append('category', editingProject.category)

      if (fileRef.current?.files?.[0]) {
        data.append('image', fileRef.current.files[0])
      }

      await pb.collection('projects').update(editingProject.id, data)
      toast.success('Coleção atualizada com sucesso!')
      setEditingProject(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      toast.error('Erro ao atualizar coleção')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta coleção?')) {
      try {
        await pb.collection('projects').delete(id)
        toast.success('Coleção excluída')
      } catch (e) {
        toast.error('Erro ao excluir coleção')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciar Coleções</h2>
          <p className="text-muted-foreground mt-1">
            Organize e publique galerias de produtos e coleções da marca.
          </p>
        </div>

        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Nova Coleção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Coleção</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Coleção</Label>
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
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem de Capa</Label>
                <Input type="file" accept="image/*" ref={fileRef} />
              </div>
              <Button className="w-full mt-4" onClick={handleCreate}>
                Salvar Coleção
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Capa</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Carregando coleções...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma coleção cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image ? (
                      <img
                        src={pb.files.getURL(p, p.image, { thumb: '100x100' })}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    {CATEGORIES.find((c) => c.value === p.category)?.label || p.category || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(p.created).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditingProject(p)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p.id)}
                      className="text-destructive hover:text-destructive/90"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Coleção</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Coleção</Label>
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
                <Label>Nova Imagem de Capa (opcional)</Label>
                <Input type="file" accept="image/*" ref={fileRef} />
              </div>
              <Button className="w-full mt-4" onClick={handleUpdate}>
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
