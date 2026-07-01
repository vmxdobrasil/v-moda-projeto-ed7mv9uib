import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  Check,
  Link2,
  MessageCircle,
  Instagram,
  Mail,
  Globe,
  ExternalLink,
} from 'lucide-react'
import {
  generateOnboardingLink,
  UTM_SOURCE_LABELS,
  type UtmSource,
} from '@/services/agent-onboarding'
import { toast as sonnerToast } from 'sonner'

const SOURCE_ICONS: Record<UtmSource, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  email: Mail,
  landing_page: Globe,
}

export function AgentOnboardingLinks() {
  const { user } = useAuth()
  const [copied, setCopied] = useState<string | null>(null)
  const [campaign, setCampaign] = useState('')

  const affiliateCode = user?.affiliate_code || ''
  const sources: UtmSource[] = ['whatsapp', 'instagram', 'email', 'landing_page']

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    sonnerToast.success('Link copiado!')
    setTimeout(() => setCopied(null), 2000)
  }

  if (!affiliateCode) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Link2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
          Você precisa de um código de afiliado ativo para gerar links.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Links de Captação</h3>
        <p className="text-sm text-muted-foreground">
          Gere links com rastreamento UTM para cada canal.
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Código de Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="text-base font-mono px-3 py-1">
            {affiliateCode}
          </Badge>
        </CardContent>
      </Card>

      <div className="space-y-2 mb-4">
        <Label>Campanha UTM (opcional)</Label>
        <Input
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          placeholder="Ex: promocao_verao_2026"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sources.map((source) => {
          const Icon = SOURCE_ICONS[source]
          const link = generateOnboardingLink({
            affiliateCode,
            utmSource: source,
            utmCampaign: campaign || undefined,
          })
          const key = `link-${source}`
          return (
            <Card key={source} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{UTM_SOURCE_LABELS[source]}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input readOnly value={link} className="text-xs font-mono bg-muted" />
                  <Button
                    variant={copied === key ? 'default' : 'secondary'}
                    className="shrink-0 bg-electric text-electric-foreground"
                    size="icon"
                    onClick={() => handleCopy(link, key)}
                  >
                    {copied === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <a href={link} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" /> Abrir link
                  </a>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
