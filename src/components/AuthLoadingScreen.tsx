import { cn } from '@/lib/utils'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'

export function AuthLoadingScreen({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-background animate-fade-transition',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <img
          src={logoUrl}
          alt="V MODA Brasil"
          className="h-12 w-auto object-contain opacity-80 animate-fade-in"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Verificando sessão...</p>
          <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
