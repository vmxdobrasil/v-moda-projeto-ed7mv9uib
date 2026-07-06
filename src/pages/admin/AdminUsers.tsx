import { UserManagementTable } from '@/components/crm/UserManagementTable'
import { Users } from 'lucide-react'

export default function AdminUsers() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie usuários, roles, aprovações e lista de espera da plataforma.
          </p>
        </div>
      </div>
      <UserManagementTable />
    </div>
  )
}
