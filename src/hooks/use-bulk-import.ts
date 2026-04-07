import { useState } from 'react'
import pb from '@/lib/pocketbase/client'

export type ImportStats = {
  success: number
  skipped: number
  error: number
  errorDetails?: Array<{ row: number; reason: string }>
}

export function useBulkImport() {
  const [progress, setProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [stats, setStats] = useState<ImportStats | null>(null)

  const startImport = async (
    rows: any[],
    mapping: Record<string, string>,
    defaultSource: string = 'whatsapp_group',
  ) => {
    setIsImporting(true)
    setProgress(0)
    setStats(null)

    let totalSuccess = 0
    let totalSkipped = 0
    let totalError = 0
    let allErrors: Array<{ row: number; reason: string }> = []

    try {
      const BATCH_SIZE = 1000

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)

        const mappedRecords = batch.map((row) => {
          const mapped: any = {}
          for (const [key, colName] of Object.entries(mapping)) {
            if (colName && row[colName] !== undefined) {
              mapped[key] = row[colName]
            }
          }
          return mapped
        })

        try {
          const res = await pb.send('/backend/v1/customers/bulk-import', {
            method: 'POST',
            body: JSON.stringify({ records: mappedRecords, defaultSource }),
            headers: { 'Content-Type': 'application/json' },
          })

          totalSuccess += res.success || 0
          totalSkipped += res.skipped || 0
          totalError += res.error || 0

          if (res.errorDetails && Array.isArray(res.errorDetails)) {
            allErrors = [
              ...allErrors,
              ...res.errorDetails.map((e: any) => ({ row: i + e.index + 2, reason: e.reason })),
            ]
          }
        } catch (err: any) {
          console.error('Batch error', err)
          totalError += batch.length
          allErrors.push({ row: i + 2, reason: err.message || 'Erro de comunicação no lote' })
        }

        setProgress(Math.min(100, Math.round(((i + BATCH_SIZE) / rows.length) * 100)))
        await new Promise((r) => setTimeout(r, 50)) // yield to UI thread
      }
    } catch (err) {
      console.error('Bulk import error', err)
    } finally {
      setProgress(100)
      setIsImporting(false)
      setStats({
        success: totalSuccess,
        skipped: totalSkipped,
        error: totalError,
        errorDetails: allErrors,
      })
    }
  }

  return { progress, isImporting, stats, startImport }
}
