migrate(
  (app) => {
    // Garante que is_active = true para todas as configs existentes
    app
      .db()
      .newQuery(`
      UPDATE whatsapp_configs
      SET is_active = 1
      WHERE is_active = 0 OR is_active IS NULL
    `)
      .execute()
  },
  (app) => {},
)
