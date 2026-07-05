import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useRouteLabels } from '@/hooks/use-route-labels'
import { cn } from '@/lib/utils'

export function BreadcrumbNav({ className }: { className?: string }) {
  const { breadcrumbs } = useRouteLabels()

  if (breadcrumbs.length === 0) {
    return (
      <nav className={cn('flex items-center gap-1.5 text-sm', className)}>
        <Home className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Início</span>
      </nav>
    )
  }

  return (
    <nav className={cn('flex items-center gap-1.5 text-sm min-w-0', className)}>
      <Link
        to="/"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {breadcrumbs.map((crumb, i) => {
        const isLast = i === breadcrumbs.length - 1
        return (
          <div key={crumb.path} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            {isLast ? (
              <span className="font-medium text-foreground truncate">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
