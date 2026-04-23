import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center animate-fade-in">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Página não encontrada</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Button asChild size="lg">
        <Link to="/">Voltar para o Início</Link>
      </Button>
    </div>
  )
}
