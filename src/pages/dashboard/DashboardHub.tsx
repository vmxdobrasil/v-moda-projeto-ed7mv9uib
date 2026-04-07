import { Link } from 'react-router-dom'
import {
  Users,
  MessageSquare,
  Share2,
  CreditCard,
  Briefcase,
  GraduationCap,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FadeIn } from '@/components/FadeIn'

const HUB_LINKS = [
  {
    title: 'CRM (Clientes)',
    icon: Users,
    path: '/dashboard/crm',
    description: 'Gerencie seus clientes e acompanhe as negociações ativas.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Mensagens',
    icon: MessageSquare,
    path: '/messages',
    description: 'Centralize sua comunicação com clientes em um só lugar.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Canais',
    icon: Share2,
    path: '/channels',
    description: 'Configure integrações com WhatsApp, Instagram e Email.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Planos',
    icon: CreditCard,
    path: '/subscriptions',
    description: 'Gerencie sua assinatura, faturamento e limites.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    title: 'Projetos',
    icon: Briefcase,
    path: '/projects',
    description: 'Organize seu portfólio e mostre suas coleções.',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    title: 'Recursos',
    icon: GraduationCap,
    path: '/recursos',
    description: 'Acesse e-books, vídeos educativos e treinamentos.',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
  },
  {
    title: 'Revista',
    icon: BookOpen,
    path: '/revista',
    description: 'Explore as últimas edições da Revista Digital.',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
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
