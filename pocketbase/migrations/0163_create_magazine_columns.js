migrate(
  (app) => {
    const collection = new Collection({
      name: 'magazine_columns',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'slug', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'columnist_name', type: 'text', required: true },
        {
          name: 'columnist_photo',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'columnist_contacts', type: 'json' },
        { name: 'headline', type: 'text', required: true },
        { name: 'body_text', type: 'text', required: true },
        {
          name: 'featured_photo',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'featured_caption', type: 'text' },
        { name: 'featured_subcaption', type: 'text' },
        { name: 'featured_badge', type: 'text' },
        {
          name: 'photos',
          type: 'file',
          maxSelect: 6,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'captions', type: 'json' },
        { name: 'accent_color', type: 'text' },
        { name: 'layout_preset', type: 'text' },
        { name: 'published', type: 'bool' },
        { name: 'published_at', type: 'date' },
        { name: 'sort_order', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_mag_columns_slug ON magazine_columns (slug)',
        'CREATE INDEX idx_mag_columns_published ON magazine_columns (published, sort_order)',
      ],
    })
    app.save(collection)

    // Seed edição inaugural: HOLOFOTE — Fábia Mendonça (Moda & Inovação)
    try {
      const record = new Record(collection)
      record.set('slug', 'holofote')
      record.set('title', 'HOLOFOTE')
      record.set('columnist_name', 'FÁBIA MENDONÇA')
      record.set('columnist_contacts', {
        email: 'redacaorevistamodaatual@gmail.com',
        instagram_columnist: '@fabiactmendonca',
        instagram_magazine: '@revistamodaatual',
        website: 'www.modaatual.com.br',
        whatsapp: '62981313333',
      })
      record.set('headline', 'MODA & INOVAÇÃO')
      record.set(
        'body_text',
        'O SENAI Hub e o SENAI LabFashion deram início ao calendário de moda de 2025 com um evento especial na unidade Ítalo Bologna, em colaboração com a LUCIN Têxtil. A manhã foi marcada pela presença dos principais nomes da indústria da moda, têxtil e vestuário de Goiás, promovendo uma rica troca de conhecimento e networking.\n\nA programação contou com a palestra "Ferramentas essenciais para otimizar o planejamento de coleção", ministrada pelo empresário Franklin Ricarte, além de uma fala inspiradora da coordenadora do Núcleo de Moda do SENAI Goiás, Karol Testoni, sobre a importância da atuação do LabFashion no setor.\n\nO evento também trouxe um dos momentos mais aguardados: o lançamento da coleção de Alto Verão LUCIN Têxtil, apresentando suas principais apostas para a temporada. Durante toda a semana, os representantes da LUCIN Têxtil estarão no SENAI LabFashion para atender empresas interessadas e apresentar os serviços disponíveis.',
      )
      record.set('featured_caption', 'Palestra com Maris Tavares')
      record.set('featured_subcaption', '18 de Fevereiro às 19h Senac Elias Bufaiçal')
      record.set('featured_badge', 'SENAI LabFashion')
      record.set('captions', [
        'Na foto Karol Testoni do SENAI Lab Fashion e Rogério Barreto com toda equipe da LUCIN TÊXTIL e empresários da Moda, participantes do evento',
        'Fábia Mendonça: Editora de moda e Valter Mendonça: Diretor de Marketing da Revista Moda Atual, com Karol Testoni/Senai e Rogério Barreto da Lucin Têxtil',
        'Reginaldo Abdala e Silvio Umbelino celebram o sucesso do lançamento da coleção Tropyk 2025',
      ])
      record.set('accent_color', '#c9a86a')
      record.set('layout_preset', 'balanced')
      record.set('published', true)
      record.set('published_at', new Date().toISOString())
      record.set('sort_order', 1)
      app.save(record)
    } catch (err) {
      console.log('Erro ao criar seed de magazine_columns:', err)
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('magazine_columns')
      app.delete(collection)
    } catch (_) {}
  },
)
