onRecordUpdateRequest((e) => {
  const newStatus = e.record.get('status')
  if (newStatus === 'converted') {
    try {
      const oldRecord = $app.findRecordById('customers', e.record.id)
      if (oldRecord.get('status') !== 'converted') {
        const notif = new Record($app.findCollectionByNameOrId('notifications'))
        notif.set('user', e.record.get('manufacturer'))
        notif.set('title', '🚀 Meta Alcançada: Venda Concluída!')
        notif.set(
          'message',
          `O lead ${e.record.get('name')} foi convertido com sucesso para o status de Venda Concluída.`,
        )
        $app.saveNoValidate(notif)
      }
    } catch (err) {
      // Ignore if record doesn't exist yet
    }
  }
  e.next()
}, 'customers')
