import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Shield, Trash2, Plus, Globe } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useMagazineStore } from '@/stores/useMagazineStore'

interface User {
  id: string
  name: string
  email: string
  role: 'administrador' | 'gerente'
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin Supremo', email: 'admin@vmoda.com', role: 'administrador' },
  { id: '2', name: 'Maria Gerente', email: 'maria@vmoda.com', role: 'gerente' },
]

export default function Settings() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', email: '', role: 'gerente' })
  const { externalUrl, setExternalUrl } = useMagazineStore()
  const [urlInput, setUrlInput] = useState(externalUrl)

  const handleSaveUrl = () => {
    setExternalUrl(urlInput)
    toast({ description: 'URL da Revista Digital atualizada com sucesso!' })
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({ description: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }
    const user: User = { ...newUser, id: Math.random().toString() } as User
    setUsers([...users, user])
    setNewUser({ name: '', email: '', role: 'gerente' })
    toast({ description: 'Usuário adicionado com sucesso!' })
  }

  const handleRemoveUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
    toast({ description: 'Usuário removido!' })
  }

  const handleSwitchMyRole = (role: string) => {
    localStorage.setItem('admin_role', role)
    toast({
      description: `Seu papel foi alterado para ${role === 'administrador' ? 'Administrador' : 'Gerente'}. Atualizando painel...`,
    })
    setTimeout(() => window.location.reload(), 1000)
  }

  const currentRole = localStorage.getItem('admin_role') || 'administrador'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie acessos e permissões da equipe.
        </p>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Simulador de Acesso (Apenas Demonstração)
          </CardTitle>
          <CardDescription>
            Alterne seu nível de acesso atual para testar as restrições do painel. Gerentes não têm
            acesso a Relatórios nem Configurações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={currentRole === 'administrador' ? 'default' : 'outline'}
              onClick={() => handleSwitchMyRole('administrador')}
            >
              Sou Administrador
            </Button>
            <Button
              variant={currentRole === 'gerente' ? 'default' : 'outline'}
              onClick={() => handleSwitchMyRole('gerente')}
            >
              Sou Gerente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Integração Externa (Revista Digital)
          </CardTitle>
          <CardDescription>
            Configure a URL do site da revista para direcionamento e SEO da página pública
            (/revista).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
            <div className="flex-1 space-y-2">
              <Label htmlFor="magUrl">URL da Revista Digital</Label>
              <Input
                id="magUrl"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.revistamodaatual.com.br"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveUrl}>Salvar URL</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Novo Membro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nível de Acesso</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(v: any) => setNewUser({ ...newUser, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                  </SelectContent>{' '}
                </Select>
              </div>
              <Button onClick={handleAddUser} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipe e Permissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Acesso</TableHead>
                      <TableHead className="w-[80px] text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'administrador' ? 'default' : 'secondary'}>
                            {user.role === 'administrador' ? 'Administrador' : 'Gerente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
