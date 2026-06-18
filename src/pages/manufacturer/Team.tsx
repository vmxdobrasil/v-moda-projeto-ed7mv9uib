import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

interface TeamMember {
  id: string
  name: string
  email: string
  brand_role: string
  created: string
}

export default function ManufacturerTeam() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberPassword, setNewMemberPassword] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('salesperson')
  const [adding, setAdding] = useState(false)

  const loadTeam = async () => {
    try {
      const records = await pb.collection('users').getFullList({
        filter: `parent_brand = "${user?.id}" || id = "${user?.id}"`,
        sort: 'created',
      })
      setMembers(records as unknown as TeamMember[])
    } catch (err) {
      console.error('Failed to load team', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadTeam()
  }, [user])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setAdding(true)
    try {
      await pb.collection('users').create({
        name: newMemberName,
        email: newMemberEmail,
        password: newMemberPassword,
        passwordConfirm: newMemberPassword,
        role: 'manufacturer',
        brand_role: newMemberRole,
        parent_brand: user.id,
      })

      toast({ title: 'Membro adicionado com sucesso!' })
      setIsDialogOpen(false)
      loadTeam()
    } catch (err: any) {
      toast({
        title: 'Erro ao adicionar',
        description: err.message || 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setAdding(false)
    }
  }

  const roleLabel = (role: string) => {
    switch (role) {
      case 'ceo':
        return 'CEO / Proprietário'
      case 'manager':
        return 'Gerente'
      case 'salesperson':
        return 'Vendedor(a)'
      default:
        return role
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe da Marca</h1>
          <p className="text-muted-foreground">Gerencie acessos para sua TOP 60 MARCA.</p>
        </div>

        {user?.brand_role === 'ceo' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Adicionar Membro</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Membro</DialogTitle>
                <DialogDescription>
                  Crie um acesso para um gerente ou vendedor da sua marca.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Corporativo</Label>
                  <Input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha Inicial</Label>
                  <Input
                    type="password"
                    value={newMemberPassword}
                    onChange={(e) => setNewMemberPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Função</Label>
                  <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="salesperson">Vendedor(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={adding}>
                  {adding ? 'Salvando...' : 'Adicionar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros Atuais</CardTitle>
          <CardDescription>Pessoas com acesso ao painel da sua marca.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name}
                        {member.id === user?.id && ' (Você)'}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{roleLabel(member.brand_role)}</TableCell>
                      <TableCell className="text-right">
                        {user?.brand_role === 'ceo' && member.id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            Remover
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum membro encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
