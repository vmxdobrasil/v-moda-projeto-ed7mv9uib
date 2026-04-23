import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-center px-4 animate-fade-in-up">
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
      </div>
      <h2 className="text-3xl font-semibold tracking-tight mb-3">Página não encontrada</h2>
      <p className="text-muted-foreground max-w-md mb-8 text-lg">
        A página que você está procurando não existe, foi movida ou você não tem permissão para
        acessá-la.
      </p>
      <Button asChild size="lg" className="rounded-full px-8">
        <Link to="/">Voltar para o Dashboard</Link>
      </Button>
    </div>
  )
}
