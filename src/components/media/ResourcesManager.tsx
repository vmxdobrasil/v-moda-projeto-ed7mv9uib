import { useState, useEffect, useRef } from 'react'
import { getResources, createResource, deleteResource, type Resource } from '@/services/resources'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { FileText, Video, Trash2, RefreshCw } from 'lucide-react'

export function ResourcesManager() {
  const [resources, setResources] = useState<Resource[]>([])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [type, setType] = useState<Resource['type']>('magazine')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const thumbRef = useRef<HTMLInputElement>(null)

  const load = async () => setResources(await getResources().catch(() => []))
  useEffect(() => {
    load()
  }, [])
  useRealtime('resources', load)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('type', type)
      fd.append('description', description)
      fd.append('url', url)
      if (fileRef.current?.files?.[0]) fd.append('content_file', fileRef.current.files[0])
      if (thumbRef.current?.files?.[0]) fd.append('thumbnail', thumbRef.current.files[0])

      await createResource(fd)
      toast({ title: 'Sucesso', description: 'Recurso adicionado.' })
      setName('')
      setDescription('')
      setUrl('')
      if (fileRef.current) fileRef.current.value = ''
      if (thumbRef.current) thumbRef.current.value = ''
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return
    try {
      await deleteResource(id)
      toast({ title: 'Removido', description: 'Recurso deletado.' })
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Recurso</CardTitle>
          <CardDescription>Faça upload de conteúdo ou vincule um link externo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="magazine">Revista Digital</SelectItem>
                    <SelectItem value="ebook">E-book</SelectItem>
                    <SelectItem value="course">Curso</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Arquivo (PDF, MP4)</Label>
                <Input type="file" ref={fileRef} accept="application/pdf,video/*,image/*" />
              </div>
              <div className="space-y-2">
                <Label>Capa / Thumbnail</Label>
                <Input type="file" ref={thumbRef} accept="image/*" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Link Externo (opcional se arquivo enviado)</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  type="url"
                  placeholder="https://..."
                />
              </div>
            </div>
            <Button type="submit" disabled={uploading}>
              {uploading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {resources.map((res) => (
          <Card key={res.id} className="overflow-hidden flex flex-col group">
            {res.thumbnail ? (
              <div className="aspect-video w-full bg-muted">
                <img
                  src={pb.files.getURL(res, res.thumbnail)}
                  alt={res.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-muted flex items-center justify-center">
                {res.type === 'video' ? (
                  <Video className="w-8 h-8 text-muted-foreground/50" />
                ) : (
                  <FileText className="w-8 h-8 text-muted-foreground/50" />
                )}
              </div>
            )}
            <CardHeader className="flex-1 p-4">
              <CardTitle className="line-clamp-1 text-base">{res.name}</CardTitle>
              <CardDescription className="capitalize text-xs">{res.type}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex justify-between items-center bg-muted/10">
              <div className="flex gap-1.5 items-center text-xs text-muted-foreground font-medium">
                {res.content_file ? (
                  <FileText className="w-3.5 h-3.5" />
                ) : (
                  <Video className="w-3.5 h-3.5" />
                )}
                {res.content_file ? 'Arquivo' : 'Link'}
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="h-7 w-7 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(res.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
