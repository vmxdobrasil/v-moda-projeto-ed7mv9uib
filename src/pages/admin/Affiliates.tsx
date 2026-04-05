import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Edit2, Percent, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<any>(null)
  const [rate, setRate] = useState('')
  const { toast } = useToast()

  const loadAffiliates = async () => {
    try {
      const res = await pb.collection('users').getFullList({
        filter: 'role="affiliate"',
      })
      setAffiliates(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAffiliates()
  }, [])

  const openEdit = (user: any) => {
    setEditUser(user)
    setRate(user.commission_rate ? user.commission_rate.toString() : '1.0')
  }

  const handleSave = async () => {
    const numRate = parseFloat(rate)
    if (isNaN(numRate) || numRate < 0.5 || numRate > 2.0) {
      toast({
        title: 'Erro',
        description: 'A taxa de comissão deve ser entre 0.5 e 2.0',
        variant: 'destructive',
      })
      return
    }

    try {
      await pb.collection('users').update(editUser.id, { commission_rate: numRate })
      toast({ title: 'Sucesso', description: 'Taxa de comissão atualizada com sucesso!' })
      setEditUser(null)
      loadAffiliates()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestão de Afiliados</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie as taxas de comissão e acompanhe o desempenho dos parceiros.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Afiliados Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Taxa de Comissão</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || 'Sem nome'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {user.affiliate_code || user.id.substring(0, 8)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium text-emerald-600">
                          {user.commission_rate ? `${user.commission_rate}%` : 'Não definida'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Ajustar Taxa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {affiliates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum afiliado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Taxa de Comissão</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Afiliado</Label>
              <Input
                value={editUser?.name || editUser?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Taxa (%) - Entre 0.5 e 2.0</Label>
              <div className="relative">
                <Input
                  id="rate"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2.0"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="pl-8"
                />
                <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
