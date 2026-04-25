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
    filename: string = 'importacao_leads.csv',
  ) => {
    setIsImporting(true)
    setProgress(0)
    setStats(null)

    let totalSuccess = 0
    let totalSkipped = 0
    let totalError = 0
    let allErrors: Array<{ row: number; reason: string }> = []

    let logId = ''
    try {
      if (pb.authStore.record?.id) {
        const log = await pb.collection('import_logs').create({
          user: pb.authStore.record.id,
          filename,
          status: 'processing',
          total_records: rows.length,
          processed_records: 0,
        })
        logId = log.id
      }
    } catch (e) {
      console.error('Failed to create import log', e)
    }

    try {
      const BATCH_SIZE = 1000

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)

        const user = pb.authStore.record
        const mappedRecords = batch.map((row) => {
          const mapped: any = {}
          for (const [key, colName] of Object.entries(mapping)) {
            if (colName && row[colName] !== undefined) {
              mapped[key] = row[colName]
            }
          }
          if (user?.role === 'affiliate') {
            mapped.affiliate_referrer = user.id
          } else if (user?.id) {
            mapped.manufacturer = user.id
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

        if (logId) {
          try {
            await pb.collection('import_logs').update(logId, {
              processed_records: totalSuccess + totalSkipped + totalError,
            })
          } catch (e) {
            console.error('Failed to update import log progress', e)
          }
        }

        setProgress(Math.min(100, Math.round(((i + BATCH_SIZE) / rows.length) * 100)))
        await new Promise((r) => setTimeout(r, 50)) // yield to UI thread
      }
    } catch (err) {
      console.error('Bulk import error', err)
    } finally {
      if (logId) {
        let finalStatus = 'success'
        if (totalError > 0 && totalSuccess > 0) finalStatus = 'partial_success'
        if (totalError > 0 && totalSuccess === 0) finalStatus = 'failed'

        try {
          await pb.collection('import_logs').update(logId, {
            status: finalStatus,
            processed_records: totalSuccess + totalSkipped + totalError,
            error_summary: totalError > 0 ? `${totalError} registros com erro.` : '',
            error_details: allErrors.length > 0 ? allErrors : null,
          })
        } catch (e) {
          console.error('Failed to update import log final status', e)
        }
      }

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
