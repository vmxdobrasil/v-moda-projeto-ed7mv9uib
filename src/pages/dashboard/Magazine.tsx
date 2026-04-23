import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, FileText, ExternalLink, Loader2 } from 'lucide-react'
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

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revista & Ebooks</h1>
        <p className="text-muted-foreground">
          Acesse os melhores conteúdos editoriais e materiais de leitura.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources && resources.length > 0 ? (
          resources.map((res) => (
            <Card
              key={res.id}
              className="hover:border-primary/50 transition-colors overflow-hidden flex flex-col shadow-sm"
            >
              {res.thumbnail ? (
                <div className="aspect-[4/3] w-full bg-muted border-b">
                  <img
                    src={pb.files.getURL(res, res.thumbnail)}
                    alt={res.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center border-b">
                  {res.type === 'magazine' ? (
                    <BookOpen className="w-12 h-12 text-muted-foreground opacity-50" />
                  ) : (
                    <FileText className="w-12 h-12 text-muted-foreground opacity-50" />
                  )}
                </div>
              )}
              <CardHeader className="pb-3 flex flex-row items-start justify-between flex-none">
                <div>
                  <CardTitle
                    className="text-base leading-tight font-serif line-clamp-2"
                    title={res.name}
                  >
                    {res.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{res.type}</p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
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
          <div className="col-span-full py-16 text-center bg-card rounded-lg border shadow-sm">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Nenhum conteúdo disponível</h3>
            <p className="text-muted-foreground mt-1">As revistas e ebooks aparecerão aqui.</p>
          </div>
        )}
      </div>
    </div>
  )
}
