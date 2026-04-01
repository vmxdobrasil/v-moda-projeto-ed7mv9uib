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
  Store,
  Star,
  Award,
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
                    <CardDescription className="text-sm uppercase tracking-wider font-medium text-accent pt-2 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      Com {course.instructor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full rounded-none group/btn" asChild>
                      <Link to={`/curso/${course.id}`}>
                        Acessar Curso
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
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
                      <Button variant="outline" className="w-full rounded-none group/btn" asChild>
                        <Link to={`/curso/${course.id}`}>
                          Acessar Curso
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </FadeIn>
              )
            })}
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
