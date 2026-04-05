migrate(
  (app) => {
    const brands = app.findRecordsByFilter(
      'customers',
      'ranking_position > 0',
      'ranking_position',
      5,
      0,
    )

    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
    } catch (_) {
      return // skip seeding if no user is found
    }

    const cities = ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Trindade', 'Rio Verde']
    const reviewsCol = app.findCollectionByNameOrId('reviews')

    for (let i = 0; i < brands.length; i++) {
      const brand = brands[i]
      brand.set('city', cities[i % cities.length])
      brand.set('state', 'GO')

      try {
        app.findFirstRecordByFilter('reviews', `brand='${brand.id}' && user='${user.id}'`)
      } catch (_) {
        const review = new Record(reviewsCol)
        review.set('user', user.id)
        review.set('brand', brand.id)
        review.set('rating', 5)
        review.set(
          'comment',
          'Atendimento impecável e produtos de altíssima qualidade! Nossa parceria tem sido um sucesso.',
        )
        app.save(review)
      }

      const allReviews = app.findRecordsByFilter('reviews', `brand='${brand.id}'`, '', 0, 0)
      brand.set('rating_count', allReviews.length)
      let sum = 0
      for (let r of allReviews) sum += r.getInt('rating')
      brand.set('rating_average', allReviews.length > 0 ? sum / allReviews.length : 0)

      app.save(brand)
    }
  },
  (app) => {},
)
