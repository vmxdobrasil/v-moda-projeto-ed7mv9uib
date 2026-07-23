import pb from '@/lib/pocketbase/client'

export interface ExportRecord {
  id: string
  filename: string
  file: string
  record_count: number
  part_number: number
  total_parts: number
}

export interface ExportResult {
  exports: ExportRecord[]
  total_parts: number
  total_records: number
}

export async function exportCustomersCsv(): Promise<ExportResult> {
  const result = await pb.send('/backend/v1/export-customers-csv', {
    method: 'POST',
  })
  if (result.error) {
    throw new Error(result.error)
  }
  return result as ExportResult
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
