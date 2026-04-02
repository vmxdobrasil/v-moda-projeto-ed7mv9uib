import { Customer, updateCustomer } from '@/services/customers'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Download, Video, Gift, Star } from 'lucide-react'
import { toast } from 'sonner'

export function CustomerBenefits({ customer }: { customer: Customer }) {
  const unlocked = customer.unlocked_benefits || {}

  const toggleBenefit = async (key: string, value: boolean) => {
    try {
      const newBenefits = { ...unlocked, [key]: value }
      await updateCustomer(customer.id, { unlocked_benefits: newBenefits })
      toast.success('Benefício atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar benefício')
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-4">
        <Trophy className="w-8 h-8 text-amber-500 mt-1 shrink-0" />
        <div>
          <h3 className="font-bold text-amber-800">Esteira de Apoio Exclusiva</h3>
          <p className="text-sm text-amber-700">
            Benefícios liberados por estar no ranking{' '}
            <strong className="uppercase">{customer.ranking_category?.replace('_', ' ')}</strong>{' '}
            (Posição #{customer.ranking_position})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-base leading-tight">Revista MODA ATUAL</CardTitle>
              </div>
              <Badge
                variant={unlocked['revista'] ? 'default' : 'secondary'}
                className={
                  unlocked['revista'] ? 'bg-emerald-500 hover:bg-emerald-600 shrink-0' : 'shrink-0'
                }
              >
                {unlocked['revista'] ? 'Resgatado' : 'Disponível'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground min-h-[40px]">
              Assinatura digital anual gratuita da revista.
            </p>
            <Button
              variant={unlocked['revista'] ? 'outline' : 'default'}
              className="w-full"
              onClick={() => toggleBenefit('revista', !unlocked['revista'])}
            >
              {unlocked['revista'] ? 'Revogar Acesso' : 'Liberar Acesso'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-base leading-tight">Ebook Exclusivo</CardTitle>
              </div>
              <Badge
                variant={unlocked['ebook'] ? 'default' : 'secondary'}
                className={
                  unlocked['ebook'] ? 'bg-emerald-500 hover:bg-emerald-600 shrink-0' : 'shrink-0'
                }
              >
                {unlocked['ebook'] ? 'Baixado' : 'Disponível'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium italic min-h-[40px]">
              "como faturar R$ 15.000,00 todo mes vendendo Elegancia e nao roupa."
            </p>
            <Button
              variant={unlocked['ebook'] ? 'outline' : 'default'}
              className="w-full"
              onClick={() => toggleBenefit('ebook', !unlocked['ebook'])}
            >
              {unlocked['ebook'] ? 'Revogar Acesso' : 'Liberar Link de Download'}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-base leading-tight">
                  Guia de Autoridade (Vídeos)
                </CardTitle>
              </div>
              <Badge
                variant={unlocked['videos'] ? 'default' : 'secondary'}
                className={
                  unlocked['videos'] ? 'bg-emerald-500 hover:bg-emerald-600 shrink-0' : 'shrink-0'
                }
              >
                {unlocked['videos'] ? 'Ativo' : 'Disponível'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Estratégia prática: como repostar videos da revista das 60 melhores marcas do polo de
              moda de Goias.
            </p>
            <p className="text-xs text-muted-foreground bg-muted p-3 rounded border">
              Objetivo: Gerar credibilidade, confiança e autoridade com fashionista, consultora de
              moda.
            </p>
            <Button
              variant={unlocked['videos'] ? 'outline' : 'default'}
              className="w-full sm:w-auto"
              onClick={() => toggleBenefit('videos', !unlocked['videos'])}
            >
              {unlocked['videos'] ? 'Revogar Acesso' : 'Liberar Módulo de Vídeos'}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-rose-500" />
                <CardTitle className="text-base leading-tight">Bônus de Software</CardTitle>
              </div>
              <Badge
                variant="destructive"
                className="bg-rose-500 hover:bg-rose-600 shrink-0 shadow-sm"
              >
                80% Bônus
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium">
              Desconto exclusivo em software/ERP de gestao e CRM do seu negocios e Agentes de IA.
            </p>
            <Button
              variant={unlocked['software'] ? 'outline' : 'default'}
              className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white"
              onClick={() => toggleBenefit('software', !unlocked['software'])}
            >
              {unlocked['software'] ? 'Cupom Resgatado' : 'Resgatar Bônus'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
