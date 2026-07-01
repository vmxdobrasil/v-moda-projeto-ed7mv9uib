import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const res = await pb.collection('categories').getFullList({ sort: 'name' })
      setCategories(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('categories', loadData)

  const updateLimit = async (id: string, limit: number) => {
    try {
      await pb.collection('categories').update(id, { ranking_limit: limit })
      toast({ title: 'Limite TOP atualizado' })
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categorias & Curadoria</h1>
        <p className="text-muted-foreground">
          Gerencie categorias e limites de vagas no TOP por categoria.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todas as Categorias</CardTitle>
          <CardDescription>
            {categories.length} categorias cadastradas. Ajuste o limite de marcas no TOP por
            categoria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Limite TOP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24"
                        defaultValue={c.ranking_limit || 0}
                        min={0}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value) || 0
                          if (val !== (c.ranking_limit || 0)) updateLimit(c.id, val)
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Nenhuma categoria cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
