import { Construction } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DevPlaceholderProps {
  title: string
  description?: string
  className?: string
}

export function DevPlaceholder({ title, description, className }: DevPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex min-h-[60vh] flex-col items-center justify-center rounded-2xl p-8 text-center animate-fade-in-up',
        'bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl',
        'border border-orange-500/20 shadow-2xl shadow-orange-500/5',
        className,
      )}
    >
      <div className="mb-6 rounded-full bg-orange-500/10 p-5 ring-1 ring-orange-500/30">
        <Construction className="h-10 w-10 text-orange-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
      <p className="mt-3 text-base text-orange-300/80">Conteúdo em desenvolvimento</p>
      {description && <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>}
    </div>
  )
}
