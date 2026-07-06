import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Activity,
  CheckSquare,
  FileText,
  BarChart3,
  Shield,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Painel', path: '/crm', icon: LayoutDashboard },
  { label: 'Leads', path: '/crm/leads', icon: Users },
  { label: 'Pipeline', path: '/crm/pipeline', icon: GitBranch },
  { label: 'Atividades', path: '/crm/atividades', icon: Activity },
  { label: 'Tarefas', path: '/crm/tarefas', icon: CheckSquare },
  { label: 'Propostas', path: '/crm/propostas', icon: FileText },
  { label: 'Relatórios', path: '/crm/relatorios', icon: BarChart3 },
  { label: 'Gestão Admin', path: '/crm/admin', icon: Shield },
]

export function GlassSidebar() {
  const location = useLocation()

  const getIsActive = (path: string) => {
    if (path === '/crm') return location.pathname === '/crm'
    return location.pathname.startsWith(path)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="crm-sidebar w-[76px] shrink-0 flex flex-col items-center py-6 gap-2">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-electric flex items-center justify-center mb-4 cta-glow">
          <span className="text-white font-display font-bold text-xl">V</span>
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = getIsActive(item.path)
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:-translate-y-0.5',
                    isActive
                      ? 'bg-primary/20 text-primary shadow-glow'
                      : 'text-white/50 hover:text-primary hover:bg-white/5',
                  )}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-navy text-white border-white/10 rounded-xl"
              >
                {item.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </aside>
    </TooltipProvider>
  )
}
