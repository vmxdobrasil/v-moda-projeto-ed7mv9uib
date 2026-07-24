import pb from '@/lib/pocketbase/client'

export interface ExportRecord {
  id: string
  filename: string
  file: string
  record_count: number
  part_number: number
  total_parts: number
  created: string
}

export interface ExportBatchParams {
  page: number
  perPage: number
  search?: string
  status?: string
  shippingMethod?: string
  categoryId?: string
  inactivityDays?: string
}

export interface ExportBatchResult {
  csvChunk: string
  totalRecords: number
  page: number
  totalPages: number
  hasMore: boolean
}

export interface ExportResult {
  success: boolean
  total_records: number
  error?: string
}

export async function exportCustomersBatch(params: ExportBatchParams): Promise<ExportBatchResult> {
  if (!pb.authStore.isValid || !pb.authStore.record) {
    const error = new Error('Sua sessão expirou. Faça login novamente para continuar.')
    ;(error as any).status = 401
    throw error
  }
  try {
    const result = await pb.send('/backend/v1/export-customers-csv', {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
    })
    return result as ExportBatchResult
  } catch (err: any) {
    if (err?.status === 401 || err?.status === 403) {
      const error = new Error('Sua sessão expirou. Faça login novamente para continuar.')
      ;(error as any).status = 401
      throw error
    }
    throw err
  }
}

export async function createExportRecord(
  csvContent: string,
  filename: string,
  recordCount: number,
): Promise<ExportRecord> {
  const userId = pb.authStore.record?.id
  if (!userId) throw new Error('Usuário não autenticado')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
  const formData = new FormData()
  formData.append('user', userId)
  formData.append('filename', filename)
  formData.append('file', blob, filename)
  formData.append('record_count', String(recordCount))
  formData.append('part_number', '1')
  formData.append('total_parts', '1')

  const record = await pb.collection('exports').create(formData)
  return record as unknown as ExportRecord
}

export async function exportCustomersCsv(): Promise<ExportResult> {
  try {
    const csvParts: string[] = []
    let currentPage = 1
    let totalRecords = 0

    while (true) {
      const batch = await exportCustomersBatch({
        page: currentPage,
        perPage: 500,
      })
      totalRecords = batch.totalRecords
      if (batch.csvChunk) csvParts.push(batch.csvChunk)
      if (!batch.hasMore) break
      currentPage++
    }

    if (totalRecords === 0) {
      return { success: false, total_records: 0, error: 'Nenhum lead encontrado para exportação.' }
    }

    const csvContent = 'phone,whatsapp_group_name,city,state\n' + csvParts.join('')
    const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
    await createExportRecord(csvContent, filename, totalRecords)
    return { success: true, total_records: totalRecords }
  } catch (err: any) {
    return {
      success: false,
      total_records: 0,
      error: err?.message || 'Erro ao exportar leads. Tente novamente.',
    }
  }
}

export async function getExports(): Promise<ExportRecord[]> {
  const result = await pb.collection('exports').getFullList({
    sort: '-created',
  })
  return result as unknown as ExportRecord[]
}

export async function downloadExportFile(record: ExportRecord): Promise<void> {
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL
  const url = `${baseUrl}/api/files/exports/${record.id}/${record.file}`
  const res = await fetch(url, {
    headers: {
      Authorization: pb.authStore.token || '',
    },
  })
  if (!res.ok) {
    throw new Error('Falha ao baixar arquivo')
  }
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = record.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}
