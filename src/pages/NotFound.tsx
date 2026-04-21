import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'

export default function NotFound() {
  useSEO({
    title: 'Página Não Encontrada',
    description: 'A página que você está procurando não existe ou foi movida.',
  })

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background text-center px-4 animate-fade-in">
      <h1 className="text-8xl md:text-9xl font-serif mb-4 text-primary">404</h1>
      <h2 className="text-2xl md:text-3xl font-medium mb-6">Página Não Encontrada</h2>
      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
        A página que você está procurando não existe, foi movida ou você digitou o endereço
        incorretamente.
      </p>
      <Button asChild size="lg" className="gap-2 rounded-none uppercase tracking-widest px-8">
        <Link to="/">
          <Home className="w-4 h-4" />
          Voltar para o Início
        </Link>
      </Button>
    </div>
  )
}
