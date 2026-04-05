import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Download, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export function DigitalContent() {
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
        <CardContent>
          <Button
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            onClick={() => toast.success('Abrindo leitor digital em nova aba...')}
          >
            <ExternalLink className="w-4 h-4 mr-2" /> Ler Agora
          </Button>
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
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
            <span className="font-medium text-sm">Guia Prático para Sacoleiras de Sucesso</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Download do Ebook iniciado')}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
            <span className="font-medium text-sm">
              Vendas pelo WhatsApp 2.0 (O Guia Definitivo)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Download do Ebook iniciado')}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
