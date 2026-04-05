import { useState, useEffect } from 'react'
import { PlayCircle, Instagram, Share2 } from 'lucide-react'
import { getResources, type Resource } from '@/services/resources'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'

export function SocialGallery() {
  const [videos, setVideos] = useState<Resource[]>([])

  const loadData = async () => {
    try {
      const data = await getResources()
      setVideos(data.filter((r) => r.type === 'video'))
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

  const shareToWhatsApp = (url: string, name: string) => {
    const text = encodeURIComponent(`Confira este vídeo incrível sobre ${name}:\n\n${url}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-pink-100 rounded-full text-pink-600">
          <Instagram className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Galeria Social</h2>
          <p className="text-muted-foreground">
            Conteúdos curados (Reels, Trends, Vitrines) do Instagram da Revista Moda Atual para você
            se inspirar e compartilhar diretamente com seus clientes no WhatsApp.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videos.map((v, i) => (
          <div key={v.id} className="relative group">
            <div
              className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer border border-border shadow-sm hover:shadow-lg transition-all"
              onClick={() => window.open(v.url, '_blank')}
            >
              <img
                src={`https://img.usecurling.com/p/300/533?q=fashion%20model&color=purple&seed=${i}`}
                alt="Reel Thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex items-center justify-center absolute inset-0">
                  <PlayCircle className="w-14 h-14 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-sm rounded-full bg-black/20" />
                </div>
                <p className="text-white font-medium text-sm line-clamp-2 z-10">{v.name}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                shareToWhatsApp(v.url, v.name)
              }}
            >
              <Share2 className="w-4 h-4 mr-2" /> Compartilhar
            </Button>
          </div>
        ))}
        {videos.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            Nenhum vídeo disponível na galeria no momento.
          </div>
        )}
      </div>
    </div>
  )
}
