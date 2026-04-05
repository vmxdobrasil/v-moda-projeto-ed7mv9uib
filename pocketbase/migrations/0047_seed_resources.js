migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('resources')

    const data = [
      {
        name: 'Guia Prático para Sacoleiras de Sucesso',
        type: 'ebook',
        url: 'https://example.com/ebook1.pdf',
        description: 'Dicas de sucesso e gestão',
      },
      {
        name: 'Vendas pelo WhatsApp 2.0',
        type: 'ebook',
        url: 'https://example.com/ebook2.pdf',
        description: 'O guia definitivo para atacadistas e varejistas',
      },
      {
        name: 'Como montar sua vitrine online',
        type: 'ebook',
        url: 'https://example.com/ebook3.pdf',
        description: 'Atraia mais clientes com conteúdo visual',
      },
      {
        name: 'Revista Moda Atual - Edição de Inverno',
        type: 'magazine',
        url: 'https://example.com/revista',
        description: 'Últimas tendências da estação',
      },
      {
        name: 'Inspiração de Look Casual',
        type: 'video',
        url: 'https://instagram.com/p/123',
        description: 'Inspiração para o dia a dia',
      },
      {
        name: 'Trends da Moda Praia 2026',
        type: 'video',
        url: 'https://instagram.com/p/456',
        description: 'O que vai estar em alta',
      },
      {
        name: 'Como combinar Jeans e Alfaiataria',
        type: 'video',
        url: 'https://instagram.com/p/789',
        description: 'Elegância e conforto',
      },
      {
        name: 'Gestão Financeira para Lojistas e Sacoleiras',
        type: 'course',
        url: 'https://example.com/course1',
        description: 'VMODA80',
      },
      {
        name: 'Marketing de Moda no Instagram e Reels',
        type: 'course',
        url: 'https://example.com/course2',
        description: 'VMODA80',
      },
      {
        name: 'Atendimento e Fechamento de Vendas Rápidas',
        type: 'course',
        url: 'https://example.com/course3',
        description: 'VMODA80',
      },
    ]

    for (const item of data) {
      try {
        app.findFirstRecordByData('resources', 'name', item.name)
      } catch (_) {
        const record = new Record(col)
        record.set('name', item.name)
        record.set('type', item.type)
        record.set('url', item.url)
        record.set('description', item.description)
        app.save(record)
      }
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('resources')
    app.truncateCollection(col)
  },
)
