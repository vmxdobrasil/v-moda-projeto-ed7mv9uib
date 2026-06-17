import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Plus, Image as ImageIcon, BookOpen, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ManufacturerCatalog() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')
  const [minQty, setMinQty] = useState('')
  const [colors, setColors] = useState('')
  const [sizes, setSizes] = useState('')
  const [isSeasonal, setIsSeasonal] = useState(false)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])

  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const loadProjects = () => {
    pb.collection('projects')
      .getFullList({
        filter: `manufacturer = "${user?.id}"`,
        sort: '-created',
      })
      .then(setProjects)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user) loadProjects()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !coverFile) {
      toast.error('Preencha os campos obrigatórios e adicione a capa.')
      return
    }
    if (galleryFiles.length > 4) {
      toast.error('O catálogo suporta no máximo 4 fotos internas.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('wholesale_price', wholesalePrice)
      formData.append('min_quantity_wholesale', minQty)
      formData.append('colors', colors)
      formData.append('sizes', sizes)
      formData.append('is_seasonal', String(isSeasonal))
      formData.append('manufacturer', user?.id as string)
      formData.append('image', coverFile)

      galleryFiles.forEach((f) => formData.append('gallery', f))

      await pb.collection('projects').create(formData)
      toast.success('Projeto salvo com sucesso!')
      setIsOpen(false)
      loadProjects()
      // reset
      setName('')
      setDescription('')
      setWholesalePrice('')
      setMinQty('')
      setColors('')
      setSizes('')
      setIsSeasonal(false)
      setCoverFile(null)
      setGalleryFiles([])
    } catch (err: any) {
      toast.error('Erro ao salvar o projeto', { description: err.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return
    try {
      await pb.collection('projects').delete(id)
      toast.success('Produto excluído.')
      loadProjects()
    } catch (err: any) {
      toast.error('Erro ao excluir', { description: err.message })
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-1">Catálogo Digital de Revistas</h1>
          <p className="text-muted-foreground">
            Construa seu catálogo em formato editorial (1 capa + até 4 fotos).
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar ao Catálogo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome da Peça/Coleção *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Descrição / Argumento de Venda</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Preço Atacado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qtd Mínima Atacado</Label>
                  <Input type="number" value={minQty} onChange={(e) => setMinQty(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Cores Disponíveis</Label>
                  <Input
                    placeholder="Ex: Preto, Nude, Marsala"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tamanhos</Label>
                  <Input
                    placeholder="Ex: P, M, G, GG"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2 flex items-center justify-between border rounded p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label>Coleção Sazonal?</Label>
                    <p className="text-sm text-muted-foreground">
                      Destaque especial para campanhas limitadas.
                    </p>
                  </div>
                  <Switch checked={isSeasonal} onCheckedChange={setIsSeasonal} />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Imagem de Capa *</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">
                      Clique para escolher a Capa
                    </p>
                    <input
                      type="file"
                      ref={coverInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  {coverFile && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      ✓ {coverFile.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Imagens Internas (Máximo 4)</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">
                      Clique para adicionar fotos (Selecione até 4)
                    </p>
                    <input
                      type="file"
                      multiple
                      ref={galleryInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        if (files.length > 4) {
                          toast.error(
                            'Você pode selecionar no máximo 4 imagens para o miolo da revista.',
                          )
                          return
                        }
                        setGalleryFiles(files)
                      }}
                    />
                  </div>
                  {galleryFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {galleryFiles.map((f, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          ✓ {f.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">
                  Publicar no Catálogo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Carregando catálogo...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold">Nenhum produto publicado</h3>
          <p className="text-muted-foreground mb-4">
            Crie seu primeiro projeto para montar o catálogo digital.
          </p>
          <Button onClick={() => setIsOpen(true)}>Novo Produto</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((p) => (
            <Card key={p.id} className="overflow-hidden group">
              <div className="aspect-[3/4] relative bg-muted">
                {p.image && (
                  <img
                    src={pb.files.getUrl(p, p.image, { thumb: '400x600' })}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  {p.is_seasonal && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 shadow-sm">Sazonal</Badge>
                  )}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="font-bold text-lg text-white line-clamp-1">{p.name}</h3>
                </div>
              </div>
              <CardContent className="p-4 bg-card">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Min. {p.min_quantity_wholesale || 1} un</p>
                    <p className="font-bold text-primary">R$ {p.wholesale_price || '0,00'}</p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {p.gallery?.length || 0} fotos int.
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground"
                    >
                      <BookOpen className="w-4 h-4 mr-2" /> Revista Digital
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 text-white border-none rounded-none sm:rounded-xl">
                    <DialogTitle className="sr-only">Visualização Revista</DialogTitle>
                    <ScrollArea className="h-[85vh] w-full">
                      <div className="flex flex-col items-center max-w-3xl mx-auto py-8 space-y-8 px-4 sm:px-8">
                        {p.image && (
                          <div className="w-full shadow-2xl rounded overflow-hidden relative">
                            <img src={pb.files.getUrl(p, p.image)} className="w-full h-auto" />
                            <div className="absolute bottom-6 left-6 right-6 text-center">
                              <h1 className="text-4xl md:text-6xl font-serif text-white drop-shadow-lg uppercase tracking-widest">
                                {p.name}
                              </h1>
                            </div>
                          </div>
                        )}

                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-lg w-full text-center space-y-4">
                          <h2 className="text-xl font-serif text-primary-foreground/90 uppercase tracking-widest border-b border-white/20 pb-4 inline-block px-8">
                            Detalhes da Coleção
                          </h2>
                          <p className="text-white/80 leading-relaxed text-lg">{p.description}</p>
                          <div className="flex flex-wrap justify-center gap-3 pt-4">
                            {p.colors && (
                              <Badge
                                variant="secondary"
                                className="bg-white/10 text-white hover:bg-white/20 px-4 py-1"
                              >
                                CORES: {p.colors}
                              </Badge>
                            )}
                            {p.sizes && (
                              <Badge
                                variant="secondary"
                                className="bg-white/10 text-white hover:bg-white/20 px-4 py-1"
                              >
                                TAMANHOS: {p.sizes}
                              </Badge>
                            )}
                            {p.wholesale_price && (
                              <Badge
                                variant="secondary"
                                className="bg-primary text-primary-foreground px-4 py-1"
                              >
                                ATACADO: R$ {p.wholesale_price}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {p.gallery && p.gallery.length > 0 && (
                          <div
                            className={`grid gap-4 w-full ${p.gallery.length === 1 ? 'grid-cols-1' : p.gallery.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}
                          >
                            {p.gallery.map((img: string, i: number) => (
                              <div
                                key={i}
                                className={`shadow-xl rounded overflow-hidden ${p.gallery.length === 3 && i === 2 ? 'sm:col-span-2' : ''}`}
                              >
                                <img
                                  src={pb.files.getUrl(p, img)}
                                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
