import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function AffiliateLeadForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const affiliateRef =
    searchParams.get('ref') || sessionStorage.getItem('vmoda_affiliate_ref') || ''
  let affiliateSrc =
    searchParams.get('src') || sessionStorage.getItem('vmoda_affiliate_src') || 'social_profile'

  if (!['whatsapp_group', 'social_profile'].includes(affiliateSrc)) {
    affiliateSrc = 'social_profile'
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const phone = formData.get('phone') as string

      let manufacturerId = ''
      try {
        const mfg = await pb.collection('users').getFirstListItem('role="manufacturer"')
        manufacturerId = mfg.id
      } catch (err) {
        throw new Error('Sistema indisponível no momento. Tente novamente mais tarde.')
      }

      const customer = await pb.collection('customers').create({
        name,
        email,
        phone,
        status: 'new',
        source: 'site',
        manufacturer: manufacturerId,
        affiliate_referrer: affiliateRef || undefined,
      })

      if (affiliateRef) {
        await pb.collection('referrals').create({
          affiliate: affiliateRef,
          brand: customer.id,
          type: 'lead',
          source_channel: affiliateSrc,
          metadata: { name, email, phone },
        })
      }

      toast({
        title: 'Sucesso',
        description: 'Cadastro realizado com sucesso! Entraremos em contato.',
      })
      navigate('/')
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-24 md:py-32 animate-fade-in-up">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Seja nosso Lojista Parceiro</CardTitle>
          <CardDescription>
            Cadastre sua loja para se conectar aos melhores fabricantes através do seu Guia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome / Empresa</Label>
              <Input id="name" name="name" required placeholder="Sua marca ou nome completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required placeholder="seu@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input id="phone" name="phone" required placeholder="(00) 00000-0000" />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Quero participar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
