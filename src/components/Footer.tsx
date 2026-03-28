import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Instagram, Facebook, MessageCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function Footer() {
  const { toast } = useToast()

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      description: 'Obrigado por se inscrever! Você receberá nossas novidades em breve.',
    })
    const form = e.target as HTMLFormElement
    form.reset()
  }

  return (
    <footer className="bg-primary text-primary-foreground pt-20 pb-10">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
        {/* Col 1: Sobre */}
        <div className="flex flex-col gap-6">
          <Link to="/" className="font-serif text-3xl font-bold tracking-widest uppercase">
            V Moda
          </Link>
          <p className="text-sm text-primary-foreground/70 text-balance leading-relaxed">
            Elevando o conceito de luxo e sofisticação. Peças exclusivas para quem busca
            autenticidade e elegância.
          </p>
        </div>

        {/* Col 2: Links Úteis */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-lg tracking-wider uppercase mb-2">Links Úteis</h4>
          <Link
            to="/"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Início
          </Link>
          <Link
            to="/colecoes"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Coleções
          </Link>
          <Link
            to="/meus-pedidos"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Minha Conta
          </Link>
        </div>

        {/* Col 3: Políticas */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-lg tracking-wider uppercase mb-2">Políticas</h4>
          <Link
            to="#"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Política de Privacidade
          </Link>
          <Link
            to="#"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Termos de Uso
          </Link>
          <Link
            to="#"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Trocas e Devoluções
          </Link>
        </div>

        {/* Col 4: Redes Sociais & Newsletter */}
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="font-serif text-lg tracking-wider uppercase mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-full transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-serif text-lg tracking-wider uppercase mb-2">Newsletter</h4>
            <p className="text-sm text-primary-foreground/70 mb-3">
              Receba novidades e ofertas exclusivas.
            </p>
            <form className="flex flex-col gap-3" onSubmit={handleNewsletter}>
              <Input
                type="email"
                required
                placeholder="Seu melhor e-mail"
                className="bg-transparent border-primary-foreground/20 text-white placeholder:text-white/40 rounded-none focus-visible:ring-1 focus-visible:ring-white h-10"
              />
              <Button
                type="submit"
                variant="secondary"
                className="rounded-none h-10 w-full font-medium tracking-wide uppercase text-xs"
              >
                Inscrever-se
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container flex flex-col items-center justify-center pt-8 border-t border-primary-foreground/10 text-xs text-primary-foreground/50 text-center">
        <p>© 2024 V Moda. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
