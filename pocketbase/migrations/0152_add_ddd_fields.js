migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    if (!customers.fields.getByName('ddd')) {
      customers.fields.add(new TextField({ name: 'ddd' }))
    }
    customers.addIndex('idx_customers_ddd', false, 'ddd', '')
    app.save(customers)

    const leadsRetailers = app.findCollectionByNameOrId('leads_retailers')
    if (!leadsRetailers.fields.getByName('ddd')) {
      leadsRetailers.fields.add(new TextField({ name: 'ddd' }))
    }
    leadsRetailers.addIndex('idx_leads_retailers_ddd', false, 'ddd', '')
    app.save(leadsRetailers)

    app
      .db()
      .newQuery(`
      UPDATE customers SET ddd = SUBSTR(
        REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''),
        CASE
          WHEN REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') LIKE '55%'
            AND LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '')) > 11
          THEN 3 ELSE 1
        END, 2
      )
      WHERE phone IS NOT NULL AND phone != ''
    `)
      .execute()

    app
      .db()
      .newQuery(`
      UPDATE leads_retailers SET ddd = SUBSTR(
        REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''),
        CASE
          WHEN REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') LIKE '55%'
            AND LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '')) > 11
          THEN 3 ELSE 1
        END, 2
      )
      WHERE phone IS NOT NULL AND phone != ''
    `)
      .execute()
  },
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    customers.removeIndex('idx_customers_ddd')
    customers.fields.removeByName('ddd')
    app.save(customers)

    const leadsRetailers = app.findCollectionByNameOrId('leads_retailers')
    leadsRetailers.removeIndex('idx_leads_retailers_ddd')
    leadsRetailers.fields.removeByName('ddd')
    app.save(leadsRetailers)
  },
)
