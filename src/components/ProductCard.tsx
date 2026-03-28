import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Product, formatPrice } from '@/lib/data'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <div className="group flex flex-col gap-4">
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

      <div className="flex flex-col gap-1">
        <Link to={`/produto/${product.id}`} className="group-hover:underline">
          <h3 className="font-sans text-sm font-medium text-primary">{product.name}</h3>
        </Link>
        <p className="font-sans text-sm text-muted-foreground">{formatPrice(product.price)}</p>
      </div>
    </div>
  )
}
