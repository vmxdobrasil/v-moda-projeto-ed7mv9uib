import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'

export default function Unauthorized() {
  useSEO({
    title: 'Acesso Negado',
    description: 'Você não tem permissão para acessar esta página.',
  })

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background text-center px-4 animate-fade-in">
      <div className="inline-flex items-center justify-center p-6 bg-destructive/10 rounded-full mb-8">
        <ShieldAlert className="w-16 h-16 md:w-20 md:h-20 text-destructive" />
      </div>
      <h1 className="text-4xl md:text-5xl font-serif mb-4">Acesso Restrito</h1>
      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
        Você não possui as permissões necessárias para visualizar esta página. Caso acredite que
        isto seja um erro, entre em contato com o suporte ou retorne ao início.
      </p>
      <Button asChild size="lg" className="gap-2 rounded-none uppercase tracking-widest px-8">
        <Link to="/">Voltar para o Início</Link>
      </Button>
    </div>
  )
}
