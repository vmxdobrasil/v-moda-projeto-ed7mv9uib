import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Mail,
  Instagram,
  Globe,
  Phone,
  Calendar,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { magazineColumnsService, type MagazineColumnRecord } from '@/services/magazine-columns'

// Fotos padrão de alta qualidade para o layout editorial caso a edição não tenha fotos enviadas ainda
const FALLBACK_COLUMNIST_PHOTO = 'https://img.usecurling.com/ppl/512?gender=female&seed=84'
const FALLBACK_FEATURED_PHOTO =
  'https://img.usecurling.com/p/800/800?q=fashion%20speaker%20conference&color=beige'
const FALLBACK_BOTTOM_PHOTOS = [
  'https://img.usecurling.com/p/600/600?q=fashion%20workshop%20designers&seed=1',
  'https://img.usecurling.com/p/600/600?q=fashion%20executives%20cocktail&seed=2',
  'https://img.usecurling.com/p/600/600?q=fashion%20runway%20models%20tropyk&seed=3',
]

export default function HolofoteColumn() {
  const { slug } = useParams<{ slug?: string }>()
  const activeSlug = slug || 'holofote'
  const [column, setColumn] = useState<MagazineColumnRecord | null>(null)
  const [otherEditions, setOtherEditions] = useState<MagazineColumnRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeBottomPhotoIndex, setActiveBottomPhotoIndex] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const fetchData = async () => {
      try {
        const [current, all] = await Promise.all([
          magazineColumnsService.getPublishedBySlug(activeSlug),
          magazineColumnsService.getPublishedList(20),
        ])

        if (mounted) {
          if (current) {
            setColumn(current)
            document.title = `${current.title} — ${current.columnist_name} | V MODA BRASIL`
          } else if (all.length > 0) {
            setColumn(all[0])
            document.title = `${all[0].title} — ${all[0].columnist_name} | V MODA BRASIL`
          }
          setOtherEditions(all)
        }
      } catch (err) {
        console.error('Erro ao carregar coluna da revista:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [activeSlug])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${column?.title || 'HOLOFOTE'} — ${column?.headline || 'V MODA BRASIL'}`,
          text: `Confira a coluna ${column?.title} na Revista V MODA BRASIL!`,
          url,
        })
      } catch {
        // usuário cancelou
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast({
        title: 'Link copiado!',
        description: 'O link da coluna foi copiado para sua área de transferência.',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#c9a86a] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif-editorial text-lg text-[#5a4a35] italic">
            Diagramando edição de moda...
          </p>
        </div>
      </div>
    )
  }

  if (!column) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-sm border border-[#e8dfd3] space-y-4">
          <h2 className="font-serif-editorial text-3xl text-[#1a1815]">Coluna não encontrada</h2>
          <p className="text-sm text-[#736859]">
            A edição solicitada ainda não está disponível ou foi despublicada.
          </p>
          <Link to="/revista">
            <Button className="bg-[#1a1815] text-[#f7f3ec] hover:bg-[#333]">
              Voltar para a Revista
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Fotos resolvidas
  const columnistPhotoUrl = column.columnist_photo
    ? magazineColumnsService.getFileUrl(column, column.columnist_photo)
    : FALLBACK_COLUMNIST_PHOTO

  const featuredPhotoUrl = column.featured_photo
    ? magazineColumnsService.getFileUrl(column, column.featured_photo)
    : FALLBACK_FEATURED_PHOTO

  const bottomPhotos =
    column.photos && column.photos.length > 0
      ? column.photos.map((p) => magazineColumnsService.getFileUrl(column, p))
      : FALLBACK_BOTTOM_PHOTOS

  const captions =
    column.captions && column.captions.length > 0
      ? column.captions
      : [
          'Na foto Karol Testoni do SENAI Lab Fashion e Rogério Barreto com toda equipe da LUCIN TÊXTIL e empresários da Moda, participantes do evento',
          'Fábia Mendonça: Editora de moda e Valter Mendonça: Diretor de Marketing da Revista Moda Atual, com Karol Testoni/Senai e Rogério Barreto da Lucin Têxtil',
          'Reginaldo Abdala e Silvio Umbelino celebram o sucesso do lançamento da coleção Tropyk 2025',
        ]

  const contacts = column.columnist_contacts || {}
  const paragraphs = (column.body_text || '').split('\n').filter((p) => p.trim().length > 0)

  // Presets de layout
  const isPhotoFocused = column.layout_preset === 'photo_focused'
  const isTextFocused = column.layout_preset === 'text_focused'

  const textColSpan = isTextFocused
    ? 'lg:col-span-8'
    : isPhotoFocused
      ? 'lg:col-span-6'
      : 'lg:col-span-7'

  const cardColSpan = isTextFocused
    ? 'lg:col-span-4'
    : isPhotoFocused
      ? 'lg:col-span-6'
      : 'lg:col-span-5'

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#1c1917] selection:bg-[#e8dfd3] selection:text-[#1c1917] pb-24">
      {/* Barra superior de navegação editorial */}
      <div className="border-b border-[#e6ddd1] bg-[#f5efe6]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/revista"
              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[#736859] hover:text-[#1c1917] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Revista V Moda</span>
            </Link>
            <span className="text-[#c4b5a0]">/</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1c1917]">
              {column.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-[#5a4a35] hover:text-[#1c1917] hover:bg-[#e8dfd3]/60 text-xs uppercase tracking-wider"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              Compartilhar
            </Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Confira a coluna ${column.title} de ${column.columnist_name} na Revista V MODA BRASIL: ${window.location.href}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center text-xs uppercase tracking-wider bg-[#1c1917] text-[#f7f3ec] hover:bg-[#333] px-3 py-1.5 rounded-full transition-all"
            >
              <ArrowUpRight className="w-3 h-3 mr-1" />
              Divulgar
            </a>
          </div>
        </div>
      </div>

      {/* Container principal estilo PÁGINA IMPRESSA DE REVISTA (Editorial Sheet) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <article className="bg-[#fffdf9] rounded-none md:rounded-xl shadow-[0_20px_60px_-15px_rgba(40,30,20,0.12)] border border-[#ece3d6] overflow-hidden transition-all">
          {/* ========================================================
              1) CABEÇALHO EDITORIAL (Título Enorme + Card da Colunista)
             ======================================================== */}
          <header className="bg-gradient-to-r from-[#f5efe6] via-[#f7f3ec] to-[#f2eae0] border-b border-[#e2d5c3] px-6 py-6 sm:px-10 sm:py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Título da Coluna à Esquerda */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="h-px w-6 bg-[#c9a86a]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c7853]">
                    Coluna Social & Inovação
                  </span>
                </div>
                <h1 className="font-editorial-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#0f0e0c] uppercase leading-[0.9] select-none">
                  {column.title}
                </h1>
                <p className="mt-2 text-xs sm:text-sm font-serif-editorial italic text-[#7a6b57]">
                  Edição exclusiva da Revista V Moda Brasil • ModaAtual
                </p>
              </div>

              {/* Card da Colunista à Direita */}
              <div className="flex items-center gap-4 sm:gap-5 bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-[#e8dfd3] shadow-sm max-w-md">
                <div className="relative shrink-0">
                  <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden border border-[#d9ccb9] shadow-inner bg-[#eadecc]">
                    <img
                      src={columnistPhotoUrl}
                      alt={column.columnist_name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#c9a86a] text-white p-1 rounded-full shadow">
                    <Sparkles className="w-3 h-3" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#9c8253] block">
                    Por
                  </span>
                  <h2 className="font-serif-editorial text-lg sm:text-xl font-bold uppercase tracking-wide text-[#1c1917] truncate">
                    {column.columnist_name}
                  </h2>

                  {/* Contatos com Ícones */}
                  <ul className="mt-2 space-y-1 text-xs text-[#5c5244]">
                    {contacts.email && (
                      <li className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#9c8253] shrink-0" />
                        <a
                          href={`mailto:${contacts.email}`}
                          className="hover:underline truncate hover:text-[#1c1917]"
                          title={contacts.email}
                        >
                          {contacts.email}
                        </a>
                      </li>
                    )}
                    {contacts.instagram_columnist && (
                      <li className="flex items-center gap-1.5 truncate">
                        <Instagram className="w-3.5 h-3.5 text-[#9c8253] shrink-0" />
                        <a
                          href={`https://instagram.com/${contacts.instagram_columnist.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate hover:text-[#1c1917]"
                        >
                          {contacts.instagram_columnist}
                        </a>
                      </li>
                    )}
                    {contacts.instagram_magazine && (
                      <li className="flex items-center gap-1.5 truncate">
                        <Instagram className="w-3.5 h-3.5 text-[#9c8253] shrink-0" />
                        <a
                          href={`https://instagram.com/${contacts.instagram_magazine.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate hover:text-[#1c1917]"
                        >
                          {contacts.instagram_magazine}
                        </a>
                      </li>
                    )}
                    {contacts.website && (
                      <li className="flex items-center gap-1.5 truncate">
                        <Globe className="w-3.5 h-3.5 text-[#9c8253] shrink-0" />
                        <a
                          href={
                            contacts.website.startsWith('http')
                              ? contacts.website
                              : `https://${contacts.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate hover:text-[#1c1917]"
                        >
                          {contacts.website}
                        </a>
                      </li>
                    )}
                    {contacts.whatsapp && (
                      <li className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-[#9c8253] shrink-0" />
                        <a
                          href={`https://wa.me/55${contacts.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate hover:text-[#1c1917]"
                        >
                          WhatsApp Colunista
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </header>

          {/* ========================================================
              2) CORPO PRINCIPAL (2 Colunas no Desktop / 1 no Mobile)
             ======================================================== */}
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Coluna da Esquerda: Manchete + Texto Corrido Justificado */}
              <div className={`${textColSpan} space-y-6`}>
                <div>
                  <h3 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight uppercase text-[#0f0e0c] leading-tight">
                    {column.headline}
                  </h3>
                  <div className="w-16 h-1 bg-[#c9a86a] mt-3" />
                </div>

                <div className="space-y-4 text-justify font-sans text-[15px] sm:text-[16px] leading-relaxed text-[#2c2621]">
                  {paragraphs.map((p, idx) => (
                    <p
                      key={idx}
                      className={
                        idx === 0
                          ? 'first-letter:font-editorial-title first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:text-[#8c7853] first-letter:leading-none'
                          : ''
                      }
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              {/* Coluna da Direita: Quadro Destacado com Fundo Bege/Dourado */}
              <div className={`${cardColSpan} w-full`}>
                <div className="relative rounded-2xl bg-gradient-to-b from-[#f2e6d3] via-[#ebdcc5] to-[#dec9ad] p-6 sm:p-7 border border-[#cbb393] shadow-md overflow-hidden">
                  {/* Detalhe de Moldura Dourada */}
                  <div className="absolute inset-1.5 rounded-xl border border-[#bda27e]/40 pointer-events-none" />

                  {/* Badge de Instituição / Parceiro no Topo */}
                  <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#78613f]">
                      {column.featured_badge || 'SENAI Hub & LabFashion'}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-white/80 border-[#b89d78] text-[#5e4b31] text-[10px] uppercase font-semibold"
                    >
                      Destaque
                    </Badge>
                  </div>

                  {/* Foto Destacada com Moldura Circular/Arredondada Sofisticada */}
                  <div className="relative my-4 flex justify-center z-10">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-full p-2 bg-gradient-to-tr from-[#c9a86a] via-[#f7f3ec] to-[#9c8253] shadow-xl">
                      <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-[#ece1d0]">
                        <img
                          src={featuredPhotoUrl}
                          alt={column.featured_caption || 'Foto em destaque'}
                          className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Legenda Serifada Elegante */}
                  {column.featured_caption && (
                    <div className="text-center relative z-10 mt-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7a6443] font-semibold">
                        Apresentação Especial
                      </p>
                      <h4 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#2a2218] mt-0.5">
                        {column.featured_caption}
                      </h4>
                    </div>
                  )}

                  {/* Linha do Evento com Ícone de Calendário */}
                  {column.featured_subcaption && (
                    <div className="mt-5 pt-4 border-t border-[#bfa583]/50 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#4f3f2a] relative z-10">
                      <Calendar className="w-4 h-4 text-[#8c6f44] shrink-0" />
                      <span className="text-center font-sans tracking-wide">
                        {column.featured_subcaption}
                      </span>
                    </div>
                  )}

                  {/* Rodapé do Quadro com Selo do Parceiro / SENAI */}
                  <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-[#6d573a] relative z-10 border-t border-[#bfa583]/30">
                    <span className="font-semibold uppercase tracking-wider">
                      Circuito Moda Goiás
                    </span>
                    <span className="font-mono text-[10px] bg-white/60 px-2 py-0.5 rounded">
                      REVISTA MODA ATUAL
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
                3) BASE: GRADE DE 3 FOTOS COM LEGENDAS (Carrossel no Mobile)
               ======================================================== */}
            <section className="mt-12 pt-10 border-t border-[#e8dfd3]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9c8253] block">
                    Galeria da Edição
                  </span>
                  <h4 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#1c1917]">
                    Flagrantes & Personalidades
                  </h4>
                </div>

                {/* Controles de Navegação no Mobile */}
                <div className="flex items-center gap-1 sm:hidden">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-[#d9ccb9]"
                    onClick={() =>
                      setActiveBottomPhotoIndex((prev) =>
                        prev === 0 ? bottomPhotos.length - 1 : prev - 1,
                      )
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-[#d9ccb9]"
                    onClick={() =>
                      setActiveBottomPhotoIndex((prev) =>
                        prev === bottomPhotos.length - 1 ? 0 : prev + 1,
                      )
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Desktop / Tablet: Grid lado a lado | Mobile: Visualizador / Slider */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-6">
                {bottomPhotos.map((photo, i) => (
                  <figure
                    key={i}
                    className="group bg-[#fdfbf7] p-2.5 rounded-lg border border-[#e4d9ca] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded bg-[#ece2d3] mb-3">
                      <img
                        src={photo}
                        alt={captions[i] || `Foto da galeria ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <figcaption className="text-xs text-[#524638] font-sans leading-relaxed text-justify px-1 flex-1">
                      {captions[i] || 'Registro especial da edição.'}
                    </figcaption>
                  </figure>
                ))}
              </div>

              {/* Mobile Carousel View */}
              <div className="sm:hidden">
                <figure className="bg-[#fdfbf7] p-3 rounded-lg border border-[#e4d9ca] shadow-sm">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded bg-[#ece2d3] mb-3">
                    <img
                      src={bottomPhotos[activeBottomPhotoIndex]}
                      alt={captions[activeBottomPhotoIndex] || 'Foto da galeria'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <figcaption className="text-xs text-[#524638] font-sans leading-relaxed text-justify">
                    {captions[activeBottomPhotoIndex] || 'Registro da edição.'}
                  </figcaption>
                  <div className="flex justify-center gap-1.5 mt-4">
                    {bottomPhotos.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        aria-label={`Ver foto ${dotIdx + 1}`}
                        onClick={() => setActiveBottomPhotoIndex(dotIdx)}
                        className={`h-2 rounded-full transition-all ${
                          dotIdx === activeBottomPhotoIndex
                            ? 'w-6 bg-[#8c7853]'
                            : 'w-2 bg-[#d9ccb9]'
                        }`}
                      />
                    ))}
                  </div>
                </figure>
              </div>
            </section>
          </div>

          {/* ========================================================
              4) RODAPÉ DA PÁGINA COM O SELO/LOGO "MODA atual"
             ======================================================== */}
          <footer className="border-t border-[#e2d5c3] bg-gradient-to-r from-[#f7f2ea] via-[#fdfbf7] to-[#f7f2ea] px-6 py-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Selo circular MODA ATUAL da referência */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#1c1917] flex flex-col items-center justify-center p-1 select-none">
                <span className="font-serif-editorial text-[10px] font-extrabold tracking-[0.15em] uppercase leading-none">
                  MODA
                </span>
                <span className="text-[7px] font-sans tracking-[0.25em] text-[#736859] uppercase mt-0.5">
                  ATUAL
                </span>
              </div>
              <div>
                <p className="text-xs font-serif-editorial font-bold text-[#1c1917] uppercase tracking-wider">
                  V MODA BRASIL • REVISTA DIGITAL
                </p>
                <p className="text-[11px] text-[#786b59]">
                  Circulação nacional e portal de inteligência de mercado
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-xs font-mono text-[#8a7a67]">ISSN 2965-0000 • Goiânia, Goiás</p>
              <p className="text-[11px] text-[#9c8e7e]">
                © {new Date().getFullYear()} Coluna {column.title}. Todos os direitos reservados.
              </p>
            </div>
          </footer>
        </article>

        {/* ========================================================
            5) OUTRAS EDIÇÕES / HISTÓRICO DA COLUNA
           ======================================================== */}
        {otherEditions.length > 1 && (
          <section className="mt-16 pt-8 border-t border-[#e4d9ca]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9c8253] block">
                  Arquivo Editorial
                </span>
                <h3 className="font-serif-editorial text-2xl font-bold text-[#1c1917]">
                  Outras edições da coluna {column.title}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherEditions
                .filter((ed) => ed.id !== column.id)
                .map((ed) => (
                  <Link
                    key={ed.id}
                    to={`/colunas/${ed.slug}`}
                    className="group bg-white p-4 rounded-xl border border-[#e8dfd3] shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="aspect-[16/10] w-full rounded-lg bg-[#efe7db] overflow-hidden mb-3">
                      <img
                        src={
                          ed.featured_photo
                            ? magazineColumnsService.getFileUrl(ed, ed.featured_photo)
                            : FALLBACK_FEATURED_PHOTO
                        }
                        alt={ed.headline}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#9c8253]">
                      {ed.title} • {ed.columnist_name}
                    </span>
                    <h5 className="font-serif-editorial font-bold text-base text-[#1c1917] mt-1 group-hover:text-[#9c8253] transition-colors line-clamp-2">
                      {ed.headline}
                    </h5>
                    <p className="text-xs text-[#736859] mt-2 line-clamp-2 flex-1">
                      {ed.body_text}
                    </p>
                    <span className="text-xs font-semibold text-[#1c1917] inline-flex items-center gap-1 mt-3">
                      Ler esta edição
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
