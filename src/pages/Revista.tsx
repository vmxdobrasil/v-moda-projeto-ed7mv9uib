import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMagazineStore } from '@/stores/useMagazineStore'
import { PRODUCTS, formatPrice } from '@/lib/data'
import { ExternalLink, Instagram } from 'lucide-react'

export default function Revista() {
  const [searchParams] = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true'
  const { publishedIssues, externalUrl } = useMagazineStore()

  useEffect(() => {
    document.title = 'MODA ATUAL - Revista Digital'

    let ogUrl = document.querySelector('meta[property="og:url"]')
    if (!ogUrl) {
      ogUrl = document.createElement('meta')
      ogUrl.setAttribute('property', 'og:url')
      document.head.appendChild(ogUrl)
    }
    ogUrl.setAttribute('content', externalUrl)

    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', 'MODA ATUAL - Revista Digital')

    let ogSiteName = document.querySelector('meta[property="og:site_name"]')
    if (!ogSiteName) {
      ogSiteName = document.createElement('meta')
      ogSiteName.setAttribute('property', 'og:site_name')
      document.head.appendChild(ogSiteName)
    }
    ogSiteName.setAttribute('content', 'Revista Moda Atual')
  }, [externalUrl])

  // Get unique products based on the published issues
  const issues = publishedIssues
    .map((issue) => ({
      ...issue,
      product: PRODUCTS.find((p) => p.id === issue.productId),
    }))
    .filter((issue) => issue.product)

  return (
    <div className={`min-h-screen bg-black text-white font-sans ${isEmbed ? 'p-0' : 'py-12 px-4'}`}>
      {!isEmbed && (
        <div className="max-w-4xl mx-auto mb-12 text-center space-y-4">
          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-[0.2em] uppercase">
            MODA ATUAL
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Descubra as últimas tendências e lançamentos exclusivos em nossa edição digital.
          </p>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium hover:text-gray-300 transition-colors"
          >
            Acessar Site Oficial <ExternalLink className="ml-2 w-4 h-4" />
          </a>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex flex-col gap-12 md:gap-24">
        {issues.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            Nenhuma edição publicada no momento.
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="w-full bg-white text-black shadow-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.02] aspect-[9/16] md:aspect-[21/29.5] flex flex-col mx-auto max-w-xl md:max-w-none"
            >
              {/* Header */}
              <div className="h-[10%] min-h-[60px] bg-black text-white flex items-center justify-center font-serif text-2xl md:text-4xl font-bold tracking-[0.2em] uppercase">
                Moda Atual
              </div>

              {/* Image */}
              <div className="flex-1 relative bg-white flex items-center justify-center p-4">
                <img
                  src={issue.product?.image}
                  alt={issue.product?.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Footer */}
              <div className="h-[20%] min-h-[120px] bg-gray-50 flex flex-col items-center justify-center p-6 text-center border-t border-gray-200">
                <h3 className="font-sans font-bold text-xl md:text-3xl line-clamp-2 uppercase tracking-wide">
                  {issue.product?.name}
                </h3>
                <p className="text-gray-500 font-medium mt-2 text-lg md:text-xl">
                  {formatPrice(issue.product?.price || 0)}
                </p>
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
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors mt-2 inline-block"
            >
              Acessar Portal da Revista
            </a>
          </div>
        </>
      )}
    </div>
  )
}
