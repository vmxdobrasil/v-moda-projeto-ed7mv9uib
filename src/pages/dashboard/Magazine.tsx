import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, FileText, ExternalLink, Loader2, Globe, Apple, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'

export default function Magazine() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const records = await pb.collection('resources').getFullList({
        filter: "type = 'magazine' || type = 'ebook'",
        sort: '-created',
      })
      setResources(records || [])
    } catch (error) {
      console.error('Failed to fetch magazines', error)
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('resources', loadData)

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revista & Ebooks</h1>
        <p className="text-muted-foreground mt-2">
          Acesse os melhores conteúdos editoriais e materiais de leitura.
        </p>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border border-primary/20 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold tracking-tight">Moda Atual Digital</h2>
            <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
              Explore nosso portal oficial para notícias em tempo real, ou baixe nosso aplicativo
              para ter as edições da revista sempre com você, onde quer que esteja.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Button asChild variant="default" className="flex-1 sm:flex-none">
              <a
                href="https://www.revistamodaatual.com.br"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar site da Revista Moda Atual"
              >
                <Globe className="w-4 h-4 mr-2" />
                Site Oficial
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 sm:flex-none bg-background/50 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/50 transition-colors"
            >
              <a
                href="https://play.google.com/store/search?q=revista+moda+atual"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Baixar aplicativo da Revista Moda Atual no Google Play"
              >
                <Play className="w-4 h-4 mr-2" />
                Google Play
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 sm:flex-none bg-background/50 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/50 transition-colors"
            >
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Baixar aplicativo da Revista Moda Atual na App Store"
              >
                <Apple className="w-4 h-4 mr-2" />
                App Store
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-card rounded-xl border shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando edições...</p>
          </div>
        ) : resources && resources.length > 0 ? (
          resources.map((res) => (
            <Card
              key={res.id}
              className="hover:border-primary/50 transition-all duration-300 hover:shadow-md overflow-hidden flex flex-col group"
            >
              {res.thumbnail ? (
                <div className="aspect-[3/4] w-full bg-muted border-b relative overflow-hidden">
                  <img
                    src={pb.files.getURL(res, res.thumbnail)}
                    alt={res.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="secondary" size="sm" asChild className="pointer-events-none">
                      <span>Ver Conteúdo</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] w-full bg-muted flex flex-col items-center justify-center border-b relative overflow-hidden group-hover:bg-muted/80 transition-colors">
                  {res.type === 'magazine' ? (
                    <BookOpen className="w-16 h-16 text-muted-foreground opacity-20 group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <FileText className="w-16 h-16 text-muted-foreground opacity-20 group-hover:scale-110 transition-transform duration-500" />
                  )}
                </div>
              )}
              <CardHeader className="pb-3 flex flex-row items-start justify-between flex-none">
                <div>
                  <CardTitle
                    className="text-base leading-tight font-serif line-clamp-2 group-hover:text-primary transition-colors"
                    title={res.name}
                  >
                    {res.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-2">
                    {res.type === 'magazine' ? 'Revista' : 'E-Book'}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pb-5">
                <p className="text-sm text-muted-foreground mb-5 line-clamp-3 flex-1">
                  {res.description || 'Sem descrição adicional.'}
                </p>
                <Button variant="default" className="w-full mt-auto" asChild>
                  <a
                    href={res.content_file ? pb.files.getURL(res, res.content_file) : res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ler Agora <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-card rounded-xl border shadow-sm flex flex-col items-center justify-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-serif font-medium">Nenhum conteúdo disponível</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              As revistas e e-books publicados aparecerão aqui em breve. Fique atento às novidades!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
