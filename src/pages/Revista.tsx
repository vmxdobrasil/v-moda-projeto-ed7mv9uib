import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Instagram } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function Revista() {
  const [searchParams] = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true'
  const [magazines, setMagazines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'MODA ATUAL - Revista Digital'

    pb.collection('resources')
      .getFullList({ filter: "type = 'magazine'", sort: '-created' })
      .then(setMagazines)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={`min-h-screen bg-black text-white font-sans ${isEmbed ? 'p-0' : 'py-32 px-4'}`}>
      {!isEmbed && (
        <div className="max-w-4xl mx-auto mb-12 text-center space-y-4">
          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-[0.2em] uppercase">
            MODA ATUAL
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Descubra as últimas tendências e lançamentos exclusivos em nossa edição digital.
          </p>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex flex-col gap-12 md:gap-24">
        {loading ? (
          <div className="text-center text-gray-500 py-20">Carregando edições...</div>
        ) : magazines.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            Nenhuma edição publicada no momento.
          </div>
        ) : (
          magazines.map((issue) => (
            <div
              key={issue.id}
              className="w-full bg-white text-black shadow-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.02] aspect-[9/16] md:aspect-[21/29.5] flex flex-col mx-auto max-w-xl md:max-w-none group"
            >
              {/* Header */}
              <div className="h-[10%] min-h-[60px] bg-black text-white flex items-center justify-center font-serif text-2xl md:text-4xl font-bold tracking-[0.2em] uppercase z-10 relative">
                Moda Atual
              </div>

              {/* Image */}
              <div className="flex-1 relative bg-gray-100 flex items-center justify-center p-0">
                <img
                  src={
                    issue.thumbnail
                      ? pb.files.getUrl(issue, issue.thumbnail)
                      : `https://img.usecurling.com/p/800/1200?q=fashion%20magazine%20cover&seed=${issue.id}`
                  }
                  alt={issue.name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay to read/download */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <a
                    href={
                      issue.url ||
                      (issue.content_file ? pb.files.getUrl(issue, issue.content_file) : '#')
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-gray-200 transition-colors"
                  >
                    Ler Edição Completa
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="h-[20%] min-h-[120px] bg-white flex flex-col items-center justify-center p-6 text-center border-t border-gray-200 relative z-10">
                <h3 className="font-sans font-bold text-xl md:text-2xl line-clamp-2 uppercase tracking-wide">
                  {issue.name}
                </h3>
                {issue.description && (
                  <p className="text-gray-500 font-medium mt-2 text-sm line-clamp-2">
                    {issue.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!isEmbed && (
        <>
          <section className="mt-32 max-w-5xl mx-auto border-t border-gray-800 pt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif mb-4 font-bold tracking-widest uppercase">
                Siga-nos no Instagram @revistamodaatual
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8">
                Acompanhe nossos bastidores, novas coleções e inspirações diárias diretamente no
                nosso feed.
              </p>
              <a
                href="https://www.instagram.com/revistamodaatual"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border-2 border-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors hover:bg-white hover:text-black"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Ver no Instagram
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'https://img.usecurling.com/p/400/400?q=fashion%20model%20street%20style',
                'https://img.usecurling.com/p/400/400?q=minimalist%20clothing%20detail',
                'https://img.usecurling.com/p/400/400?q=fashion%20accessories%20jewelry',
                'https://img.usecurling.com/p/400/400?q=luxury%20fashion%20editorial',
              ].map((img, i) => (
                <a
                  key={i}
                  href="https://www.instagram.com/revistamodaatual"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square group overflow-hidden bg-gray-900 block"
                >
                  <img
                    src={img}
                    alt={`Publicação do Instagram @revistamodaatual ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Instagram className="w-8 h-8 text-white" />
                  </div>
                </a>
              ))}
            </div>
          </section>

          <div className="mt-20 text-center text-gray-600 text-sm pb-8 border-t border-gray-900 pt-8">
            <p>© {new Date().getFullYear()} Revista Moda Atual. Todos os direitos reservados.</p>
          </div>
        </>
      )}
    </div>
  )
}
