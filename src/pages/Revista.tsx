import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMagazineStore } from '@/stores/useMagazineStore'
import { PRODUCTS, formatPrice } from '@/lib/data'
import { ExternalLink } from 'lucide-react'

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
        <div className="mt-20 text-center text-gray-600 text-sm pb-8">
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
      )}
    </div>
  )
}
