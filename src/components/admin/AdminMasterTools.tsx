import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Store, Activity, Wallet, CreditCard, Award, MapPin, Megaphone, Star } from 'lucide-react'

const GLOBAL_TOOLS = [
  {
    to: '/admin/guia-de-marcas',
    icon: Store,
    label: 'Fabricantes do Guia',
    desc: 'Gerenciar fabricantes',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  {
    to: '/admin/crm-global',
    icon: Activity,
    label: 'CRM Global',
    desc: 'Relacionamento global',
    bg: 'bg-navy/10',
    text: 'text-navy',
  },
  {
    to: '/admin/assinaturas',
    icon: Wallet,
    label: 'Assinaturas',
    desc: 'Planos e cobranças',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  {
    to: '/admin/comissoes',
    icon: CreditCard,
    label: 'Comissões',
    desc: 'Gestão de comissões',
    bg: 'bg-navy/10',
    text: 'text-navy',
  },
  {
    to: '/admin/v-club',
    icon: Award,
    label: 'V Club (Admin)',
    desc: 'Cartões e cashback',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  {
    to: '/admin/agentes',
    icon: MapPin,
    label: 'Agentes & Parceiros',
    desc: 'Agentes credenciados',
    bg: 'bg-navy/10',
    text: 'text-navy',
  },
  {
    to: '/admin/influencers',
    icon: Megaphone,
    label: 'Influenciadores',
    desc: 'Campanhas e cupons',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  {
    to: '/top-marcas',
    icon: Star,
    label: 'Top 100 Marcas',
    desc: 'Ranking de marcas',
    bg: 'bg-navy/10',
    text: 'text-navy',
  },
  {
    to: '/guia-compras',
    icon: Store,
    label: 'Guia de Compras',
    desc: 'Diretório B2B',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
]

export function AdminMasterTools() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {GLOBAL_TOOLS.map((tool) => {
        const Icon = tool.icon
        return (
          <Link key={tool.to} to={tool.to}>
            <Card className="rounded-2xl shadow-soft hover-depth border-primary/10 cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.bg}`}>
                  <Icon className={`w-6 h-6 ${tool.text}`} />
                </div>
                <div>
                  <p className="font-display font-semibold">{tool.label}</p>
                  <p className="text-sm text-muted-foreground">{tool.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
