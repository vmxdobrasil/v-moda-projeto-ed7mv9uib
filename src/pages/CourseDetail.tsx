import { useParams, Link, Navigate } from 'react-router-dom'
import { COURSES } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/FadeIn'
import { ArrowLeft, Clock, BarChart, CheckCircle2, UserCircle } from 'lucide-react'

export default function CourseDetail() {
  const { id } = useParams()
  const course = COURSES.find((c) => c.id === id)

  if (!course) return <Navigate to="/conhecimento" replace />

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container max-w-5xl">
        <FadeIn>
          <Link
            to="/conhecimento"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Academy
          </Link>
        </FadeIn>

        {/* Course Header */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <FadeIn>
            <div className="space-y-6">
              {course.isSpecialization && (
                <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-full">
                  Trilha de Especialização
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-serif leading-tight">{course.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap gap-6 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart className="w-5 h-5 text-primary" />
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium">{course.instructor}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-none uppercase tracking-widest mt-8"
              >
                Inscrever-se Agora
              </Button>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="aspect-[4/3] lg:aspect-square overflow-hidden bg-muted relative rounded-sm group">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </FadeIn>
        </div>

        {/* Course Content */}
        <FadeIn delay={300}>
          <div className="bg-secondary/30 p-8 md:p-12">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-serif mb-6">Sobre o Programa</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                {course.longDescription}
              </p>

              <h3 className="text-xl font-serif mb-6">Módulos do Curso</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {course.modules.map((mod, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-background p-5 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-medium text-sm leading-relaxed">{mod}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
