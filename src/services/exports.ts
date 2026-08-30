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
  page?: number
  perPage?: number
  singleShot?: boolean
  search?: string
  source?: string
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
  filename?: string
  exportRecord?: ExportRecord
  error?: string
}

export async function exportCustomersBatch(params: ExportBatchParams): Promise<ExportBatchResult> {
  if (!pb.authStore.isValid || !pb.authStore.record) {
    console.error('[Export Service] Auth check failed: authStore invalid or no record')
    const error = new Error(
      'Falha de autenticação ao exportar leads. Sua sessão pode ter expirado.',
    )
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
    console.error('[Export Service] exportCustomersBatch failed:', {
      status: err?.status ?? 0,
      message: err?.message ?? 'Unknown error',
      url: err?.url ?? '',
      response: err?.response ?? null,
      responseBody: err?.response?.data ?? null,
      error: err,
    })
    if (err?.status === 401 || err?.status === 403) {
      const error = new Error(
        'Falha de autenticação ao exportar leads. Sua sessão pode ter expirado.',
      )
      ;(error as any).status = err?.status
      ;(error as any).response = err?.response
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

export async function exportCustomersSingleShot(
  params: Omit<ExportBatchParams, 'page' | 'perPage' | 'singleShot'> = {},
): Promise<ExportResult> {
  try {
    const batch = await exportCustomersBatch({
      ...params,
      singleShot: true,
    })

    const totalRecords = batch.totalRecords || 0
    if (totalRecords === 0) {
      return {
        success: false,
        total_records: 0,
        error: 'Nenhum lead encontrado para exportação com os filtros selecionados.',
      }
    }

    const csvContent =
      'name,phone,whatsapp_group_name,city,state,source,status,created\n' + (batch.csvChunk || '')
    const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
    const exportRecord = await createExportRecord(csvContent, filename, totalRecords)

    return {
      success: true,
      total_records: totalRecords,
      filename,
      exportRecord,
    }
  } catch (err: any) {
    console.error('[Export Service] exportCustomersSingleShot failed:', {
      status: err?.status ?? 0,
      message: err?.message ?? 'Unknown error',
      error: err,
    })
    return {
      success: false,
      total_records: 0,
      error: err?.message || 'Erro ao exportar leads. Tente novamente.',
    }
  }
}

export async function exportCustomersCsv(): Promise<ExportResult> {
  return exportCustomersSingleShot({})
}

export async function getExports(): Promise<ExportRecord[]> {
  if (!pb.authStore.isValid || !pb.authStore.record) {
    return []
  }
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
    console.error('[Export Service] downloadExportFile failed:', {
      status: res.status,
      statusText: res.statusText,
      url,
    })
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
