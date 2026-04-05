import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Edit2, Plus, Trash2, Search } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)

  const [formData, setFormData] = useState({ name: '', slug: '' })
  const { toast } = useToast()

  const loadCategories = async () => {
    try {
      const data = await pb.collection('categories').getFullList({ sort: 'name' })
      setCategories(data)
    } catch (error) {
      console.error(error)
      toast({ description: 'Erro ao carregar categorias', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])
  useRealtime('categories', loadCategories)

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast({ description: 'Preencha todos os campos', variant: 'destructive' })
      return
    }

    try {
      if (selectedCategory) {
        await pb.collection('categories').update(selectedCategory.id, formData)
        toast({ description: 'Categoria atualizada com sucesso!' })
      } else {
        await pb.collection('categories').create(formData)
        toast({ description: 'Categoria criada com sucesso!' })
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({ description: error.message || 'Erro ao salvar categoria', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return
    try {
      await pb.collection('categories').delete(selectedCategory.id)
      toast({ description: 'Categoria removida com sucesso!' })
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        description: 'Erro ao remover categoria. Ela pode estar em uso.',
        variant: 'destructive',
      })
    }
  }

  const openNew = () => {
    setSelectedCategory(null)
    setFormData({ name: '', slug: '' })
    setIsDialogOpen(true)
  }

  const openEdit = (cat: any) => {
    setSelectedCategory(cat)
    setFormData({ name: cat.name, slug: cat.slug })
    setIsDialogOpen(true)
  }

  const openDelete = (cat: any) => {
    setSelectedCategory(cat)
    setIsDeleteDialogOpen(true)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!selectedCategory) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '')
      setFormData({ name: val, slug })
    } else {
      setFormData({ ...formData, name: val })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorias</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie as categorias e segmentos de moda da plataforma.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoria..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-[100px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(cat)}
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(cat)}
                          title="Excluir"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Nenhuma categoria encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Categoria</Label>
              <Input
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Ex: Moda Sustentável"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (Identificador único)</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="ex: moda_sustentavel"
              />
              <p className="text-xs text-muted-foreground">
                Usado nas URLs e filtros. Use apenas letras minúsculas e underscores.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir a categoria <strong>{selectedCategory?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta ação não pode ser desfeita. Certifique-se que não há marcas ou projetos usando
              esta categoria.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
