import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-20 pb-10">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
        {/* Brand */}
        <div className="flex flex-col gap-6">
          <Link to="/" className="font-serif text-3xl font-bold tracking-widest uppercase">
            V Moda
          </Link>
          <p className="text-sm text-primary-foreground/70 text-balance leading-relaxed">
            Elevando o conceito de luxo e sofisticação. Peças exclusivas para quem busca
            autenticidade e elegância.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-lg tracking-wider uppercase mb-2">Explorar</h4>
          <Link
            to="/colecoes"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Novidades
          </Link>
          <Link
            to="/colecoes"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Coleção Inverno
          </Link>
          <Link
            to="/colecoes"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Acessórios
          </Link>
          <Link
            to="/colecoes"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Editorial
          </Link>
        </div>

        {/* Help */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-lg tracking-wider uppercase mb-2">Atendimento</h4>
          <Link
            to="#"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Fale Conosco
          </Link>
          <Link
            to="#"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Entregas e Devoluções
          </Link>
          <Link
            to="#"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Guia de Tamanhos
          </Link>
          <Link
            to="#"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            FAQ
          </Link>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-lg tracking-wider uppercase mb-2">Fale Conosco</h4>
          <p className="text-sm text-primary-foreground/70 mb-2">
            Deixe sua mensagem para nossa equipe.
          </p>
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <Input
              type="text"
              placeholder="Nome"
              className="bg-transparent border-primary-foreground/20 text-white placeholder:text-white/40 rounded-none focus-visible:ring-1 focus-visible:ring-white h-10"
            />
            <Input
              type="email"
              placeholder="E-mail"
              className="bg-transparent border-primary-foreground/20 text-white placeholder:text-white/40 rounded-none focus-visible:ring-1 focus-visible:ring-white h-10"
            />
            <textarea
              placeholder="Mensagem"
              className="flex min-h-[80px] w-full bg-transparent border border-primary-foreground/20 px-3 py-2 text-sm text-white placeholder:text-white/40 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white resize-none"
            />
            <Button
              type="submit"
              variant="secondary"
              className="rounded-none h-10 w-full font-medium tracking-wide uppercase text-xs mt-1"
            >
              Enviar Mensagem
            </Button>
          </form>
        </div>
      </div>

      <div className="container flex flex-col md:flex-row items-center justify-between pt-8 border-t border-primary-foreground/10 gap-4 text-xs text-primary-foreground/50">
        <p>&copy; {new Date().getFullYear()} V MODA. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <Link to="#" className="hover:text-white transition-colors">
            Termos de Uso
          </Link>
          <Link to="#" className="hover:text-white transition-colors">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
