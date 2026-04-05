import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Download, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { getResources, type Resource } from '@/services/resources'
import { useRealtime } from '@/hooks/use-realtime'

export function DigitalContent() {
  const [resources, setResources] = useState<Resource[]>([])

  const loadData = async () => {
    try {
      const data = await getResources()
      setResources(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('resources', () => {
    loadData()
  })

  const magazines = resources.filter((r) => r.type === 'magazine')
  const ebooks = resources.filter((r) => r.type === 'ebook')

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="overflow-hidden border-primary/20 shadow-lg flex flex-col">
        <div className="h-56 bg-muted relative">
          <img
            src="https://img.usecurling.com/p/600/300?q=fashion%20magazine&color=pink"
            alt="Revista"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
        <CardHeader className="flex-grow">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Revista Moda Atual
          </CardTitle>
          <CardDescription>
            Acesse a edição digital exclusiva com as últimas tendências, rotas de compras e dicas de
            mercado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {magazines.map((mag) => (
            <Button
              key={mag.id}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
              onClick={() => window.open(mag.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Ler {mag.name}
            </Button>
          ))}
          {magazines.length === 0 && (
            <Button
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
              onClick={() => toast.success('Abrindo leitor digital em nova aba...')}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Ler Agora
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border shadow-lg flex flex-col">
        <div className="h-56 bg-muted relative">
          <img
            src="https://img.usecurling.com/p/600/300?q=business%20ebook&color=purple"
            alt="Ebook"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
        <CardHeader className="flex-grow">
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" /> Biblioteca de Ebooks
          </CardTitle>
          <CardDescription>
            Baixe guias práticos focados no crescimento do seu negócio de moda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ebooks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum e-book disponível no momento.
            </p>
          )}
          {ebooks.map((ebook) => (
            <div
              key={ebook.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-sm flex-1 mr-4 truncate" title={ebook.name}>
                {ebook.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success('Download do Ebook iniciado')
                  window.open(ebook.url, '_blank')
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
