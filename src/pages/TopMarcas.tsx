import { TopMarcasSection } from '@/components/guia-de-moda/TopMarcasSection'
import { useSEO } from '@/hooks/useSEO'

export default function TopMarcas() {
  useSEO({
    title: 'Top 100 Marcas | V MODA BRASIL',
    description: 'As marcas elite do atacado brasileiro. Vitrine do TOP 100 V MODA.',
  })

  return (
    <div className="container py-12 animate-fade-in mt-16">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">
          Top 100 Marcas
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A vitrine elite das marcas mais verificadas e bem avaliadas do ecossistema V MODA BRASIL.
        </p>
      </div>
      <TopMarcasSection />
    </div>
  )
}
