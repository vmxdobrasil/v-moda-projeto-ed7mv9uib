import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ChevronRight, Loader2 } from 'lucide-react'
import { PRODUCTS, formatPrice } from '@/lib/data'
import { FadeIn } from '@/components/FadeIn'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useToast } from '@/hooks/use-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const { toast } = useToast()
  const product = PRODUCTS.find((p) => p.id === id)

  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Reset state when route changes
  useEffect(() => {
    setActiveImage(0)
    setSelectedSize('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-32 text-center">
        <h1 className="text-3xl font-serif mb-4">Produto não encontrado</h1>
        <Link
          to="/colecoes"
          className="text-accent hover:underline uppercase tracking-widest text-sm"
        >
          Voltar para coleções
        </Link>
      </div>
    )
  }

  const allImages = [product.image, ...product.images]
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 4)

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Selecione um tamanho',
        description: 'Por favor, escolha um tamanho antes de adicionar à sacola.',
        variant: 'destructive',
      })
      return
    }

    setIsAdding(true)
    setTimeout(() => {
      setIsAdding(false)
      toast({
        title: 'Adicionado ao Carrinho',
        description: `${product.name} (Tamanho: ${selectedSize}) foi adicionado com sucesso.`,
      })
    }, 800)
  }

  return (
    <div className="pt-32 pb-24">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-8">
          <Link to="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/colecoes" className="hover:text-primary transition-colors">
            Coleções
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">{product.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible md:w-24 shrink-0 hide-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-[3/4] md:w-full overflow-hidden shrink-0 w-20 transition-all ${activeImage === idx ? 'ring-1 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative aspect-[3/4] bg-muted overflow-hidden cursor-zoom-in group">
              <FadeIn className="h-full w-full">
                <img
                  src={allImages[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110"
                />
              </FadeIn>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col">
            <FadeIn delay={100}>
              <h1 className="text-3xl md:text-4xl font-serif mb-2">{product.name}</h1>
              <p className="text-xl mb-8">{formatPrice(product.price)}</p>

              <div className="mb-8">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Colors */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <span className="block text-sm font-medium uppercase tracking-widest mb-3">
                    Cores
                  </span>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        style={{ backgroundColor: color }}
                        aria-label={`Cor ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium uppercase tracking-widest">Tamanho</span>
                  <button className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary">
                    Guia de Medidas
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 border text-sm transition-all ${selectedSize === size ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  className="flex-1 rounded-none h-14 uppercase tracking-widest text-sm"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Adicionar ao Carrinho'
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-none h-14 uppercase tracking-widest text-sm"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  Comprar Agora
                </Button>
                <Button
                  variant="outline"
                  className="w-14 h-14 rounded-none shrink-0 border-border self-center sm:self-auto"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-accent text-accent' : ''}`}
                  />
                </Button>
              </div>

              {/* Details Accordion */}
              <Accordion type="single" collapsible className="w-full border-t border-border">
                <AccordionItem value="details">
                  <AccordionTrigger className="font-serif text-lg hover:no-underline py-5">
                    Detalhes do Produto
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-6">
                    Composição detalhada não disponível para mock. Mas imagine tecidos nobres,
                    acabamento feito à mão e modelagem que valoriza a silhueta com elegância
                    atemporal.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger className="font-serif text-lg hover:no-underline py-5">
                    Envio e Devolução
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-6">
                    Frete grátis para todo o Brasil em compras acima de R$ 1.500. Devoluções
                    gratuitas em até 30 dias após o recebimento.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-32 container border-t border-border pt-20">
          <FadeIn>
            <h2 className="text-3xl font-serif text-center mb-12">Você Também Pode Gostar</h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((product, i) => (
              <FadeIn key={product.id} delay={i * 100}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
