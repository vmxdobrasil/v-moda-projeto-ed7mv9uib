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
  if (!pb.authStore.token && !pb.authStore.record) {
    // Tenta re-hidratar do localStorage antes de lançar erro
    try {
      const raw =
        typeof localStorage !== 'undefined' ? localStorage.getItem('pocketbase_auth') : null
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.token && parsed?.record) {
          pb.authStore.save(parsed.token, parsed.record)
        }
      }
    } catch {
      /* best-effort */
    }
  }

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
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token || '',
      },
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
  let userId = pb.authStore.record?.id
  if (!userId) {
    // Tenta recuperar do localStorage
    try {
      const raw =
        typeof localStorage !== 'undefined' ? localStorage.getItem('pocketbase_auth') : null
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.token && parsed?.record) {
          pb.authStore.save(parsed.token, parsed.record)
          userId = parsed.record.id
        }
      }
    } catch {
      /* best-effort */
    }
  }
  if (!userId) throw new Error('Usuário não autenticado para criar registro de exportação.')

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
    try {
      const raw =
        typeof localStorage !== 'undefined' ? localStorage.getItem('pocketbase_auth') : null
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.token && parsed?.record) {
          pb.authStore.save(parsed.token, parsed.record)
        }
      }
    } catch {
      /* best-effort */
    }
  }

  if (!pb.authStore.isValid || !pb.authStore.record) {
    return []
  }
  const result = await pb.collection('exports').getFullList({
    sort: '-created',
    requestKey: null,
  })
  return result as unknown as ExportRecord[]
}

export async function downloadExportFile(record: ExportRecord): Promise<void> {
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL
  const fileUrl = `${baseUrl}/api/files/exports/${record.id}/${record.file}`

  // Tenta garantir que temos o token mais recente
  const token = pb.authStore.token || ''

  try {
    const res = await fetch(fileUrl, {
      headers: token ? { Authorization: token } : {},
    })

    if (!res.ok) {
      console.error('[Export Service] downloadExportFile fetch response not ok:', {
        status: res.status,
        statusText: res.statusText,
        fileUrl,
      })
      // Se 404 ou 403 no download via fetch, tenta link direto com query param de token
      if (token) {
        const directUrl = `${fileUrl}?token=${encodeURIComponent(token)}`
        const a = document.createElement('a')
        a.href = directUrl
        a.download = record.filename
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        return
      }
      throw new Error(`Falha ao baixar arquivo (${res.status} ${res.statusText})`)
    }

    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = record.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
  } catch (err: any) {
    console.error('[Export Service] downloadExportFile failed:', err)
    // Fallback de download direto
    if (token) {
      const directUrl = `${fileUrl}?token=${encodeURIComponent(token)}`
      window.open(directUrl, '_blank')
      return
    }
    throw new Error(err?.message || 'Falha ao baixar arquivo')
  }
}
