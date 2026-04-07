migrate(
  (app) => {
    const logs = app.findCollectionByNameOrId('import_logs')
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')

      const record1 = new Record(logs)
      record1.set('user', admin.id)
      record1.set('filename', 'leads_sp_jan.csv')
      record1.set('status', 'success')
      record1.set('total_records', 150)
      record1.set('processed_records', 150)
      app.save(record1)

      const record2 = new Record(logs)
      record2.set('user', admin.id)
      record2.set('filename', 'contatos_antigos.xlsx')
      record2.set('status', 'partial_success')
      record2.set('total_records', 50)
      record2.set('processed_records', 45)
      record2.set('error_summary', '5 registros falharam na validação.')
      record2.set('error_details', [
        { row: 12, reason: 'Email inválido ou já existe' },
        { row: 34, reason: 'Telefone duplicado' },
        { row: 35, reason: 'Nome muito curto' },
        { row: 41, reason: 'Formato de telefone incorreto' },
        { row: 49, reason: 'Dados ausentes' },
      ])
      app.save(record2)

      const record3 = new Record(logs)
      record3.set('user', admin.id)
      record3.set('filename', 'lista_corrompida.csv')
      record3.set('status', 'failed')
      record3.set('total_records', 100)
      record3.set('processed_records', 0)
      record3.set('error_summary', 'Formato de arquivo inválido ou cabeçalhos ausentes.')
      record3.set('error_details', [{ row: 0, reason: "Coluna 'Nome' não encontrada na planilha" }])
      app.save(record3)
    } catch (err) {
      // skip if admin not found
    }
  },
  (app) => {
    // Collection is deleted in 0050 rollback, so nothing needed here
  },
)
