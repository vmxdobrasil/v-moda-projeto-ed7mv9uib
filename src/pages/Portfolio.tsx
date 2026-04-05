import { useState, useEffect } from 'react'
import { getProjects, Project } from '@/services/projects'
import { FadeIn } from '@/components/FadeIn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import pb from '@/lib/pocketbase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, ExternalLink } from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'

const MOCK_PROJECTS: any[] = [
  {
    id: '1',
    name: 'Coleção Outono 2026',
    description: 'Explorando a leveza e as cores quentes para a próxima estação.',
    category: 'moda_feminina',
    image: 'https://img.usecurling.com/p/600/800?q=autumn%20fashion%20collection',
    expand: { manufacturer: { name: 'V Moda Studio' } },
  },
  {
    id: '2',
    name: 'Denim Revolution',
    description: 'Cortes exclusivos e lavagens modernas que redefinem o jeanswear.',
    category: 'jeans',
    image: 'https://img.usecurling.com/p/600/800?q=denim%20jeans%20fashion',
    expand: { manufacturer: { name: 'Denim Co.' } },
  },
  {
    id: '3',
    name: 'Summer Vibes Premium',
    description: 'Moda praia de alto padrão, desenhada para destacar curvas naturais.',
    category: 'moda_praia',
    image: 'https://img.usecurling.com/p/600/800?q=swimwear%20beach%20fashion',
    expand: { manufacturer: { name: 'Beachwear BR' } },
  },
  {
    id: '4',
    name: 'Alfaiataria Essencial',
    description: 'Elegância masculina para o dia a dia, cortes precisos e tecido premium.',
    category: 'moda_masculina',
    image: 'https://img.usecurling.com/p/600/800?q=mens%20suit%20tailoring',
    expand: { manufacturer: { name: 'Tailor Masters' } },
  },
  {
    id: '5',
    name: 'Lumina Jewelry',
    description: 'Semijoias banhadas a ouro inspiradas na arquitetura urbana.',
    category: 'bijouterias_semijoias',
    image: 'https://img.usecurling.com/p/600/800?q=luxury%20jewelry%20necklace',
    expand: { manufacturer: { name: 'Lumina' } },
  },
]

export default function Portfolio() {
  useSEO({
    title: 'Portfólio de Projetos | V Moda',
    description:
      'Explore os cases de sucesso e projetos de moda desenvolvidos por nossos parceiros.',
  })

  const [projects, setProjects] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([
    { id: 'todas', name: 'Todas as Categorias' },
  ])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('todas')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, projs] = await Promise.all([
          pb.collection('categories').getFullList({ sort: 'name' }),
          pb
            .collection('projects')
            .getFullList({ sort: '-created', expand: 'manufacturer,category_id' }),
        ])
        setCategories([{ id: 'todas', name: 'Todas as Categorias' }, ...cats])
        setProjects(projs)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const data = projects.length > 0 ? projects : MOCK_PROJECTS
  const filtered = data.filter((p) => {
    const matchCat = category === 'todas' || p.category_id === category || p.category === category
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <main className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-muted/30 py-20 border-b border-border">
        <div className="container">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Nosso Portfólio</h1>
              <p className="text-lg text-muted-foreground">
                Descubra os projetos mais recentes desenvolvidos pelos nossos fabricantes e
                parceiros. Uma vitrine de criatividade e excelência na moda.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 container">
        <FadeIn delay={100}>
          <div className="flex flex-col sm:flex-row gap-4 mb-12 max-w-4xl mx-auto bg-card p-4 rounded-xl shadow-sm border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou descrição do projeto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-0 bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="w-[1px] bg-border hidden sm:block mx-2" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[240px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="capitalize">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FadeIn>

        {loading ? (
          <div className="py-24 text-center text-muted-foreground flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Carregando portfólio...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((project, i) => (
              <FadeIn key={project.id} delay={i * 50}>
                <Card className="overflow-hidden group h-full flex flex-col hover:shadow-lg transition-all duration-500 border-border/50 hover:border-primary/50 bg-card">
                  <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                    <img
                      src={
                        project.image.startsWith('http')
                          ? project.image
                          : pb.files.getUrl(project, project.image, { thumb: '600x800' })
                      }
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="bg-white text-black rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant="secondary"
                        className="bg-background/90 backdrop-blur capitalize shadow-sm text-xs px-2 py-1"
                      >
                        {project.expand?.category_id?.name ||
                          project.category?.replace('_', ' ') ||
                          'Categoria'}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3 pt-5">
                    <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between pt-0">
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                      <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden shrink-0 border border-border">
                        {project.expand?.manufacturer?.avatar ? (
                          <img
                            src={pb.files.getUrl(
                              project.expand.manufacturer,
                              project.expand.manufacturer.avatar,
                              { thumb: '100x100' },
                            )}
                            alt={project.expand.manufacturer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold">
                            {project.expand?.manufacturer?.name?.charAt(0) || 'F'}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-foreground uppercase tracking-wider">
                        {project.expand?.manufacturer?.name || 'Fabricante Parceiro'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-serif mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar sua busca ou alterar a categoria selecionada.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
