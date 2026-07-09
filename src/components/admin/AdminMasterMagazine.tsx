import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FileText, Video, Upload, Pencil } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export function AdminMasterMagazine() {
  const [resources, setResources] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const thumbRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const items = await pb.collection('resources').getFullList({
        filter: "type = 'magazine' || type = 'ebook'",
        sort: '-created',
      })
      setResources(items)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('resources', loadData)

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const fd = new FormData()
      if (fileRef.current?.files?.[0]) fd.append('content_file', fileRef.current.files[0])
      if (thumbRef.current?.files?.[0]) fd.append('thumbnail', thumbRef.current.files[0])
      await pb.collection('resources').update(editing.id, fd)
      toast({ title: 'Sucesso', description: 'Recurso atualizado.' })
      setEditing(null)
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Revista ModaAtual</h2>
        <p className="text-muted-foreground">Gestão de conteúdo editorial — revistas e e-books.</p>
      </div>

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
                {res.type === 'magazine' ? (
                  <FileText className="w-8 h-8 text-muted-foreground/50" />
                ) : (
                  <Video className="w-8 h-8 text-muted-foreground/50" />
                )}
              </div>
            )}
            <CardHeader className="flex-1 p-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="line-clamp-1 text-base">{res.name}</CardTitle>
                <Badge variant="secondary" className="capitalize shrink-0">
                  {res.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex justify-between items-center">
              <div className="flex gap-1.5 items-center text-xs text-muted-foreground">
                {res.content_file ? (
                  <FileText className="w-3.5 h-3.5" />
                ) : (
                  <Video className="w-3.5 h-3.5" />
                )}
                {res.content_file ? 'Arquivo' : 'Link'}
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(res)}>
                <Pencil className="w-3.5 h-3.5 mr-1" />
                Editar
              </Button>
            </CardContent>
          </Card>
        ))}
        {resources.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum conteúdo editorial encontrado.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar: {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Novo Arquivo (PDF, MP4)</Label>
              <Input type="file" ref={fileRef} accept="application/pdf,video/*,image/*" />
            </div>
            <div className="space-y-2">
              <Label>Nova Capa / Thumbnail</Label>
              <Input type="file" ref={thumbRef} accept="image/*" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
