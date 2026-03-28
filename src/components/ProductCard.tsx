import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Product, formatPrice } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import useCartStore from '@/stores/useCartStore'
import useWishlistStore from '@/stores/useWishlistStore'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast()
  const { addToCart } = useCartStore()
  const { toggleWishlist, isInWishlist } = useWishlistStore()
  const isWishlisted = isInWishlist(product.id)
  const [open, setOpen] = useState(false)

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault()
    addToCart(product)
    setOpen(false)
    toast({
      title: 'Adicionado ao carrinho',
      description: `${product.name} foi adicionado.`,
    })
  }

  return (
    <div className="group flex flex-col gap-4 h-full">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <Link to={`/produto/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault()
            toggleWishlist(product.id)
          }}
          className="absolute right-4 top-4 z-10 p-2 transition-transform hover:scale-110 focus:outline-none"
          aria-label="Adicionar aos favoritos"
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-colors duration-300',
              isWishlisted ? 'fill-accent text-accent' : 'text-primary/70 hover:text-primary',
            )}
          />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="w-full rounded-none bg-white/90 hover:bg-black hover:text-white backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault()
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualização Rápida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white rounded-none border-none shadow-2xl">
              <DialogTitle className="sr-only">{product.name}</DialogTitle>
              <DialogDescription className="sr-only">{product.description}</DialogDescription>
              <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto bg-secondary">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 w-full md:w-1/2 flex flex-col justify-center gap-6 overflow-y-auto">
                  <div>
                    <h2 className="text-2xl font-serif mb-2">{product.name}</h2>
                    <p className="text-xl text-primary">{formatPrice(product.price)}</p>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.description}
                  </p>
                  <Button
                    onClick={() => handleAddToCart()}
                    className="w-full rounded-none h-12 uppercase tracking-widest mt-4"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Link
            to={`/produto/${product.id}`}
            className="flex w-full items-center justify-center bg-white/90 py-2.5 text-sm font-medium text-black backdrop-blur-sm transition-colors hover:bg-black hover:text-white"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-grow justify-between">
        <div className="flex flex-col gap-1">
          <Link to={`/produto/${product.id}`} className="group-hover:underline">
            <h3 className="font-sans text-sm font-medium text-primary line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="font-sans text-sm text-muted-foreground">{formatPrice(product.price)}</p>
        </div>
        <Button
          variant="outline"
          className="w-full gap-2 rounded-none mt-auto hover:bg-primary hover:text-white"
          onClick={(e) => {
            e.preventDefault()
            handleAddToCart(e)
          }}
        >
          <ShoppingBag className="h-4 w-4" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  )
}
