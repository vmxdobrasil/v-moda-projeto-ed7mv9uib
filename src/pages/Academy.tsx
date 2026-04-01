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
  Store,
  Star,
  Award,
  Clock,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import { COURSES } from '@/lib/data'

const Icons: Record<string, any> = {
  TrendingUp,
  Target,
  Users,
  Lightbulb,
  Store,
  Star,
}

export default function Academy() {
  const specializationTracks = COURSES.filter((c) => c.isSpecialization)
  const regularCourses = COURSES.filter((c) => !c.isSpecialization)

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
              modernas estratégias digitais.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Descubra nossos programas especializados de transformação e alavanque a sua carreira e
              os resultados da sua marca.
            </p>
            <Button size="lg" className="rounded-none uppercase tracking-widest" asChild>
              <a href="#trilhas">Explorar Programas</a>
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

      {/* Specialization Tracks */}
      <div id="trilhas" className="container max-w-6xl mb-24">
        <FadeIn>
          <div className="flex items-center gap-3 mb-10">
            <Award className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-serif">Trilhas de Especialização</h2>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-8">
          {specializationTracks.map((course, i) => {
            const Icon = Icons[course.icon] || BookOpen
            return (
              <FadeIn key={course.id} delay={100 * (i + 1)}>
                <Card className="h-full flex flex-col overflow-hidden rounded-none border-border/50 hover:border-primary/50 transition-all group hover:shadow-lg">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary border border-primary/20">
                      Programa de Transformação
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl leading-tight">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="flex flex-col gap-2 text-sm pt-2">
                      <div className="flex flex-wrap items-center gap-4 uppercase tracking-wider font-medium text-accent">
                        <span className="flex items-center gap-1.5">
                          <Icon className="w-4 h-4" />
                          Com {course.instructor}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                  </CardContent>
                  <CardFooter className="flex-col items-stretch gap-3">
                    <Button className="w-full rounded-none group/btn" asChild>
                      <a href={course.hotmartLink} target="_blank" rel="noopener noreferrer">
                        Inscrever-se agora
                        <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </a>
                    </Button>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span>Pagamento processado pela Hotmart</span>
                    </div>
                  </CardFooter>
                </Card>
              </FadeIn>
            )
          })}
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
            {regularCourses.map((course, i) => {
              const Icon = Icons[course.icon] || BookOpen
              return (
                <FadeIn key={course.id} delay={100 * (i + 1)}>
                  <Card className="h-full flex flex-col rounded-none border-border/50 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="font-serif text-xl">{course.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider font-medium text-accent pt-2">
                        <span>Com {course.instructor}</span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {course.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch gap-3">
                      <Button variant="outline" className="w-full rounded-none group/btn" asChild>
                        <a href={course.hotmartLink} target="_blank" rel="noopener noreferrer">
                          Acessar via Hotmart
                          <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </a>
                      </Button>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                        <span>Pagamento seguro</span>
                      </div>
                    </CardFooter>
                  </Card>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </div>

      {/* Founder's Mentorship Section */}
      <div className="bg-primary text-primary-foreground py-24 mb-24">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeIn>
              <div className="space-y-6">
                <div className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest mb-2">
                  Premium
                </div>
                <h2 className="text-3xl md:text-5xl font-serif leading-tight">
                  Mentoria Exclusiva com Valter Mendonça
                </h2>
                <p className="text-primary-foreground/80 text-lg leading-relaxed">
                  Uma oportunidade única de trabalhar diretamente com o fundador da V MODA. Ideal
                  para empresários e marcas que buscam escalar suas operações, refinar seu
                  posicionamento no mercado de luxo e estruturar estratégias de vendas imbatíveis.
                </p>
                <ul className="space-y-4 pt-4 pb-6">
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="text-primary-foreground/90">
                      Acompanhamento estratégico personalizado.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="text-primary-foreground/90">
                      Reestruturação de modelo de negócios e canais de venda.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="text-primary-foreground/90">
                      Networking exclusivo e acesso a fornecedores premium.
                    </p>
                  </li>
                </ul>
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-none uppercase tracking-widest group/btn"
                  asChild
                >
                  <a
                    href="https://pay.hotmart.com/mentoria-valter"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Aplicar para Mentoria
                    <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </a>
                </Button>
                <div className="flex items-center gap-2 text-xs text-primary-foreground/60 mt-4">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Seleção rigorosa. Vagas limitadas. Pagamento seguro via Hotmart.</span>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="aspect-[4/5] bg-muted overflow-hidden relative border-4 border-primary-foreground/10">
                <img
                  src="https://img.usecurling.com/p/800/1000?q=confident%20businessman%20founder%20fashion%20suit"
                  alt="Mentoria Valter Mendonça"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </FadeIn>
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
                Treinamento Corporativo Sob Medida
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Além das trilhas prontas, oferecemos treinamentos B2B desenhados para integrar
                perfeitamente as suas operações à plataforma V MODA e maximizar os resultados de sua
                equipe.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                  <p className="text-muted-foreground">Otimização de vendas e conversão.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                  <p className="text-muted-foreground">
                    Gestão eficiente de estoque e distribuição.
                  </p>
                </li>
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
