migrate(
  (app) => {
    const collection = new Collection({
      name: 'brand_settings',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'manufacturer'",
      updateRule: "@request.auth.role = 'manufacturer'",
      deleteRule: "@request.auth.role = 'manufacturer'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'key', type: 'text', required: true },
        {
          name: 'value_file',
          type: 'file',
          maxSelect: 1,
          maxSize: 52428800,
          mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
        },
        { name: 'value_text', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_brand_settings_key ON brand_settings (key)'],
    })
    app.save(collection)

    try {
      app.findFirstRecordByData('brand_settings', 'key', 'v_moda_logo')
    } catch (_) {
      const vModaLogo = new Record(collection)
      vModaLogo.set('name', 'V-MODA Logo')
      vModaLogo.set('key', 'v_moda_logo')
      app.save(vModaLogo)
    }

    try {
      app.findFirstRecordByData('brand_settings', 'key', 'magazine_logo')
    } catch (_) {
      const magazineLogo = new Record(collection)
      magazineLogo.set('name', 'Revista Logo')
      magazineLogo.set('key', 'magazine_logo')
      app.save(magazineLogo)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('brand_settings')
    app.delete(collection)
  },
)
