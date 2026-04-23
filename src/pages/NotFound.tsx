import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-center animate-fade-in-up p-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Página não encontrada</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        A página que você está procurando não existe, foi movida ou você não tem permissão para
        acessá-la.
      </p>
      <Button asChild size="lg">
        <Link to="/">Voltar para o Início</Link>
      </Button>
    </div>
  )
}
