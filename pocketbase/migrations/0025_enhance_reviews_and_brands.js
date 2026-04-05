migrate(
  (app) => {
    // 1. Add is_verified to users
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('is_verified')) {
      users.fields.add(new BoolField({ name: 'is_verified' }))
    }
    app.save(users)

    // 2. Add price_level to customers
    const customers = app.findCollectionByNameOrId('customers')
    if (!customers.fields.getByName('price_level')) {
      customers.fields.add(new SelectField({ name: 'price_level', values: ['$', '$$', '$$$'] }))
    }
    app.save(customers)

    // 3. Add images to reviews
    const reviews = app.findCollectionByNameOrId('reviews')
    if (!reviews.fields.getByName('images')) {
      reviews.fields.add(
        new FileField({
          name: 'images',
          maxSelect: 5,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    app.save(reviews)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('is_verified')
    app.save(users)

    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.removeByName('price_level')
    app.save(customers)

    const reviews = app.findCollectionByNameOrId('reviews')
    reviews.fields.removeByName('images')
    app.save(reviews)
  },
)
