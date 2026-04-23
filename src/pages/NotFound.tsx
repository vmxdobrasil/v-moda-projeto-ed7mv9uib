import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4 animate-fade-in-up">
      <div className="space-y-6 flex flex-col items-center">
        <div className="rounded-full bg-primary/10 p-6 mb-2">
          <LayoutDashboard className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-8xl font-bold tracking-tighter text-primary">404</h1>
        <h2 className="text-3xl font-semibold tracking-tight">Página não encontrada</h2>
        <p className="text-muted-foreground max-w-sm mx-auto text-lg">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="pt-6">
          <Button asChild size="lg" className="px-8">
            <Link to="/">Voltar para o Início</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
