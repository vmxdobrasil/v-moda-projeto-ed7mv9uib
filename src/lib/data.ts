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
  },
]

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}
