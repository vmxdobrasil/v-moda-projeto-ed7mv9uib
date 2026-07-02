import { GuideDirectory } from '@/components/guia-de-moda/GuideDirectory'
import { useSEO } from '@/hooks/useSEO'

export default function GuiaCompras() {
  useSEO({
    title: 'Guia de Compras B2B | V MODA BRASIL',
    description: 'Descubra fabricantes e lojas de fábrica no B2B V MODA BRASIL.',
  })

  return (
    <div className="container py-12 animate-fade-in mt-16">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">
          Guia de Compras B2B
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Descubra os melhores fabricantes e lojas de fábrica do polo de moda. Conecte-se
          diretamente para compras no atacado.
        </p>
      </div>
      <GuideDirectory />
    </div>
  )
}
