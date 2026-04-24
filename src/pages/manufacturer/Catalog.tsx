import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Plus, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ManufacturerCatalog() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    wholesale_price: '',
    retail_price: '',
    stock_quantity: '',
    min_quantity_wholesale: '',
    category: 'moda_geral',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const loadData = async () => {
    try {
      if (!user) return
      const records = await pb
        .collection('projects')
        .getFullList({ filter: `manufacturer = "${user.id}"`, sort: '-created' })
      setProjects(records)
    } catch (error) {
      toast.error('Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleOpen = (project?: any) => {
    if (project) {
      setEditingId(project.id)
      setFormData({
        name: project.name,
        description: project.description || '',
        wholesale_price: project.wholesale_price?.toString() || '',
        retail_price: project.retail_price?.toString() || '',
        stock_quantity: project.stock_quantity?.toString() || '',
        min_quantity_wholesale: project.min_quantity_wholesale?.toString() || '',
        category: project.category || 'moda_geral',
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        description: '',
        wholesale_price: '',
        retail_price: '',
        stock_quantity: '',
        min_quantity_wholesale: '',
        category: 'moda_geral',
      })
    }
    setImageFile(null)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('wholesale_price', formData.wholesale_price || '0')
      data.append('retail_price', formData.retail_price || '0')
      data.append('stock_quantity', formData.stock_quantity || '0')
      data.append('min_quantity_wholesale', formData.min_quantity_wholesale || '1')
      data.append('category', formData.category)
      data.append('manufacturer', user.id)

      if (imageFile) {
        data.append('image', imageFile)
      }

      if (editingId) {
        await pb.collection('projects').update(editingId, data)
        toast.success('Produto atualizado com sucesso')
      } else {
        await pb.collection('projects').create(data)
        toast.success('Produto criado com sucesso')
      }
      setOpen(false)
      loadData()
    } catch (error: any) {
      toast.error(error?.response?.data?.image?.message || 'Erro ao salvar produto')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catálogo e Estoque</h2>
          <p className="text-muted-foreground">
            Gerencie seus produtos, preços (Atacado/Varejo) e estoque.
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Atacado (Mín.)</TableHead>
                <TableHead>Varejo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum produto cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={pb.files.getUrl(p, p.image, { thumb: '100x100' })}
                            alt={p.name}
                            className="w-10 h-10 rounded-md object-cover bg-secondary"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                            Sem img
                          </div>
                        )}
                        <span>{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{p.category?.replace('_', ' ')}</TableCell>
                    <TableCell>{p.stock_quantity || 0} un</TableCell>
                    <TableCell>
                      R$ {p.wholesale_price || 0} ({p.min_quantity_wholesale || 1} un)
                    </TableCell>
                    <TableCell>R$ {p.retail_price || p.price || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpen(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Produto</Label>
              <Input
                placeholder="Ex: Vestido de Verão"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Descrição do produto..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço Atacado (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.wholesale_price}
                  onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Qtd Mínima (Atacado)</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.min_quantity_wholesale}
                  onChange={(e) =>
                    setFormData({ ...formData, min_quantity_wholesale: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço Varejo (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.retail_price}
                  onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estoque Disponível</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moda_geral">Moda Geral</SelectItem>
                  <SelectItem value="moda_feminina">Moda Feminina</SelectItem>
                  <SelectItem value="jeans">Jeans</SelectItem>
                  <SelectItem value="moda_masculina">Moda Masculina</SelectItem>
                  <SelectItem value="plus_size">Plus Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.name || (!imageFile && !editingId)}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
