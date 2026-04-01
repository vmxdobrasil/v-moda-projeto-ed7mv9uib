import { Link } from 'react-router-dom'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BookOpen,
  GraduationCap,
  Users,
  TrendingUp,
  Lightbulb,
  Target,
  ArrowRight,
} from 'lucide-react'

const courses = [
  {
    title: 'Marketing de Moda Digital',
    description:
      'Aprenda as estratégias mais atuais para posicionar sua marca no ambiente digital.',
    instructor: 'Equipe V MODA',
    icon: TrendingUp,
  },
  {
    title: 'Branding para Moda',
    description: 'Construa uma marca forte, desejável e com identidade visual inconfundível.',
    instructor: 'Fábia Mendonça',
    icon: Target,
  },
  {
    title: 'Estratégias de Vendas',
    description: 'Técnicas avançadas de negociação e conversão para o mercado de luxo.',
    instructor: 'Valter Mendonça',
    icon: Users,
  },
  {
    title: 'Gestão de Redes Sociais',
    description: 'Como criar conteúdo que engaja e converte seguidores em clientes fiéis.',
    instructor: 'Equipe Moda Atual',
    icon: Lightbulb,
  },
]

export default function Academy() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <div className="container max-w-6xl mb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn className="order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
              Transformando Conhecimento em Crescimento
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Bem-vindo ao V MODA Academy, o hub educacional exclusivo para membros do nosso
              ecossistema. Aqui, unimos a experiência de décadas no mercado de moda com as mais
              modernas estratégias digitais para impulsionar a sua carreira e o seu negócio.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Fabricantes, revendedores e entusiastas da moda encontram um espaço dedicado ao
              desenvolvimento profissional, com cursos, treinamentos e mentorias de alto nível.
            </p>
            <Button size="lg" className="rounded-none uppercase tracking-widest" asChild>
              <a href="#cursos">Explorar Cursos</a>
            </Button>
          </FadeIn>
          <FadeIn delay={200} className="order-1 lg:order-2">
            <div className="aspect-square lg:aspect-[4/5] bg-muted overflow-hidden relative group">
              <img
                src="https://img.usecurling.com/p/800/1000?q=fashion%20education%20study%20modern"
                alt="V MODA Academy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Course Catalog */}
      <div id="cursos" className="bg-secondary/30 py-24 mb-24">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <GraduationCap className="w-12 h-12 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Catálogo de Cursos</h2>
              <p className="text-muted-foreground text-lg">
                Capacitação especializada para destacar sua marca no mercado competitivo da moda.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, i) => (
              <FadeIn key={course.title} delay={100 * (i + 1)}>
                <Card className="h-full flex flex-col rounded-none border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <course.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="font-serif text-xl">{course.title}</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wider font-medium text-accent pt-2">
                      Com {course.instructor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {course.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full rounded-none group" asChild>
                      <Link to="/contato">
                        Saiba Mais
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Corporate Training Section */}
      <div className="container max-w-6xl mb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeIn>
            <div className="aspect-video bg-muted overflow-hidden relative">
              <img
                src="https://img.usecurling.com/p/800/600?q=corporate%20presentation%20fashion%20tech"
                alt="Treinamento Corporativo"
                className="w-full h-full object-cover"
              />
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="space-y-6">
              <BookOpen className="w-10 h-10 text-primary" />
              <h2 className="text-3xl md:text-4xl font-serif">
                Treinamento para Fabricantes e Revendedores
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Nossos módulos de treinamento B2B são desenhados para integrar perfeitamente as suas
                operações à plataforma V MODA.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                  <p className="text-muted-foreground">
                    Otimização de vendas através de nossa inteligência artificial preditiva.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                  <p className="text-muted-foreground">
                    Gestão eficiente de estoque e distribuição automatizada.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                  <p className="text-muted-foreground">
                    Análise de tendências e comportamento do consumidor em tempo real.
                  </p>
                </li>
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Mentorship Spotlight */}
      <div className="bg-primary text-primary-foreground py-24">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Mentorias com Valter Mendonça
              </h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed mb-6">
                Acesse mais de 25 anos de experiência prática e visão estratégica no mercado de
                moda. Uma oportunidade única de ser guiado pelo fundador da emblemática Revista MODA
                & Cia e atual líder do HUB de Negócios V MODA.
              </p>
              <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
                Junto com a equipe editorial da Revista MODA ATUAL, as mentorias oferecem um
                mergulho profundo no branding, posicionamento de mercado e estratégias de expansão
                para a sua marca.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-none uppercase tracking-widest"
                asChild
              >
                <Link to="/contato?assunto=Mentoria">Solicitar Mentoria</Link>
              </Button>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="aspect-square lg:aspect-[4/5] bg-primary-foreground/10 overflow-hidden relative rounded-sm">
                <img
                  src="https://img.usecurling.com/ppl/large?gender=male&seed=valter"
                  alt="Valter Mendonça Mentoria"
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}
