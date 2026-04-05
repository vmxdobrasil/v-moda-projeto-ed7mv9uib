import { PlayCircle, Instagram } from 'lucide-react'

export function SocialGallery() {
  const videos = ['fashion%20show', 'clothing%20store', 'boutique', 'fashion%20model']

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
            se inspirar e compartilhar.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videos.map((v, i) => (
          <div
            key={i}
            className="relative aspect-[9/16] rounded-xl overflow-hidden group cursor-pointer border border-border shadow-sm hover:shadow-lg transition-all"
          >
            <img
              src={`https://img.usecurling.com/p/300/533?q=${v}&color=purple`}
              alt="Reel Thumbnail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <div className="flex items-center justify-center absolute inset-0">
                <PlayCircle className="w-14 h-14 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-sm rounded-full bg-black/20" />
              </div>
              <p className="text-white font-medium text-sm line-clamp-2 z-10">
                Inspiração de look da semana #{i + 1}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
