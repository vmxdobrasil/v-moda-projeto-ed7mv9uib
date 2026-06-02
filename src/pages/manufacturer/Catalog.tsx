import { useState, useEffect } from 'react'
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
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { Plus, Edit, Trash, QrCode } from 'lucide-react'
import { createProject, updateProject, deleteProject, Project } from '@/services/projects'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export default function ManufacturerCatalog() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    wholesale_price: '',
    retail_price: '',
    stock_quantity: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [qrProject, setQrProject] = useState<Project | null>(null)

  const fetchProjects = async () => {
    try {
      const user = pb.authStore.record
      if (!user) return
      const res = await pb.collection('projects').getFullList<Project>({
        filter: `manufacturer = "${user.id}"`,
        sort: '-created',
      })
      setProjects(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('name', formData.name)
      fd.append('description', formData.description)
      fd.append('price', formData.price)
      fd.append('wholesale_price', formData.wholesale_price)
      fd.append('retail_price', formData.retail_price)
      fd.append('stock_quantity', formData.stock_quantity)
      if (imageFile) fd.append('image', imageFile)

      if (editingId) {
        await updateProject(editingId, fd)
        toast({ title: 'Produto atualizado!' })
      } else {
        await createProject(fd)
        toast({ title: 'Produto criado!' })
      }
      setIsOpen(false)
      fetchProjects()
      resetForm()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este produto?')) return
    try {
      await deleteProject(id)
      toast({ title: 'Produto excluído!' })
      fetchProjects()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      wholesale_price: '',
      retail_price: '',
      stock_quantity: '',
    })
    setImageFile(null)
    setEditingId(null)
  }

  const openEdit = (p: Project) => {
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price?.toString() || '',
      wholesale_price: p.wholesale_price?.toString() || '',
      retail_price: p.retail_price?.toString() || '',
      stock_quantity: p.stock_quantity?.toString() || '',
    })
    setEditingId(p.id)
    setIsOpen(true)
  }

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif">Catálogo de Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus produtos, preços e estoques.</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome do Produto</Label>
              <Input
                required
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço de Custo (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estoque Disponível</Label>
                <Input
                  type="number"
                  required
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço Atacado (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.wholesale_price}
                  onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço Varejo (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.retail_price}
                  onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required={!editingId}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar Produto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!qrProject} onOpenChange={(open) => !open && setQrProject(null)}>
        <DialogContent className="sm:max-w-sm flex flex-col items-center justify-center p-8">
          <DialogHeader>
            <DialogTitle className="text-center mb-4 text-xl">QR Code Rastreado</DialogTitle>
          </DialogHeader>
          {qrProject && (
            <div className="flex flex-col items-center space-y-4">
              <QRCodeDisplay
                data={`https://vmodabrasil.goskip.app/qrcode/prod_${qrProject.id}`}
                size={250}
              />
              <p className="text-sm text-center text-muted-foreground mt-4">
                Escaneie para acessar a página do produto diretamente.
                <br />
                Use na sua loja física ou vitrine.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-white rounded-xl border border-dashed">
            Nenhum produto cadastrado no seu catálogo.
          </div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl overflow-hidden border shadow-sm group">
              <div className="aspect-[3/4] relative bg-muted">
                {p.image ? (
                  <img
                    src={pb.files.getUrl(p, p.image)}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sem imagem
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => setQrProject(p)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 text-blue-600"
                    onClick={() => openEdit(p)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-medium line-clamp-1">{p.name}</h3>
                <div className="flex justify-between items-baseline text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Atacado</span>
                    <span className="font-semibold text-primary">
                      {formatBRL(p.wholesale_price || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">Varejo</span>
                    <span className="font-medium text-foreground">
                      {formatBRL(p.retail_price || 0)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between">
                  <span>Estoque: {p.stock_quantity || 0} u.</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
