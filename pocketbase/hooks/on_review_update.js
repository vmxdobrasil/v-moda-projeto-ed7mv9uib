onRecordAfterUpdateSuccess((e) => {
  const brandId = e.record.getString('brand')
  const records = $app.findRecordsByFilter('reviews', `brand = '${brandId}'`, '', 0, 0)
  let sum = 0
  for (let i = 0; i < records.length; i++) {
    sum += records[i].getInt('rating')
  }
  const count = records.length
  const avg = count > 0 ? sum / count : 0
  const customer = $app.findRecordById('customers', brandId)
  customer.set('rating_count', count)
  customer.set('rating_average', avg)
  $app.saveNoValidate(customer)
  e.next()
}, 'reviews')
