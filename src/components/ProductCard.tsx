import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Product, formatPrice } from '@/lib/data'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { toast } = useToast()

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
            setIsWishlisted(!isWishlisted)
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

        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link
            to={`/produto/${product.id}`}
            className="flex w-full items-center justify-center bg-white/90 py-3 text-sm font-medium text-black backdrop-blur-sm transition-colors hover:bg-black hover:text-white"
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
          className="w-full gap-2 rounded-none mt-auto"
          onClick={(e) => {
            e.preventDefault()
            toast({
              title: 'Adicionado ao carrinho',
              description: `${product.name} foi adicionado.`,
            })
          }}
        >
          <ShoppingBag className="h-4 w-4" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  )
}
