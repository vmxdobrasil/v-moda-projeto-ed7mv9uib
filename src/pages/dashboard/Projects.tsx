import { useState, useEffect } from 'react'
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
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function DashboardProjects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [file, setFile] = useState<File | null>(null)

  const loadData = async () => {
    try {
      const records = await pb.collection('projects').getFullList({
        filter:
          pb.authStore.record?.role === 'manufacturer'
            ? `manufacturer = "${pb.authStore.record.id}"`
            : '',
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
      data.append('image', file)
      if (pb.authStore.record?.id) {
        data.append('manufacturer', pb.authStore.record.id)
      }
      await pb.collection('projects').create(data)
      toast.success('Projeto criado com sucesso!')
      setIsNewOpen(false)
      setFormData({ name: '', description: '' })
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
          <h1 className="text-3xl font-bold tracking-tight">Projetos & Coleções</h1>
          <p className="text-muted-foreground">Gerencie o portfólio visual da sua marca.</p>
        </div>

        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Projeto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Projeto</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem / Foto Principal</Label>
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
              <TableHead>Descrição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                  <TableCell className="max-w-[300px] truncate">{p.description}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Projeto</Label>
                <Input
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                />
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
