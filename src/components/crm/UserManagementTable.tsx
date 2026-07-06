import { useState, useEffect, useCallback } from 'react'
import {
  getUsers,
  updateUserRole,
  updateUserWaitlist,
  updateUserApprovalStatus,
  deleteUser,
} from '@/services/admin-users'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRealtime } from '@/hooks/use-realtime'

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manufacturer', label: 'Fabricante' },
  { value: 'retailer', label: 'Varejista' },
  { value: 'affiliate', label: 'Afiliado' },
  { value: 'agent', label: 'Agente' },
  { value: 'fashionista', label: 'Fashionista' },
]

const APPROVAL_STATUSES = [
  { value: 'pending', label: 'Pendente' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'denied', label: 'Negado' },
]

export function UserManagementTable() {
  const [users, setUsers] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUsers(page, 10, search)
      setUsers(res.items)
      setTotalPages(res.totalPages)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(), 300)
    return () => clearTimeout(timer)
  }, [loadUsers])

  useRealtime('users', () => loadUsers())

  const handleRoleChange = async (userId: string, role: string, userName: string) => {
    try {
      await updateUserRole(userId, role, userName)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
      toast.success(`Role atualizado para ${userName}`)
    } catch {
      toast.error('Erro ao atualizar role')
    }
  }

  const handleWaitlistToggle = async (userId: string, checked: boolean, userName: string) => {
    try {
      await updateUserWaitlist(userId, checked, userName)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_waitlisted: checked } : u)))
      toast.success(`${userName} ${checked ? 'adicionado à lista de espera' : 'liberado'}`)
    } catch {
      toast.error('Erro ao atualizar lista de espera')
    }
  }

  const handleApprovalChange = async (userId: string, status: string, userName: string) => {
    try {
      await updateUserApprovalStatus(userId, status, userName)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, approval_status: status } : u)))
      toast.success(`Aprovação de ${userName} atualizada`)
    } catch {
      toast.error('Erro ao atualizar aprovação')
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Remover ${userName} da plataforma?`)) return
    try {
      await deleteUser(userId, userName)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success('Usuário removido')
    } catch {
      toast.error('Erro ao remover usuário')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10 max-w-md">
        <Search className="w-4 h-4 text-white/40 mr-2" />
        <Input
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
          className="border-0 bg-transparent p-0 h-auto text-sm text-white placeholder:text-white/40 focus-visible:ring-0"
        />
      </div>
      <div className="rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-xs text-white/50 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Espera</th>
                <th className="px-4 py-3 font-medium">Aprovação</th>
                <th className="px-4 py-3 font-medium">Criado</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-white/40">
                    Carregando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-white/40">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border border-white/10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-electric text-white text-xs">
                            {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-white">
                          {u.name || 'Sem nome'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">{u.email}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.role || ''}
                        onValueChange={(v) => handleRoleChange(u.id, v, u.name || u.email)}
                      >
                        <SelectTrigger className="w-36 h-8 bg-white/5 border-white/10 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={!!u.is_waitlisted}
                        onCheckedChange={(checked) =>
                          handleWaitlistToggle(u.id, checked, u.name || u.email)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.approval_status || 'pending'}
                        onValueChange={(v) => handleApprovalChange(u.id, v, u.name || u.email)}
                      >
                        <SelectTrigger className="w-32 h-8 bg-white/5 border-white/10 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPROVAL_STATUSES.map((a) => (
                            <SelectItem key={a.value} value={a.value}>
                              {a.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 whitespace-nowrap">
                      {u.created
                        ? format(new Date(u.created), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(u.id, u.name || u.email)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border-white/10 text-white/60 hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border-white/10 text-white/60 hover:bg-white/5"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
