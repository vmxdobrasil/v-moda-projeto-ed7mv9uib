import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { createLead } from '@/services/leads'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface QueroRevenderButtonProps {
  manufacturerId: string
  brandId: string
  brandName: string
  phone?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function QueroRevenderButton({
  manufacturerId,
  brandId,
  brandName,
  phone,
  className,
  variant = 'default',
  size = 'default',
}: QueroRevenderButtonProps) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast.info('Faça login para se candidatar como revendedora.')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      await createLead({
        retailer: user.id,
        manufacturer: manufacturerId,
        brand: brandId,
        status: 'pending',
      })
      toast.success('Interesse registrado! A marca entrará em contato.')

      if (phone) {
        const msg = encodeURIComponent(
          `Olá! Tenho interesse em revender os produtos da ${brandName}.`,
        )
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
      }
    } catch (err) {
      toast.error('Erro ao registrar interesse. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={variant}
      size={size}
      className={cn(
        'bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md',
        className,
      )}
    >
      <Store className="w-4 h-4 mr-2" />
      {loading ? 'Enviando...' : 'Quero Revender'}
    </Button>
  )
}
