import { create } from 'zustand'
import pb from '@/lib/pocketbase/client'

export type ImportStats = {
  success: number
  skipped: number
  error: number
  errorDetails?: Array<{ row: number; reason: string }>
}

interface ImportStore {
  progress: number
  processedCount: number
  totalCount: number
  isImporting: boolean
  stats: ImportStats | null
  startImport: (
    rows: any[],
    mapping: Record<string, string>,
    defaultSource?: string,
    filename?: string,
  ) => Promise<void>
  reset: () => void
}

const useImportStore = create<ImportStore>((set, get) => ({
  progress: 0,
  processedCount: 0,
  totalCount: 0,
  isImporting: false,
  stats: null,
  reset: () =>
    set({
      progress: 0,
      processedCount: 0,
      totalCount: 0,
      isImporting: false,
      stats: null,
    }),
  startImport: async (
    rows,
    mapping,
    defaultSource = 'whatsapp_group',
    filename = 'importacao_leads.csv',
  ) => {
    if (get().isImporting) return

    set({
      isImporting: true,
      progress: 0,
      processedCount: 0,
      totalCount: rows.length,
      stats: null,
    })

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
      const BATCH_SIZE = 500

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)

        const user = pb.authStore.record
        const mappedRecords = batch.map((row) => {
          const mapped: any = {}
          for (const [key, colName] of Object.entries(mapping)) {
            if (colName && row[colName] !== undefined) {
              let val = String(row[colName])

              if (key === 'phone' && val) {
                let digits = val.replace(/\D/g, '')
                if (digits.length === 10 || digits.length === 11) {
                  digits = '55' + digits
                }
                if (digits.startsWith('55') && digits.length === 12) {
                  const ddd = digits.substring(2, 4)
                  const num = digits.substring(4)
                  digits = '55' + ddd + '9' + num
                }
                val = digits
              }

              mapped[key] = val
            }
          }
          if (user?.role === 'affiliate' || user?.role === 'agent') {
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
              ...res.errorDetails.map((e: any) => ({
                row: i + e.index + 2,
                reason: e.reason,
              })),
            ]
          }
        } catch (err: any) {
          console.error('Batch error', err)
          totalError += batch.length
          allErrors.push({
            row: i + 2,
            reason: err.message || 'Erro de comunicação no lote',
          })
        }

        const currentProcessed = totalSuccess + totalSkipped + totalError

        if (logId) {
          try {
            await pb.collection('import_logs').update(logId, {
              processed_records: currentProcessed,
            })
          } catch (e) {
            console.error('Failed to update import log progress', e)
          }
        }

        const newProcessedCount = Math.min(currentProcessed, rows.length)
        const newProgress = Math.min(100, Math.round(((i + BATCH_SIZE) / rows.length) * 100))

        set({
          processedCount: newProcessedCount,
          progress: newProgress,
        })

        await new Promise((r) => setTimeout(r, 100)) // yield to UI thread
      }
    } catch (err) {
      console.error('Bulk import error', err)
    } finally {
      try {
        // Trigger the normalize logic at the end of import just in case
        await pb.send('/backend/v1/customers/normalize', { method: 'POST' })
      } catch (e) {
        console.error('Failed to trigger normalize after import', e)
      }

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

      set({
        processedCount: rows.length,
        progress: 100,
        isImporting: false,
        stats: {
          success: totalSuccess,
          skipped: totalSkipped,
          error: totalError,
          errorDetails: allErrors,
        },
      })
    }
  },
}))

export default useImportStore
