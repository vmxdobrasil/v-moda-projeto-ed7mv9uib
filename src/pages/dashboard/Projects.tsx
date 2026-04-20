import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FolderKanban, Plus, Image as ImageIcon, Trash2, Pencil, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const loadData = async () => {
    try {
      const [projs, cats] = await Promise.all([
        pb.collection('projects').getFullList({
          filter: `manufacturer = "${pb.authStore.record?.id}"`,
          sort: '-created',
          expand: 'category_id',
        }),
        pb.collection('categories').getFullList({ sort: 'name' }),
      ])
      setProjects(projs)
      setCategories(cats)
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

  const handleSubmit = async () => {
    if (!formData.name) return toast.error('Nome é obrigatório')
    if (!editingId && !imageFile) return toast.error('Imagem é obrigatória para novos projetos')

    try {
      const fd = new FormData()
      fd.append('name', formData.name)
      fd.append('description', formData.description)
      fd.append('manufacturer', pb.authStore.record!.id)
      if (formData.category_id) {
        fd.append('category_id', formData.category_id)
        const cat = categories.find((c) => c.id === formData.category_id)
        if (cat) fd.append('category', cat.slug)
      }
      if (imageFile) fd.append('image', imageFile)

      if (editingId) {
        await pb.collection('projects').update(editingId, fd)
        toast.success('Projeto atualizado!')
      } else {
        await pb.collection('projects').create(fd)
        toast.success('Projeto criado com sucesso!')
      }

      setIsOpen(false)
      resetForm()
    } catch (e) {
      console.error(e)
      toast.error('Erro ao salvar projeto')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este projeto?')) return
    try {
      await pb.collection('projects').delete(id)
      toast.success('Projeto excluído')
    } catch (e) {
      toast.error('Erro ao excluir')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', category_id: '' })
    setImageFile(null)
    setEditingId(null)
  }

  const openEdit = (project: any) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      category_id: project.category_id || '',
    })
    setEditingId(project.id)
    setIsOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo / Vitrine</h1>
          <p className="text-muted-foreground">Gerencie suas coleções e projetos do portfólio.</p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(v) => {
            setIsOpen(v)
            if (!v) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Projeto' : 'Adicionar Novo Projeto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Projeto / Coleção</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Coleção Verão 2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
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
                  placeholder="Detalhes do projeto..."
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem de Destaque</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                {editingId && !imageFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe em branco para manter a imagem atual.
                  </p>
                )}
              </div>
              <Button className="w-full mt-4" onClick={handleSubmit}>
                Salvar Projeto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <p className="col-span-full py-8 text-center text-muted-foreground">Carregando...</p>
        ) : projects.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-card rounded-lg border shadow-sm">
            <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Nenhum projeto cadastrado</h3>
            <p className="text-muted-foreground mt-1">
              Adicione seu primeiro projeto para aparecer no portfólio.
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="overflow-hidden group">
              <div className="aspect-[4/5] bg-muted relative">
                {project.image ? (
                  <img
                    src={pb.files.getUrl(project, project.image, { thumb: '400x500' })}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="icon" onClick={() => openEdit(project)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-serif font-medium text-lg truncate mb-1">{project.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {project.description || 'Sem descrição'}
                </p>
                {project.expand?.category_id && (
                  <div className="mt-3 inline-flex px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded-full uppercase font-medium">
                    {project.expand.category_id.name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {projects.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/portfolio" target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" /> Ver Portfólio Público
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
