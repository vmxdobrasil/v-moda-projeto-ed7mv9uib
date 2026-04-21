import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  GraduationCap,
  ExternalLink,
  Plus,
  BookOpen,
  Trash2,
  Pencil,
  Video,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { Textarea } from '@/components/ui/textarea'
import { useRef } from 'react'

export default function Resources() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'course',
    url: '',
    description: '',
  })

  const fileRef = useRef<HTMLInputElement>(null)
  const thumbRef = useRef<HTMLInputElement>(null)

  const isManufacturer =
    pb.authStore.record?.role === 'manufacturer' ||
    pb.authStore.record?.email === 'valterpmendonca@gmail.com'

  const loadData = async () => {
    try {
      const records = await pb.collection('resources').getFullList({ sort: '-created' })
      setResources(records)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar recursos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('resources', () => loadData())

  const handleSubmit = async () => {
    if (!formData.name) return toast.error('Nome é obrigatório')

    const isFileProvided = fileRef.current?.files?.[0]
    if (!formData.url && !isFileProvided) {
      return toast.error('Forneça uma URL ou um Arquivo')
    }

    try {
      const fd = new FormData()
      fd.append('name', formData.name)
      fd.append('type', formData.type)
      fd.append('description', formData.description)
      fd.append('url', formData.url)

      if (fileRef.current?.files?.[0]) fd.append('content_file', fileRef.current.files[0])
      if (thumbRef.current?.files?.[0]) fd.append('thumbnail', thumbRef.current.files[0])

      if (editingId) {
        await pb.collection('resources').update(editingId, fd)
        toast.success('Recurso atualizado!')
      } else {
        await pb.collection('resources').create(fd)
        toast.success('Recurso adicionado!')
      }
      setIsOpen(false)
      resetForm()
    } catch (e) {
      toast.error('Erro ao salvar recurso')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este recurso?')) return
    try {
      await pb.collection('resources').delete(id)
      toast.success('Recurso excluído')
    } catch (e) {
      toast.error('Erro ao excluir')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', type: 'course', url: '', description: '' })
    setEditingId(null)
    if (fileRef.current) fileRef.current.value = ''
    if (thumbRef.current) thumbRef.current.value = ''
  }

  const openEdit = (res: any) => {
    setFormData({
      name: res.name,
      type: res.type,
      url: res.url,
      description: res.description || '',
    })
    setEditingId(res.id)
    setIsOpen(true)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-rose-500" />
      case 'ebook':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'magazine':
        return <BookOpen className="w-5 h-5 text-purple-500" />
      default:
        return <GraduationCap className="w-5 h-5 text-emerald-500" />
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academy (Recursos)</h1>
          <p className="text-muted-foreground">
            Acesse vídeos, cursos e materiais para alavancar seu negócio.
          </p>
        </div>
        {isManufacturer && (
          <Dialog
            open={isOpen}
            onOpenChange={(v) => {
              setIsOpen(v)
              if (!v) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Adicionar Recurso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar Recurso' : 'Adicionar Material Educativo'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Material</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Guia Prático de Vendas"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Curso / Trilha</SelectItem>
                        <SelectItem value="video">Vídeo Aula</SelectItem>
                        <SelectItem value="ebook">E-Book</SelectItem>
                        <SelectItem value="magazine">Revista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL de Acesso (opcional se enviar arquivo)</Label>
                    <Input
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Arquivo (PDF, Vídeo, etc)</Label>
                    <Input type="file" ref={fileRef} accept="application/pdf,video/*,image/*" />
                  </div>
                  <div className="space-y-2">
                    <Label>Capa / Thumbnail</Label>
                    <Input type="file" ref={thumbRef} accept="image/*" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="resize-none"
                  />
                </div>
                <Button className="w-full mt-4" onClick={handleSubmit}>
                  Salvar Recurso
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full py-8 text-center text-muted-foreground">Carregando...</p>
        ) : resources.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-card rounded-lg border shadow-sm">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Nenhum material disponível</h3>
            <p className="text-muted-foreground mt-1">
              Os treinamentos e recursos aparecerão aqui.
            </p>
          </div>
        ) : (
          resources.map((res) => (
            <Card
              key={res.id}
              className="hover:border-primary/50 transition-colors overflow-hidden flex flex-col"
            >
              {res.thumbnail && (
                <div className="aspect-video w-full bg-muted border-b">
                  <img
                    src={pb.files.getURL(res, res.thumbnail)}
                    alt={res.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-3 flex flex-row items-start justify-between flex-none">
                <div className="flex items-center gap-3">
                  {!res.thumbnail && (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {getIcon(res.type)}
                    </div>
                  )}
                  <div>
                    <CardTitle
                      className="text-base leading-tight font-serif line-clamp-1"
                      title={res.name}
                    >
                      {res.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{res.type}</p>
                  </div>
                </div>
                {isManufacturer && (
                  <div className="flex items-center gap-1 -mt-1 -mr-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(res)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(res.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {res.description || 'Sem descrição adicional.'}
                </p>
                <Button variant="outline" className="w-full mt-auto" asChild>
                  <a
                    href={res.content_file ? pb.files.getURL(res, res.content_file) : res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Acessar Conteúdo <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
