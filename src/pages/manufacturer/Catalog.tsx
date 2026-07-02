import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, Package } from 'lucide-react'
import { RecordModel } from 'pocketbase'
import { BulkUpdateDialog } from '@/components/manufacturer/BulkUpdateDialog'

export default function ManufacturerCatalog() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [projects, setProjects] = useState<RecordModel[]>([])
  const [editing, setEditing] = useState<RecordModel | null>(null)
  const [open, setOpen] = useState(false)

  const loadProjects = async () => {
    if (!user) return
    try {
      const records = await pb.collection('projects').getFullList({
        filter: `manufacturer = '${user.id}'`,
        sort: '-created',
      })
      setProjects(records)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [user])

  const handleSave = async (data: FormData) => {
    try {
      if (editing) {
        await pb.collection('projects').update(editing.id, data)
        toast({ title: 'Produto atualizado' })
      } else {
        data.append('manufacturer', user!.id)
        await pb.collection('projects').create(data)
        toast({ title: 'Produto criado com sucesso' })
      }
      setOpen(false)
      setEditing(null)
      loadProjects()
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Excluir este produto?')) return
    try {
      await pb.collection('projects').delete(id)
      toast({ title: 'Produto excluído' })
      loadProjects()
    } catch (e) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight font-display">Lookbook</h1>
        <div className="flex gap-3 items-center">
          <BulkUpdateDialog projects={projects} onUpdated={loadProjects} />
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o)
              if (!o) setEditing(null)
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 rounded-xl cta-glow">
                <Plus className="mr-2 h-4 w-4" /> Novo Produto
              </Button>
            </DialogTrigger>
            <ProductForm editing={editing} onSave={handleSave} />
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((item) => (
          <Card key={item.id} className="overflow-hidden rounded-2xl shadow-soft hover-depth">
            <div className="aspect-[4/5] bg-muted overflow-hidden rounded-t-2xl">
              <img
                src={
                  item.image
                    ? pb.files.getURL(item, item.image, { thumb: '400x500' })
                    : '/placeholder.svg'
                }
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm line-clamp-1 mb-1">{item.name}</h3>
              <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                {item.wholesale_price && (
                  <span className="text-primary font-bold">Atacado: R$ {item.wholesale_price}</span>
                )}
                {item.stock_quantity !== undefined && <span>Estoque: {item.stock_quantity}</span>}
              </div>
              {item.sizes && (
                <p className="text-xs text-muted-foreground mb-1">Tamanhos: {item.sizes}</p>
              )}
              {item.colors && (
                <p className="text-xs text-muted-foreground mb-3">Cores: {item.colors}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditing(item)
                    setOpen(true)
                  }}
                >
                  <Pencil className="w-3 h-3 mr-1" /> Editar
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteProject(item.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Nenhum produto cadastrado. Clique em "Novo Produto" para começar.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductForm({
  editing,
  onSave,
}: {
  editing: RecordModel | null
  onSave: (data: FormData) => void
}) {
  const [name, setName] = useState(editing?.name || '')
  const [description, setDescription] = useState(editing?.description || '')
  const [wholesalePrice, setWholesalePrice] = useState(editing?.wholesale_price || '')
  const [retailPrice, setRetailPrice] = useState(editing?.retail_price || '')
  const [minQty, setMinQty] = useState(editing?.min_quantity_wholesale || '')
  const [stock, setStock] = useState(editing?.stock_quantity || '')
  const [sizes, setSizes] = useState(editing?.sizes || '')
  const [colors, setColors] = useState(editing?.colors || '')
  const [image, setImage] = useState<File | null>(null)
  const [gallery, setGallery] = useState<File[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    if (wholesalePrice) formData.append('wholesale_price', String(wholesalePrice))
    if (retailPrice) formData.append('retail_price', String(retailPrice))
    if (minQty) formData.append('min_quantity_wholesale', String(minQty))
    if (stock) formData.append('stock_quantity', String(stock))
    formData.append('sizes', sizes)
    formData.append('colors', colors)
    if (image) formData.append('image', image)
    gallery.forEach((f) => formData.append('gallery', f))
    if (!editing && !image) {
      const blob = new Blob(['dummy'], { type: 'image/jpeg' })
      formData.append('image', new File([blob], 'placeholder.jpg', { type: 'image/jpeg' }))
    }
    onSave(formData)
  }

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Nome do Produto *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Preço Atacado (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Preço Varejo (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={retailPrice}
              onChange={(e) => setRetailPrice(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Qtd. Mín. Atacado</Label>
            <Input
              type="number"
              value={minQty}
              onChange={(e) => setMinQty(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Estoque</Label>
            <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Tamanhos (ex: PP,P,M,G,GG)</Label>
            <Input value={sizes} onChange={(e) => setSizes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cores (ex: Preto, Branco, Azul)</Label>
            <Input value={colors} onChange={(e) => setColors(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Imagem Principal</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && setImage(e.target.files[0])}
          />
        </div>
        <div className="space-y-2">
          <Label>Galeria / Lookbook (múltiplas imagens)</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && setGallery(Array.from(e.target.files))}
          />
        </div>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
          {editing ? 'Salvar Alterações' : 'Criar Produto'}
        </Button>
      </form>
    </DialogContent>
  )
}
