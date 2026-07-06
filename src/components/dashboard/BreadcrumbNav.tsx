import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useRouteLabels } from '@/hooks/use-route-labels'
import { useAuth } from '@/hooks/use-auth'
import { getRoleBasedRedirect } from '@/lib/auth-redirects'
import { cn } from '@/lib/utils'

export function BreadcrumbNav({ className }: { className?: string }) {
  const { breadcrumbs } = useRouteLabels()
  const { user } = useAuth()
  const homePath = user ? getRoleBasedRedirect(user) : '/'

  if (breadcrumbs.length === 0) {
    return (
      <nav className={cn('flex items-center gap-1.5 text-sm', className)}>
        <Home className="h-3.5 w-3.5 opacity-60" />
        <span className="opacity-60">Início</span>
      </nav>
    )
  }

  return (
    <nav className={cn('flex items-center gap-1.5 text-sm min-w-0', className)}>
      <Link
        to={homePath}
        className="flex items-center opacity-60 hover:opacity-100 transition-opacity shrink-0"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {breadcrumbs.map((crumb, i) => {
        const isLast = i === breadcrumbs.length - 1
        return (
          <div key={crumb.path} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="h-3.5 w-3.5 opacity-40 shrink-0" />
            {isLast ? (
              <span className="font-medium truncate">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="opacity-60 hover:opacity-100 transition-opacity truncate"
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
