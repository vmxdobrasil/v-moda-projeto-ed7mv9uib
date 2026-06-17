import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
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
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { ImagePlus, Images, Eye, Loader2 } from 'lucide-react'
import { MagazineViewer } from '@/components/catalog/MagazineViewer'

export default function ManufacturerCatalog() {
  const { user } = useAuth()
  const [pages, setPages] = useState<any[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    colors: '',
    sizes: '',
    wholesale_price: '',
    min_quantity_wholesale: '',
  })
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    if (user) loadPages()
  }, [user])

  async function loadPages() {
    try {
      const res = await pb.collection('projects').getFullList({
        filter: `manufacturer = "${user?.id}"`,
        sort: 'created',
      })
      const slots = Array(8).fill(null)
      res.forEach((p, i) => {
        if (i < 8) slots[i] = p
      })
      setPages(slots)
    } catch (e) {
      console.error(e)
    }
  }

  function openEdit(index: number) {
    const page = pages[index]
    if (page) {
      setFormData({
        name: page.name,
        description: page.description || '',
        colors: page.colors || '',
        sizes: page.sizes || '',
        wholesale_price: page.wholesale_price?.toString() || '',
        min_quantity_wholesale: page.min_quantity_wholesale?.toString() || '',
      })
    } else {
      setFormData({
        name: index === 0 ? 'Página 1 (Capa)' : `Página ${index + 1}`,
        description: '',
        colors: '',
        sizes: '',
        wholesale_price: '',
        min_quantity_wholesale: '',
      })
    }
    setFiles([])
    setEditingIndex(index)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editingIndex === null) return
    const isCover = editingIndex === 0
    const existing = pages[editingIndex]

    if (!existing && files.length === 0) {
      toast({ title: 'Adicione pelo menos 1 imagem', variant: 'destructive' })
      return
    }

    if (!isCover && files.length > 0 && files.length !== 4) {
      toast({ title: 'As páginas 2 a 8 exigem exatamente 4 imagens.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const fData = new FormData()
      fData.append('name', formData.name)
      fData.append('description', formData.description)
      fData.append('colors', formData.colors)
      fData.append('sizes', formData.sizes)
      fData.append('wholesale_price', formData.wholesale_price)
      fData.append('min_quantity_wholesale', formData.min_quantity_wholesale)
      fData.append('manufacturer', user?.id || '')

      if (files.length > 0) {
        fData.append('image', files[0])
        for (let i = 1; i < files.length; i++) {
          fData.append('gallery', files[i])
        }
      }

      if (existing) {
        await pb.collection('projects').update(existing.id, fData)
      } else {
        await pb.collection('projects').create(fData)
      }

      toast({ title: 'Página salva com sucesso!' })
      setEditingIndex(null)
      loadPages()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Catálogo Digital</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as 8 páginas do seu catálogo estilo revista.
          </p>
        </div>
        <Button onClick={() => setViewerOpen(true)} className="gap-2">
          <Eye className="w-4 h-4" /> Visualizar Catálogo
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pages.map((p, i) => {
          const isCover = i === 0
          return (
            <Card
              key={i}
              className={`overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all ${!p ? 'border-dashed bg-muted/30' : ''}`}
              onClick={() => openEdit(i)}
            >
              <div className="aspect-[3/4] relative flex flex-col items-center justify-center p-4 text-center">
                {p ? (
                  <>
                    <img
                      src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/projects/${p.id}/${p.image}`}
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                      alt=""
                    />
                    <div className="relative z-10 bg-black/60 text-white p-3 rounded-md w-full">
                      <p className="font-bold truncate">{p.name}</p>
                      <p className="text-xs mt-1">{isCover ? 'Capa' : '4 Imagens'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    {isCover ? (
                      <ImagePlus className="w-10 h-10 text-muted-foreground mb-2" />
                    ) : (
                      <Images className="w-10 h-10 text-muted-foreground mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground font-medium">Página {i + 1}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isCover ? 'Foto única (Capa)' : '4 fotos'}
                    </p>
                  </>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog open={editingIndex !== null} onOpenChange={(o) => !o && setEditingIndex(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar{' '}
              {editingIndex === 0
                ? 'Capa'
                : `Página ${editingIndex !== null ? editingIndex + 1 : ''}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Imagens (Selecione {editingIndex === 0 ? '1' : 'exatamente 4'} arquivos)
              </Label>
              <Input
                type="file"
                multiple={editingIndex !== 0}
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                required={!pages[editingIndex || 0]}
              />
              <p className="text-xs text-muted-foreground">
                {editingIndex === 0
                  ? 'A capa deve ter 1 imagem de destaque.'
                  : 'Esta página de lookbook exige exatamente 4 imagens para montar o mosaico.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Título / Nome da Coleção</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição Persuasiva</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cores (Separadas por vírgula)</Label>
                <Input
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="Azul, Preto, Branco"
                />
              </div>
              <div className="space-y-2">
                <Label>Tamanhos</Label>
                <Input
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="P, M, G, GG"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço Atacado (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.wholesale_price}
                  onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Mínimo de Peças</Label>
                <Input
                  type="number"
                  value={formData.min_quantity_wholesale}
                  onChange={(e) =>
                    setFormData({ ...formData, min_quantity_wholesale: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingIndex(null)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Página
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MagazineViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        manufacturerId={user?.id || ''}
      />
    </div>
  )
}
