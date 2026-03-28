import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { FadeIn } from '@/components/FadeIn'
import { ProductCard } from '@/components/ProductCard'
import { PRODUCTS } from '@/lib/data'
import { Button } from '@/components/ui/button'
import useWishlistStore from '@/stores/useWishlistStore'

export default function Wishlist() {
  const { items: wishlistIds } = useWishlistStore()

  const favoriteProducts = PRODUCTS.filter((product) => wishlistIds.includes(product.id))

  return (
    <div className="pt-32 pb-24 container min-h-screen">
      <FadeIn>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 flex items-center gap-4">
            Lista de Desejos
            <Heart className="w-8 h-8 text-accent fill-accent" />
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Seus itens favoritos salvos para você comprar quando quiser.
          </p>
        </div>
      </FadeIn>

      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
          {favoriteProducts.map((product, i) => (
            <FadeIn key={product.id} delay={i * 50}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Heart className="w-16 h-16 text-muted-foreground mb-6 opacity-20" />
          <h2 className="text-2xl font-serif mb-4">Sua lista está vazia</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Você ainda não salvou nenhum produto. Explore nossas coleções e clique no coração para
            salvar seus itens favoritos.
          </p>
          <Link to="/colecoes">
            <Button className="rounded-none uppercase tracking-widest px-8">
              Explorar Coleções
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
