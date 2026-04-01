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

        {/* Col 2: Institucional */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-lg tracking-wider uppercase mb-2">Institucional</h4>
          <Link
            to="/sobre-nos"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Sobre Nós
          </Link>
          <Link
            to="/contato"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Fale Conosco
          </Link>
          <Link
            to="/faq"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Perguntas Frequentes
          </Link>
        </div>

        {/* Col 3: Links Úteis */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-lg tracking-wider uppercase mb-2">Links Úteis</h4>
          <Link
            to="/revista"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Revista Digital
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
          <Link
            to="/favoritos"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
          >
            Lista de Desejos
          </Link>
          <Link
            to="/admin"
            className="text-sm text-primary-foreground/70 hover:text-white transition-colors mt-2 font-semibold"
          >
            Painel Administrativo
          </Link>
        </div>

        {/* Col 4: Redes Sociais & Newsletter */}
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="font-serif text-lg tracking-wider uppercase mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-primary-foreground/10 hover:bg-accent hover:text-white rounded-full transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-primary-foreground/10 hover:bg-blue-600 hover:text-white rounded-full transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-primary-foreground/10 hover:bg-green-500 hover:text-white rounded-full transition-all duration-300"
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
