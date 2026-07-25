import { useState, useRef, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { createExportRecord } from '@/services/exports'
import { startBackgroundOperation, endBackgroundOperation } from '@/lib/background-operations'
import { ensureValidToken, refreshAuthToken } from '@/lib/token-refresh'
import type { LeadCollection } from '@/services/unified-leads'

export interface LeadsExportProgress {
  currentBatch: number
  totalBatches: number
  processed: number
  total: number
  status: 'idle' | 'processing' | 'done' | 'error'
  error?: string
}

const BATCH_SIZE = 500
const MAX_RETRIES = 3
const CSV_HEADER = 'collection;name;phone;email;source;status;notes;created'

export function useLeadsExport() {
  const [progress, setProgress] = useState<LeadsExportProgress>({
    currentBatch: 0,
    totalBatches: 0,
    processed: 0,
    total: 0,
    status: 'idle',
  })
  const [isExporting, setIsExporting] = useState(false)
  const cancelRef = useRef(false)
  const exportingRef = useRef(false)

  const exportLeads = useCallback(
    async (
      collections: LeadCollection[],
      filters: { search?: string; status?: string; source?: string },
    ): Promise<{ success?: boolean; error?: string; cancelled?: boolean }> => {
      if (exportingRef.current) return { error: 'Export already in progress' }
      exportingRef.current = true
      cancelRef.current = false
      setIsExporting(true)
      startBackgroundOperation()
      setProgress({
        currentBatch: 0,
        totalBatches: 0,
        processed: 0,
        total: 0,
        status: 'processing',
      })

      try {
        const csvParts: string[] = [CSV_HEADER + '\n']
        let totalRecords = 0
        let currentBatchGlobal = 0

        for (const col of collections) {
          if (cancelRef.current) break
          let page = 1
          while (true) {
            if (cancelRef.current) break
            const tokenValid = await ensureValidToken()
            if (!tokenValid) {
              setProgress((p) => ({
                ...p,
                status: 'error',
                error: 'Sessão expirada. Faça login novamente.',
              }))
              return { error: 'Sessão expirada' }
            }
            let batch: any = null
            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
              try {
                batch = await pb.send('/backend/v1/export-leads-csv', {
                  method: 'POST',
                  body: JSON.stringify({ collection: col, page, perPage: BATCH_SIZE, ...filters }),
                  headers: { 'Content-Type': 'application/json' },
                })
                break
              } catch (err: any) {
                const status = err?.status ?? 0
                if ((status === 401 || status === 403) && attempt < MAX_RETRIES) {
                  const refreshed = await refreshAuthToken()
                  if (!refreshed) throw err
                } else if ((status === 0 || status === 500) && attempt < MAX_RETRIES) {
                  await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)))
                } else {
                  throw err
                }
              }
            }
            if (!batch) break
            totalRecords += batch.totalRecords
            currentBatchGlobal++
            if (batch.csvChunk) csvParts.push(batch.csvChunk)
            setProgress({
              currentBatch: currentBatchGlobal,
              totalBatches: currentBatchGlobal + (batch.hasMore ? 1 : 0),
              processed: totalRecords,
              total: totalRecords,
              status: 'processing',
            })
            if (!batch.hasMore) break
            page++
          }
        }

        if (cancelRef.current) {
          setProgress({ currentBatch: 0, totalBatches: 0, processed: 0, total: 0, status: 'idle' })
          return { cancelled: true }
        }

        const csvContent = '\uFEFF' + csvParts.join('')
        const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
        await createExportRecord(csvContent, filename, totalRecords)
        setProgress({
          currentBatch: 1,
          totalBatches: 1,
          processed: totalRecords,
          total: totalRecords,
          status: 'done',
        })
        return { success: true }
      } catch (err: any) {
        setProgress((p) => ({ ...p, status: 'error', error: err?.message || 'Erro na exportação' }))
        return { error: err?.message || 'Erro na exportação' }
      } finally {
        exportingRef.current = false
        setIsExporting(false)
        endBackgroundOperation()
      }
    },
    [],
  )

  const cancelExport = useCallback(() => {
    cancelRef.current = true
  }, [])
  const resetProgress = useCallback(() => {
    setProgress({ currentBatch: 0, totalBatches: 0, processed: 0, total: 0, status: 'idle' })
  }, [])

  return { progress, exportLeads, cancelExport, isExporting, resetProgress }
}
