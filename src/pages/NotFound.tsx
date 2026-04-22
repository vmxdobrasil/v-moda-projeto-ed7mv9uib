import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center p-4 animate-in fade-in zoom-in duration-500">
      <div className="rounded-full bg-muted p-6 mb-6">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
      </div>
      <h1 className="text-6xl font-bold text-primary mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl font-semibold mb-2 tracking-tight">Página não encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        O link que você acessou pode estar quebrado ou a página pode ter sido removida.
      </p>
      <Button asChild size="lg" className="font-medium">
        <Link to="/">Voltar para o Início</Link>
      </Button>
    </div>
  )
}
