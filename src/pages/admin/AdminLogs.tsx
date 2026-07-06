import { ActivityLogTable } from '@/components/crm/ActivityLogTable'
import { Activity } from 'lucide-react'

export default function AdminLogs() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Logs de Atividade</h1>
          <p className="text-muted-foreground mt-1">
            Histórico auditável de todas as ações críticas realizadas na plataforma.
          </p>
        </div>
      </div>
      <ActivityLogTable />
    </div>
  )
}
