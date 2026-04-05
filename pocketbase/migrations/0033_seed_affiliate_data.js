migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    try {
      app.findAuthRecordByEmail('users', 'afiliado@vmoda.com')
      return // Already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('afiliado@vmoda.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Afiliado V Moda')
    record.set('role', 'affiliate')
    record.set('affiliate_code', 'VMODA-AFI-001')

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'afiliado@vmoda.com')
      app.delete(record)
    } catch (_) {}
  },
)
