import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2 } from 'lucide-react'
import { RecordModel } from 'pocketbase'

export default function ManufacturerCatalog() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [projects, setProjects] = useState<RecordModel[]>([])
  const [newProjectName, setNewProjectName] = useState('')

  const loadProjects = async () => {
    if (!user) return
    try {
      const records = await pb.collection('projects').getFullList({
        filter: `manufacturer = '${user.id}'`,
        sort: '-created',
      })
      setProjects(records)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [user])

  const createProject = async () => {
    if (!newProjectName.trim()) return
    try {
      const formData = new FormData()
      formData.append('name', newProjectName)
      formData.append('manufacturer', user!.id)
      formData.append('price', '0')

      const blob = new Blob(['dummy'], { type: 'image/jpeg' })
      const file = new File([blob], 'dummy.jpg', { type: 'image/jpeg' })
      formData.append('image', file)

      await pb.collection('projects').create(formData)
      setNewProjectName('')
      toast({ title: 'Produto criado com sucesso' })
      loadProjects()
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro ao criar produto', variant: 'destructive' })
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Excluir este produto?')) return
    try {
      await pb.collection('projects').delete(id)
      toast({ title: 'Produto excluído' })
      loadProjects()
    } catch (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Meu Catálogo</h1>
        <div className="flex space-x-2">
          <Input
            placeholder="Nome do novo produto..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <Button onClick={createProject}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Publicados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço Atacado</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>R$ {item.wholesale_price || 0}</TableCell>
                  <TableCell>{item.stock_quantity || 0}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteProject(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    Nenhum produto cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
