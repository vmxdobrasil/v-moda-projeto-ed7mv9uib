import { useState, useEffect } from 'react'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, GraduationCap, Video, FileText, ExternalLink, Download } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function Academy() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pb.collection('resources')
      .getFullList({
        filter: "type = 'course' || type = 'video' || type = 'ebook'",
        sort: '-created',
      })
      .then(setResources)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
            <Button size="lg" className="rounded-none uppercase tracking-widest" asChild>
              <a href="#cursos">Explorar Materiais</a>
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
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Materiais e Cursos</h2>
              <p className="text-muted-foreground text-lg">
                Capacitação especializada para destacar sua marca no mercado competitivo da moda.
              </p>
            </div>
          </FadeIn>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Carregando materiais...</div>
          ) : resources.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum material disponível no momento.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((item, i) => (
                <FadeIn key={item.id} delay={100 * (i + 1)}>
                  <Card className="h-full flex flex-col rounded-none border-border/50 hover:border-primary/50 transition-colors overflow-hidden">
                    {item.thumbnail && (
                      <div className="w-full aspect-video overflow-hidden">
                        <img
                          src={pb.files.getUrl(item, item.thumbnail)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider text-primary">
                        {item.type === 'video' ? (
                          <Video className="w-4 h-4" />
                        ) : item.type === 'ebook' ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <BookOpen className="w-4 h-4" />
                        )}
                        {item.type === 'video'
                          ? 'Vídeo'
                          : item.type === 'ebook'
                            ? 'E-book'
                            : 'Curso'}
                      </div>
                      <CardTitle className="font-serif text-xl line-clamp-2">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {item.description || 'Sem descrição'}
                      </p>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch gap-3">
                      <Button variant="outline" className="w-full rounded-none group/btn" asChild>
                        <a
                          href={
                            item.url ||
                            (item.content_file ? pb.files.getUrl(item, item.content_file) : '#')
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.type === 'ebook' ? 'Baixar Material' : 'Acessar Conteúdo'}
                          {item.type === 'ebook' ? (
                            <Download className="w-4 h-4 ml-2 group-hover/btn:translate-y-0.5 transition-transform" />
                          ) : (
                            <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                          )}
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
