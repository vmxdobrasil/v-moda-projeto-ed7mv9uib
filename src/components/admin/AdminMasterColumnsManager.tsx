import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Upload,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  Sliders,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  magazineColumnsService,
  type MagazineColumnRecord,
  type LayoutPreset,
} from '@/services/magazine-columns'

export function AdminMasterColumnsManager() {
  const [columns, setColumns] = useState<MagazineColumnRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previewColumn, setPreviewColumn] = useState<MagazineColumnRecord | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [slug, setSlug] = useState('holofote')
  const [title, setTitle] = useState('HOLOFOTE')
  const [columnistName, setColumnistName] = useState('FÁBIA MENDONÇA')
  const [email, setEmail] = useState('redacaorevistamodaatual@gmail.com')
  const [instagramColumnist, setInstagramColumnist] = useState('@fabiactmendonca')
  const [instagramMagazine, setInstagramMagazine] = useState('@revistamodaatual')
  const [website, setWebsite] = useState('www.modaatual.com.br')
  const [whatsapp, setWhatsapp] = useState('62981313333')

  const [headline, setHeadline] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [featuredCaption, setFeaturedCaption] = useState('')
  const [featuredSubcaption, setFeaturedSubcaption] = useState('')
  const [featuredBadge, setFeaturedBadge] = useState('SENAI Hub & LabFashion')

  const [caption1, setCaption1] = useState('')
  const [caption2, setCaption2] = useState('')
  const [caption3, setCaption3] = useState('')

  const [layoutPreset, setLayoutPreset] = useState<LayoutPreset>('balanced')
  const [accentColor, setAccentColor] = useState('#c9a86a')
  const [published, setPublished] = useState(true)
  const [sortOrder, setSortOrder] = useState(1)

  // File Inputs
  const columnistPhotoRef = useRef<HTMLInputElement>(null)
  const featuredPhotoRef = useRef<HTMLInputElement>(null)
  const photosRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const list = await magazineColumnsService.getAllForAdmin()
      setColumns(list)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as colunas.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setSlug('holofote')
    setTitle('HOLOFOTE')
    setColumnistName('FÁBIA MENDONÇA')
    setEmail('redacaorevistamodaatual@gmail.com')
    setInstagramColumnist('@fabiactmendonca')
    setInstagramMagazine('@revistamodaatual')
    setWebsite('www.modaatual.com.br')
    setWhatsapp('62981313333')
    setHeadline('MODA & INOVAÇÃO')
    setBodyText('')
    setFeaturedCaption('Palestra com Maris Tavares')
    setFeaturedSubcaption('18 de Fevereiro às 19h Senac Elias Bufaiçal')
    setFeaturedBadge('SENAI Hub & LabFashion')
    setCaption1(
      'Na foto Karol Testoni do SENAI Lab Fashion e Rogério Barreto com toda equipe da LUCIN TÊXTIL e empresários da Moda, participantes do evento',
    )
    setCaption2(
      'Fábia Mendonça: Editora de moda e Valter Mendonça: Diretor de Marketing da Revista Moda Atual, com Karol Testoni/Senai e Rogério Barreto da Lucin Têxtil',
    )
    setCaption3(
      'Reginaldo Abdala e Silvio Umbelino celebram o sucesso do lançamento da coleção Tropyk 2025',
    )
    setLayoutPreset('balanced')
    setAccentColor('#c9a86a')
    setPublished(true)
    setSortOrder(1)

    if (columnistPhotoRef.current) columnistPhotoRef.current.value = ''
    if (featuredPhotoRef.current) featuredPhotoRef.current.value = ''
    if (photosRef.current) photosRef.current.value = ''
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (col: MagazineColumnRecord) => {
    setEditingId(col.id)
    setSlug(col.slug || 'holofote')
    setTitle(col.title || 'HOLOFOTE')
    setColumnistName(col.columnist_name || '')
    const c = col.columnist_contacts || {}
    setEmail(c.email || '')
    setInstagramColumnist(c.instagram_columnist || '')
    setInstagramMagazine(c.instagram_magazine || '')
    setWebsite(c.website || '')
    setWhatsapp(c.whatsapp || '')

    setHeadline(col.headline || '')
    setBodyText(col.body_text || '')
    setFeaturedCaption(col.featured_caption || '')
    setFeaturedSubcaption(col.featured_subcaption || '')
    setFeaturedBadge(col.featured_badge || 'SENAI Hub & LabFashion')

    const caps = col.captions || []
    setCaption1(caps[0] || '')
    setCaption2(caps[1] || '')
    setCaption3(caps[2] || '')

    setLayoutPreset(col.layout_preset || 'balanced')
    setAccentColor(col.accent_color || '#c9a86a')
    setPublished(!!col.published)
    setSortOrder(col.sort_order ?? 1)

    if (columnistPhotoRef.current) columnistPhotoRef.current.value = ''
    if (featuredPhotoRef.current) featuredPhotoRef.current.value = ''
    if (photosRef.current) photosRef.current.value = ''

    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!title.trim() || !headline.trim() || !bodyText.trim() || !columnistName.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título, colunista, manchete e o texto do artigo.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const fd = new FormData()
      fd.append('slug', slug.trim().toLowerCase() || 'holofote')
      fd.append('title', title.trim().toUpperCase())
      fd.append('columnist_name', columnistName.trim())
      fd.append(
        'columnist_contacts',
        JSON.stringify({
          email: email.trim(),
          instagram_columnist: instagramColumnist.trim(),
          instagram_magazine: instagramMagazine.trim(),
          website: website.trim(),
          whatsapp: whatsapp.trim(),
        }),
      )
      fd.append('headline', headline.trim())
      fd.append('body_text', bodyText.trim())
      fd.append('featured_caption', featuredCaption.trim())
      fd.append('featured_subcaption', featuredSubcaption.trim())
      fd.append('featured_badge', featuredBadge.trim())

      const activeCaptions = [caption1.trim(), caption2.trim(), caption3.trim()].filter(Boolean)
      fd.append('captions', JSON.stringify(activeCaptions))

      fd.append('layout_preset', layoutPreset)
      fd.append('accent_color', accentColor)
      fd.append('published', String(published))
      fd.append('sort_order', String(sortOrder))

      if (!editingId && published) {
        fd.append('published_at', new Date().toISOString())
      }

      if (columnistPhotoRef.current?.files?.[0]) {
        fd.append('columnist_photo', columnistPhotoRef.current.files[0])
      }
      if (featuredPhotoRef.current?.files?.[0]) {
        fd.append('featured_photo', featuredPhotoRef.current.files[0])
      }
      if (photosRef.current?.files && photosRef.current.files.length > 0) {
        for (let i = 0; i < photosRef.current.files.length; i++) {
          fd.append('photos', photosRef.current.files[i])
        }
      }

      if (editingId) {
        await magazineColumnsService.update(editingId, fd)
        toast({ title: 'Sucesso', description: 'Edição da coluna atualizada!' })
      } else {
        await magazineColumnsService.create(fd)
        toast({ title: 'Sucesso', description: 'Nova edição da coluna publicada!' })
      }

      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro ao salvar',
        description: err?.message || 'Falha ao gravar edição da coluna no banco.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, colTitle: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a edição "${colTitle}"?`)) return
    try {
      await magazineColumnsService.delete(id)
      toast({ title: 'Excluído', description: 'Edição removida com sucesso.' })
      loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a edição.',
        variant: 'destructive',
      })
    }
  }

  const handleTogglePublish = async (col: MagazineColumnRecord) => {
    try {
      const fd = new FormData()
      fd.append('published', String(!col.published))
      if (!col.published && !col.published_at) {
        fd.append('published_at', new Date().toISOString())
      }
      await magazineColumnsService.update(col.id, fd)
      toast({
        title: 'Status atualizado',
        description: !col.published ? 'Coluna publicada!' : 'Coluna despublicada.',
      })
      loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao alterar publicação.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#f5efe6] via-[#faf7f2] to-white p-6 rounded-2xl border border-[#e8dfd3] shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#9c8253]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#9c8253]">
              Revista V Moda Brasil
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-editorial text-[#1c1917]">
            Gerenciador da Coluna HOLOFOTE
          </h2>
          <p className="text-sm text-[#736859] max-w-2xl">
            Crie e edite as edições da coluna com diagramação editorial de revista: título, foto da
            colunista, contatos, manchete, foto destacada com evento e galeria de fotos na base.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/colunas/holofote"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium uppercase tracking-wider bg-white hover:bg-neutral-50 text-[#1c1917] border border-[#d9ccb9] rounded-xl shadow-sm transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver Página Pública
          </a>
          <Button
            onClick={handleOpenCreate}
            className="bg-[#1c1917] hover:bg-[#333] text-[#f7f3ec] rounded-xl text-xs uppercase tracking-wider shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Edição
          </Button>
        </div>
      </div>

      {/* Lista de Edições */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground">
          Carregando edições da coluna...
        </div>
      ) : columns.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-base font-medium">Nenhuma edição cadastrada ainda.</p>
            <p className="text-sm text-muted-foreground">
              Clique em "Nova Edição" para diagramar a primeira edição da coluna.
            </p>
            <Button onClick={handleOpenCreate} className="mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Edição
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {columns.map((col) => {
            const featuredImg = col.featured_photo
              ? magazineColumnsService.getFileUrl(col, col.featured_photo)
              : null
            const columnistImg = col.columnist_photo
              ? magazineColumnsService.getFileUrl(col, col.columnist_photo)
              : null

            return (
              <Card
                key={col.id}
                className="rounded-2xl overflow-hidden border-[#e8dfd3] shadow-soft hover-depth bg-[#fffdfa] flex flex-col justify-between"
              >
                <div>
                  {/* Capa / Foto Destacada */}
                  <div className="relative aspect-[16/10] bg-[#efe7db] overflow-hidden">
                    {featuredImg ? (
                      <img
                        src={featuredImg}
                        alt={col.headline}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge
                        variant={col.published ? 'default' : 'secondary'}
                        className={
                          col.published ? 'bg-emerald-600 text-white' : 'bg-neutral-500 text-white'
                        }
                      >
                        {col.published ? 'Publicada' : 'Rascunho'}
                      </Badge>
                      <Badge variant="outline" className="bg-white/80 text-[10px] uppercase">
                        {col.slug}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex items-center gap-3">
                      {columnistImg && (
                        <img
                          src={columnistImg}
                          alt={col.columnist_name}
                          className="w-8 h-8 rounded-full object-cover border border-[#c9a86a]"
                        />
                      )}
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#9c8253] block">
                          {col.title} • {col.columnist_name}
                        </span>
                        <CardTitle className="font-serif-editorial text-lg line-clamp-1">
                          {col.headline}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-3 text-xs text-[#524638]">
                    <p className="line-clamp-2 leading-relaxed">{col.body_text}</p>
                    <div className="pt-2 border-t border-[#f0e6d8] flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Preset: {col.layout_preset || 'balanced'}</span>
                      <span>Ordem: #{col.sort_order ?? 1}</span>
                    </div>
                  </CardContent>
                </div>

                {/* Ações da Edição */}
                <div className="p-4 pt-0 border-t border-[#f0e6d8] flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(col)}
                      title={col.published ? 'Despublicar' : 'Publicar'}
                      className="text-xs h-8 px-2"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 mr-1 ${col.published ? 'text-emerald-600' : 'text-neutral-400'}`}
                      />
                      {col.published ? 'No Ar' : 'Oculto'}
                    </Button>
                    <a
                      href={`/colunas/${col.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-[#736859] hover:text-[#1c1917] h-8 px-2 rounded-md hover:bg-neutral-100 transition-colors"
                      title="Abrir página pública"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      Ver
                    </a>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(col)}
                      className="h-8 px-2.5"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(col.id, col.headline)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog de Criação / Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif-editorial text-2xl">
              {editingId ? 'Editar Edição da Coluna' : 'Nova Edição da Coluna'}
            </DialogTitle>
            <DialogDescription>
              Ajuste as fotos, textos, contatos e o preset de diagramação editorial da página.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Bloco 1: Informações Gerais da Coluna */}
            <div className="bg-[#f9f6f0] p-4 rounded-xl border border-[#e8dfd3] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9c8253] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                1. Cabeçalho & Colunista
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="col-title">Título da Coluna</Label>
                  <Input
                    id="col-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="HOLOFOTE"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="col-slug">Slug (URL)</Label>
                  <Input
                    id="col-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="holofote"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="col-name">Nome da Colunista</Label>
                  <Input
                    id="col-name"
                    value={columnistName}
                    onChange={(e) => setColumnistName(e.target.value)}
                    placeholder="FÁBIA MENDONÇA"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Foto da Colunista (Blazer / Profissional)</Label>
                <Input type="file" ref={columnistPhotoRef} accept="image/*" />
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs">E-mail</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="redacaorevistamodaatual@gmail.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">WhatsApp (só dígitos)</Label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="62981313333"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Instagram Colunista</Label>
                  <Input
                    value={instagramColumnist}
                    onChange={(e) => setInstagramColumnist(e.target.value)}
                    placeholder="@fabiactmendonca"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Instagram Revista</Label>
                  <Input
                    value={instagramMagazine}
                    onChange={(e) => setInstagramMagazine(e.target.value)}
                    placeholder="@revistamodaatual"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Site Oficial</Label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.modaatual.com.br"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Artigo Principal (Manchete + Texto) */}
            <div className="bg-[#f9f6f0] p-4 rounded-xl border border-[#e8dfd3] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9c8253] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                2. Artigo & Manchete (Coluna Esquerda)
              </h4>

              <div className="space-y-1.5">
                <Label htmlFor="art-headline">Manchete em Caixa Alta</Label>
                <Input
                  id="art-headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="MODA & INOVAÇÃO"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="art-body">Texto do Artigo (aceita múltiplos parágrafos)</Label>
                <Textarea
                  id="art-body"
                  rows={6}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Escreva os parágrafos da matéria..."
                  className="font-sans"
                />
                <p className="text-[11px] text-muted-foreground">
                  Separe os parágrafos com tecla Enter dupla. A primeira letra será diagramada com
                  Drop Cap estilizada.
                </p>
              </div>
            </div>

            {/* Bloco 3: Quadro Destacado (Foto + Evento) */}
            <div className="bg-[#f9f6f0] p-4 rounded-xl border border-[#e8dfd3] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9c8253] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                3. Quadro Destacado (Coluna Direita)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Badge Superior (Parceiro / Hub)</Label>
                  <Input
                    value={featuredBadge}
                    onChange={(e) => setFeaturedBadge(e.target.value)}
                    placeholder="SENAI Hub & LabFashion"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Upload Foto Destacada</Label>
                  <Input type="file" ref={featuredPhotoRef} accept="image/*" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Legenda Serifada Elegante</Label>
                <Input
                  value={featuredCaption}
                  onChange={(e) => setFeaturedCaption(e.target.value)}
                  placeholder="Palestra com Maris Tavares"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Sublegenda do Evento (com data/local)</Label>
                <Input
                  value={featuredSubcaption}
                  onChange={(e) => setFeaturedSubcaption(e.target.value)}
                  placeholder="18 de Fevereiro às 19h Senac Elias Bufaiçal"
                />
              </div>
            </div>

            {/* Bloco 4: Base com Grade de Fotos */}
            <div className="bg-[#f9f6f0] p-4 rounded-xl border border-[#e8dfd3] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9c8253] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                4. Grade de Fotos da Base (Galeria de Flagrantes)
              </h4>

              <div className="space-y-1.5">
                <Label>Fotos da Galeria (selecione até 3 a 6 imagens)</Label>
                <Input type="file" ref={photosRef} multiple accept="image/*" />
                <p className="text-[11px] text-muted-foreground">
                  Selecione múltiplos arquivos segurando Shift ou Ctrl.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs">Legenda da Foto 1</Label>
                <Textarea
                  rows={2}
                  value={caption1}
                  onChange={(e) => setCaption1(e.target.value)}
                  placeholder="Na foto Karol Testoni do SENAI Lab Fashion e Rogério Barreto..."
                />
                <Label className="text-xs">Legenda da Foto 2</Label>
                <Textarea
                  rows={2}
                  value={caption2}
                  onChange={(e) => setCaption2(e.target.value)}
                  placeholder="Fábia Mendonça: Editora de moda e Valter Mendonça..."
                />
                <Label className="text-xs">Legenda da Foto 3</Label>
                <Textarea
                  rows={2}
                  value={caption3}
                  onChange={(e) => setCaption3(e.target.value)}
                  placeholder="Reginaldo Abdala e Silvio Umbelino celebram..."
                />
              </div>
            </div>

            {/* Bloco 5: Diagramação & Presets */}
            <div className="bg-[#f9f6f0] p-4 rounded-xl border border-[#e8dfd3] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9c8253] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                5. Ajuste de Diagramação & Visual
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Preset de Peso Visual</Label>
                  <Select
                    value={layoutPreset}
                    onValueChange={(val) => setLayoutPreset(val as LayoutPreset)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Equilibrado (Normal)</SelectItem>
                      <SelectItem value="photo_focused">Foto Maior (Destaque Visual)</SelectItem>
                      <SelectItem value="text_focused">Texto Maior (Editorial Longo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Ordem de Exibição</Label>
                  <Input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between pt-6">
                  <div>
                    <Label className="block text-sm">Publicar imediatamente</Label>
                    <span className="text-xs text-muted-foreground">Disponível ao público</span>
                  </div>
                  <Switch checked={published} onCheckedChange={setPublished} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1c1917] hover:bg-[#333] text-white"
            >
              {saving ? 'Gravando...' : editingId ? 'Salvar Alterações' : 'Publicar Edição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
