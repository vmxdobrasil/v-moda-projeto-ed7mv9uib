import { useState } from 'react'
import { UserManagementTable } from '@/components/crm/UserManagementTable'
import { ActivityLogTable } from '@/components/crm/ActivityLogTable'
import { Shield, ScrollText, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'users', label: 'Gestão de Usuários', icon: Users },
  { id: 'logs', label: 'Logs de Atividade', icon: ScrollText },
] as const

export default function CrmAdmin() {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users')

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-electric flex items-center justify-center cta-glow">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Painel Administrativo</h1>
          <p className="text-sm text-white/50">Gestão de usuários e auditoria de atividades</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-glow'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'users' ? <UserManagementTable /> : <ActivityLogTable />}
    </div>
  )
}
