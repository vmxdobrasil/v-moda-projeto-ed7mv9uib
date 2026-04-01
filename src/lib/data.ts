export interface Product {
  id: string
  name: string
  price: number
  wholesalePrice?: number
  category: string
  image: string
  images: string[]
  description: string
  colors: string[]
  sizes: string[]
  trending?: boolean
  manufacturer: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Vestido de Seda Minimalista',
    price: 1290.0,
    wholesalePrice: 890.0,
    category: 'Vestidos',
    image: 'https://img.usecurling.com/p/600/800?q=elegant%20silk%20dress%20fashion%20model',
    images: [
      'https://img.usecurling.com/p/600/800?q=elegant%20silk%20dress%20fashion%20model&seed=1',
      'https://img.usecurling.com/p/600/800?q=elegant%20silk%20dress%20back%20view&seed=1',
      'https://img.usecurling.com/p/600/800?q=silk%20fabric%20texture&seed=1',
    ],
    description:
      'Um vestido de seda pura com corte enviesado que flui perfeitamente pelo corpo. O design minimalista apresenta alças finas e um decote drapeado sutil, ideal para eventos noturnos ou ocasiões especiais. Confeccionado artesanalmente com atenção a cada detalhe.',
    colors: ['#000000', '#C5A059', '#F5F5DC'],
    sizes: ['P', 'M', 'G'],
    trending: true,
    manufacturer: 'Seda & Co.',
  },
  {
    id: 'p2',
    name: 'Blazer Estruturado em Lã',
    price: 1850.0,
    wholesalePrice: 1200.0,
    category: 'Casacos',
    image: 'https://img.usecurling.com/p/600/800?q=structured%20wool%20blazer%20fashion',
    images: [
      'https://img.usecurling.com/p/600/800?q=structured%20wool%20blazer%20fashion&seed=2',
      'https://img.usecurling.com/p/600/800?q=blazer%20buttons%20detail&seed=2',
    ],
    description:
      'Blazer de alfaiataria impecável em lã fria. Ombros marcados e cintura levemente acinturada criam uma silhueta poderosa e sofisticada.',
    colors: ['#000000', '#333333'],
    sizes: ['P', 'M', 'G', 'GG'],
    trending: true,
    manufacturer: 'Alfaiataria Premium',
  },
  {
    id: 'p3',
    name: 'Calça Pantalona Crepe',
    price: 890.0,
    wholesalePrice: 550.0,
    category: 'Calças',
    image: 'https://img.usecurling.com/p/600/800?q=wide%20leg%20trousers%20fashion',
    images: ['https://img.usecurling.com/p/600/800?q=wide%20leg%20trousers%20fashion&seed=3'],
    description:
      'Calça de modelagem ampla em crepe texturizado. Cintura alta com pregas frontais que alongam a silhueta.',
    colors: ['#FFFFFF', '#000000'],
    sizes: ['36', '38', '40', '42'],
    trending: false,
    manufacturer: 'Basics',
  },
  {
    id: 'p4',
    name: 'Trench Coat Clássico',
    price: 2400.0,
    wholesalePrice: 1600.0,
    category: 'Casacos',
    image: 'https://img.usecurling.com/p/600/800?q=classic%20trench%20coat%20fashion%20model',
    images: [
      'https://img.usecurling.com/p/600/800?q=classic%20trench%20coat%20fashion%20model&seed=4',
      'https://img.usecurling.com/p/600/800?q=trench%20coat%20belt%20detail&seed=4',
    ],
    description:
      'O essencial do guarda-roupa de transição. Algodão gabardine resistente à água com forro em estampa exclusiva.',
    colors: ['#D2B48C'],
    sizes: ['P', 'M', 'G'],
    trending: true,
    manufacturer: 'Alfaiataria Premium',
  },
  {
    id: 'p5',
    name: 'Bolsa Couro Estruturada',
    price: 3200.0,
    wholesalePrice: 2100.0,
    category: 'Acessórios',
    image: 'https://img.usecurling.com/p/600/800?q=luxury%20leather%20handbag',
    images: ['https://img.usecurling.com/p/600/800?q=luxury%20leather%20handbag&seed=5'],
    description:
      'Bolsa em couro de vitelo com ferragens douradas. Design atemporal e versátil para o dia a dia elegante.',
    colors: ['#000000', '#8B4513'],
    sizes: ['Único'],
    trending: true,
    manufacturer: 'Couro Fino',
  },
  {
    id: 'p6',
    name: 'Sapato Scarpin Verniz',
    price: 1100.0,
    wholesalePrice: 750.0,
    category: 'Calçados',
    image: 'https://img.usecurling.com/p/600/800?q=black%20stiletto%20heels',
    images: ['https://img.usecurling.com/p/600/800?q=black%20stiletto%20heels&seed=6'],
    description:
      'Scarpin clássico em couro envernizado com salto agulha de 10cm. O toque final de poder para qualquer look.',
    colors: ['#000000', '#FF0000'],
    sizes: ['35', '36', '37', '38', '39'],
    trending: false,
    manufacturer: 'Couro Fino',
  },
]

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  icon: string
  longDescription: string
  modules: string[]
  duration: string
  level: string
  image: string
  isSpecialization?: boolean
  hotmartLink?: string
}

export const COURSES: Course[] = [
  {
    id: 'vendas-fabricantes',
    title: 'Vendas para Gerentes e Vendedoras de Lojas de Fabricantes',
    description:
      'Módulos dedicados para equipes de loja e gerentes de fabricantes, focados em técnicas de alta conversão e gestão de loja no varejo.',
    instructor: 'Especialistas V MODA',
    icon: 'Store',
    longDescription:
      'Este programa foi desenhado especificamente para a realidade de lojas de fábrica e atacado de marcas fabricantes. Aprenda técnicas avançadas de chão de loja, gestão de equipe de vendas, metas de conversão e atendimento premium que transformam o varejo de fábrica em uma experiência de excelência.',
    modules: [
      'Gestão Estratégica de Loja',
      'Técnicas de Vendas e Conversão',
      'Atendimento Premium em Atacado',
      'Visual Merchandising Prático',
    ],
    duration: '40 horas',
    level: 'Avançado',
    image: 'https://img.usecurling.com/p/800/600?q=retail%20store%20management%20fashion',
    isSpecialization: true,
    hotmartLink: 'https://pay.hotmart.com/vmoda-vendas-fabricantes',
  },
  {
    id: 'revendedora-consultora',
    title: 'De Revendedora a Consultora de Moda e Vendas',
    description:
      'Transforme sua atuação com foco em personal branding, consultoria de estilo e vendas consultivas de alto nível.',
    instructor: 'Fábia Mendonça',
    icon: 'Star',
    longDescription:
      'Uma trilha de carreira desenhada para elevar o seu perfil profissional. Deixe de ser apenas uma revendedora e torne-se uma Consultora de Moda e Vendas reconhecida. O currículo foca em consultoria de imagem, noções de personal styling, e estratégias avançadas de vendas para fidelizar clientes exigentes.',
    modules: [
      'Fundamentos do Personal Styling',
      'Consultoria de Imagem na Prática',
      'Venda Consultiva e Relacionamento',
      'Posicionamento e Criação de Autoridade',
    ],
    duration: '60 horas',
    level: 'Intermediário a Avançado',
    image: 'https://img.usecurling.com/p/800/600?q=personal%20stylist%20fashion%20consultant',
    isSpecialization: true,
    hotmartLink: 'https://pay.hotmart.com/vmoda-consultora-moda',
  },
  {
    id: 'marketing-digital',
    title: 'Marketing de Moda Digital',
    description:
      'Aprenda as estratégias mais atuais para posicionar sua marca no ambiente digital.',
    instructor: 'Equipe V MODA',
    icon: 'TrendingUp',
    longDescription:
      'Domine as ferramentas digitais para alavancar as vendas da sua marca de moda. Desde tráfego pago até estratégias orgânicas de crescimento sustentável no Instagram e TikTok.',
    modules: [
      'Introdução ao Marketing Digital',
      'Tráfego Pago para Moda',
      'E-commerce e Conversão',
      'Análise de Métricas',
    ],
    duration: '30 horas',
    level: 'Iniciante',
    image: 'https://img.usecurling.com/p/800/600?q=digital%20marketing%20fashion',
    hotmartLink: 'https://pay.hotmart.com/vmoda-marketing-digital',
  },
  {
    id: 'branding-moda',
    title: 'Branding para Moda',
    description: 'Construa uma marca forte, desejável e com identidade visual inconfundível.',
    instructor: 'Fábia Mendonça',
    icon: 'Target',
    longDescription:
      'Aprenda a criar uma identidade de marca que ressoe com seu público-alvo, criando desejo e lealdade no competitivo mercado da moda. Descubra o seu DNA de marca.',
    modules: [
      'DNA de Marca',
      'Identidade Visual',
      'Posicionamento de Mercado',
      'Storytelling na Moda',
    ],
    duration: '25 horas',
    level: 'Intermediário',
    image: 'https://img.usecurling.com/p/800/600?q=fashion%20branding%20design',
    hotmartLink: 'https://pay.hotmart.com/vmoda-branding-moda',
  },
  {
    id: 'estrategias-vendas',
    title: 'Estratégias de Vendas',
    description: 'Técnicas avançadas de negociação e conversão para o mercado de luxo.',
    instructor: 'Valter Mendonça',
    icon: 'Users',
    longDescription:
      'Aprimore suas habilidades de negociação com foco no mercado premium e de luxo. Entenda o comportamento do consumidor de alto padrão e feche vendas maiores.',
    modules: [
      'Psicologia do Consumidor',
      'Técnicas de Persuasão',
      'Fechamento de Vendas',
      'Pós-venda e Fidelização',
    ],
    duration: '35 horas',
    level: 'Avançado',
    image: 'https://img.usecurling.com/p/800/600?q=luxury%20fashion%20sales',
    hotmartLink: 'https://pay.hotmart.com/vmoda-estrategias-vendas',
  },
  {
    id: 'gestao-redes',
    title: 'Gestão de Redes Sociais',
    description: 'Como criar conteúdo que engaja e converte seguidores em clientes fiéis.',
    instructor: 'Equipe Moda Atual',
    icon: 'Lightbulb',
    longDescription:
      'Estratégias práticas para dominar o Instagram, TikTok e Pinterest para marcas de moda, transformando curtidas em vendas e seguidores em fãs da marca.',
    modules: [
      'Estratégia de Conteúdo',
      'Produção Visual para Redes',
      'Engajamento e Comunidade',
      'Social Commerce',
    ],
    duration: '20 horas',
    level: 'Iniciante a Intermediário',
    image: 'https://img.usecurling.com/p/800/600?q=social%20media%20fashion%20content',
    hotmartLink: 'https://pay.hotmart.com/vmoda-gestao-redes',
  },
]
