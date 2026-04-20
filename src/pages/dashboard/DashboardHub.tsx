import { Link } from 'react-router-dom'
import {
  Users,
  MessageSquare,
  Share2,
  CreditCard,
  Briefcase,
  GraduationCap,
  BookOpen,
  FolderKanban,
  Truck,
  Video,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FadeIn } from '@/components/FadeIn'

const HUB_LINKS = [
  {
    title: 'CRM / Leads',
    icon: Users,
    path: '/dashboard/crm',
    description: 'Gerencie seus clientes e acompanhe as negociações ativas.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Catálogo / Vitrine',
    icon: FolderKanban,
    path: '/dashboard/projects',
    description: 'Gerencie suas coleções, portfólio e produtos.',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    title: 'Logística',
    icon: Truck,
    path: '/dashboard/logistics',
    description: 'Acompanhe excursões, fretes e entregas.',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    title: 'Vídeo Negociação',
    icon: Video,
    path: '/dashboard/video-sessions',
    description: 'Realize vendas e demonstrações por vídeo chamada.',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
  {
    title: 'Academy',
    icon: GraduationCap,
    path: '/dashboard/recursos',
    description: 'Acesse trilhas de conhecimento e treinamentos.',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
  },
  {
    title: 'Integrações',
    icon: MessageSquare,
    path: '/dashboard/settings/whatsapp',
    description: 'Configure seu WhatsApp API e templates.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Planos e Faturamento',
    icon: CreditCard,
    path: '/dashboard/billing',
    description: 'Gerencie sua assinatura, limites e pagamentos.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
]

export default function DashboardHub() {
  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Início</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Bem-vindo ao seu painel principal. Acesse rapidamente todos os módulos do seu CRM e
          ferramentas disponíveis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {HUB_LINKS.map((link, index) => (
          <FadeIn key={link.title} delay={index * 50}>
            <Link to={link.path} className="block h-full group outline-none">
              <Card className="h-full border border-border/60 hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-card cursor-pointer">
                <CardHeader className="pb-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${link.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <link.icon className={`w-6 h-6 ${link.color}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {link.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
