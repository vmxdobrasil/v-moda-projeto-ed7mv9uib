import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ExternalLink, Plus } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export function AdminMasterMagazine() {
  const [magazines, setMagazines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const res = await pb
        .collection('resources')
        .getFullList({
          filter: 'type = "magazine"',
          sort: '-created',
        })
        .catch(() => [])
      setMagazines(res as any[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('resources', loadData)

  const baseUrl = import.meta.env.VITE_POCKETBASE_URL

  const getThumbnail = (item: any): string => {
    if (item.thumbnail) {
      return `${baseUrl}/api/files/${item.collectionId}/${item.id}/${item.thumbnail}`
    }
    return `https://img.usecurling.com/p/400/300?q=fashion%20magazine`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-navy dark:text-white">
            Revista ModaAtual
          </h2>
          <p className="text-muted-foreground mt-1">Gestão de conteúdo da revista digital</p>
        </div>
        <Link to="/resources">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Gerenciar Recursos
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando revistas...</div>
      ) : magazines.length === 0 ? (
        <Card className="rounded-2xl border-primary/10">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma revista encontrada. Crie um recurso do tipo "magazine" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {magazines.map((mag) => (
            <Card
              key={mag.id}
              className="rounded-2xl shadow-soft hover-depth border-primary/10 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-muted relative">
                <img
                  src={getThumbnail(mag)}
                  alt={mag.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="font-display text-lg line-clamp-1">{mag.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {mag.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {mag.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant={mag.is_published ? 'default' : 'secondary'}>
                    {mag.is_published ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  {mag.url && (
                    <a href={mag.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Abrir
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
