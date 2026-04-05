import { useNavigate } from 'react-router-dom'
import { BadgeCheck, MessageCircle, MapPin, Trophy, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import pb from '@/lib/pocketbase/client'
import { FavoriteButton } from './FavoriteButton'

export function BrandCard({ brand }: { brand: any }) {
  const navigate = useNavigate()
  const isTop60 = (brand.ranking_position > 0 && brand.ranking_position <= 60) || brand.is_exclusive

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (brand.id) {
      pb.send(`/backend/v1/partners/${brand.id}/click`, { method: 'POST' }).catch(console.error)
    }
    if (brand.phone) {
      window.open(`https://wa.me/${brand.phone.replace(/\D/g, '')}`, '_blank')
    }
  }

  return (
    <Card
      onClick={() => navigate(`/marcas/${brand.id}`)}
      className={`relative h-full flex flex-col group cursor-pointer hover:shadow-lg transition-all duration-300 ${isTop60 ? 'border-primary/50 bg-primary/5' : ''}`}
    >
      <div className="absolute top-3 right-3 z-20">
        <FavoriteButton brandId={brand.id} />
      </div>

      {isTop60 && (
        <div className="absolute -top-3 -left-3 z-10">
          <Badge className="bg-primary text-primary-foreground shadow-md flex items-center gap-1 py-1 px-3">
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">TOP 60</span>
          </Badge>
        </div>
      )}

      <CardContent className="p-6 flex flex-col items-center text-center flex-1 pt-8">
        <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-md">
          <AvatarImage
            src={
              brand.avatar
                ? pb.files.getUrl(brand, brand.avatar, { thumb: '200x200' })
                : `https://img.usecurling.com/ppl/medium?seed=${brand.id}&gender=female`
            }
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <AvatarFallback className="text-xl font-serif">
            {brand.name ? brand.name.substring(0, 2).toUpperCase() : 'BR'}
          </AvatarFallback>
        </Avatar>

        <h3
          className="font-serif text-lg font-medium mb-1 w-full flex items-center justify-center gap-1.5"
          title={brand.name}
        >
          <span className="truncate">{brand.name || 'Marca Desconhecida'}</span>
          {brand.is_verified && (
            <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" title="Verificado" />
          )}
        </h3>

        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {brand.ranking_category ? brand.ranking_category.replace(/_/g, ' ') : 'Varejo / Revenda'}
        </div>

        {brand.rating_count > 0 && (
          <div className="flex items-center gap-1 text-sm font-medium text-amber-500 mb-2">
            <Star className="w-4 h-4 fill-amber-500" />
            {brand.rating_average?.toFixed(1)}
            <span className="text-muted-foreground text-xs font-normal">
              ({brand.rating_count})
            </span>
          </div>
        )}

        {brand.city && brand.state ? (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[150px]">
              {brand.city}, {brand.state}
            </span>
          </div>
        ) : brand.exclusivity_zone ? (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[150px]">{brand.exclusivity_zone}</span>
          </div>
        ) : (
          <div className="h-4 mb-4" /> // spacing filler
        )}

        <div className="mt-auto pt-4 w-full relative z-20">
          {brand.phone ? (
            <Button
              variant={isTop60 ? 'default' : 'outline'}
              className={`w-full h-10 ${!isTop60 ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200' : ''}`}
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contato
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              className="w-full h-10 bg-muted/50 text-muted-foreground border-dashed"
            >
              Sem Contato
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
