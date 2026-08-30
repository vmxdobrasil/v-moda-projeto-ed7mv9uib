import { useState, useRef, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { ClientResponseError } from 'pocketbase'
import { exportCustomersBatch, createExportRecord, type ExportRecord } from '@/services/exports'
import { startBackgroundOperation, endBackgroundOperation } from '@/lib/background-operations'
import { ensureValidToken, refreshAuthToken } from '@/lib/token-refresh'

export interface ExportFilters {
  search?: string
  source?: string
  status?: string
  shippingMethod?: string
  categoryId?: string
  inactivityDays?: string
}

export interface ExportProgress {
  currentBatch: number
  totalBatches: number
  processed: number
  total: number
  status: 'idle' | 'processing' | 'done' | 'error' | 'session_expired'
  error?: string
  failedBatch?: number
}

export interface ExportResult {
  success: boolean
  error?: string
  total_records?: number
  exportRecord?: ExportRecord
  sessionExpired?: boolean
  cancelled?: boolean
}

export function useCustomerExport() {
  const [progress, setProgress] = useState<ExportProgress>({
    currentBatch: 0,
    totalBatches: 0,
    processed: 0,
    total: 0,
    status: 'idle',
  })
  const isExportingRef = useRef(false)
  const cancelRef = useRef(false)
  const [isExporting, setIsExporting] = useState(false)
  const lastFiltersRef = useRef<ExportFilters | null>(null)

  const isSessionExpiredError = useCallback((err: unknown): boolean => {
    if (err instanceof ClientResponseError) {
      return err.status === 401 || err.status === 403
    }
    if (err && typeof err === 'object') {
      const e = err as any
      if (e.code === 401 || e.status === 401 || e.status === 403) return true
    }
    return false
  }, [])

  const exportLeads = useCallback(
    async (filters: ExportFilters = {}): Promise<ExportResult> => {
      if (isExportingRef.current) return { success: false }
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/admin/login') {
        return {
          success: false,
          error: 'Não é possível exportar dados na página de login.',
        }
      }

      isExportingRef.current = true
      cancelRef.current = false
      lastFiltersRef.current = filters
      setIsExporting(true)
      startBackgroundOperation()

      setProgress({
        currentBatch: 1,
        totalBatches: 1,
        processed: 0,
        total: 0,
        status: 'processing',
      })

      try {
        const tokenValid = await ensureValidToken()
        if (!tokenValid) {
          const errorMsg =
            'Não foi possível validar sua sessão. Tente novamente em alguns instantes.'
          setProgress({
            currentBatch: 0,
            totalBatches: 0,
            processed: 0,
            total: 0,
            status: 'error',
            error: errorMsg,
          })
          return { success: false, error: errorMsg }
        }

        let batch = null
        let lastBatchError: unknown = null
        const MAX_RETRIES = 2

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          if (cancelRef.current) break
          try {
            batch = await exportCustomersBatch({
              singleShot: true,
              search: filters.search,
              source: filters.source,
              status: filters.status,
              shippingMethod: filters.shippingMethod,
              categoryId: filters.categoryId,
              inactivityDays: filters.inactivityDays,
            })
            lastBatchError = null
            break
          } catch (err: unknown) {
            lastBatchError = err
            const errStatus = (err as any)?.status ?? 0
            const isAuthError = errStatus === 401 || errStatus === 403
            const isTransient = errStatus === 0 || errStatus === 500

            console.error('[Customer Export] Single-shot export request failed:', {
              attempt: attempt + 1,
              status: errStatus,
              message: err instanceof Error ? err.message : String(err),
            })

            if (attempt < MAX_RETRIES && (isAuthError || isTransient)) {
              if (isAuthError) {
                const refreshed = await refreshAuthToken()
                if (!refreshed) break
              } else {
                await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
              }
            } else {
              break
            }
          }
        }

        if (cancelRef.current) {
          setProgress({
            currentBatch: 0,
            totalBatches: 0,
            processed: 0,
            total: 0,
            status: 'idle',
          })
          return { success: false, error: 'Exportação cancelada.', cancelled: true }
        }

        if (lastBatchError) {
          const err = lastBatchError
          if (isSessionExpiredError(err)) {
            const errorMsg = 'Sua sessão expirou durante a exportação. Faça login novamente.'
            setProgress({
              currentBatch: 0,
              totalBatches: 0,
              processed: 0,
              total: 0,
              status: 'session_expired',
              error: errorMsg,
            })
            return { success: false, error: errorMsg, sessionExpired: true }
          }

          const errDetail = err instanceof Error ? err.message : String(err)
          const errorMsg = `Falha ao gerar o arquivo de exportação: ${errDetail}`
          setProgress({
            currentBatch: 0,
            totalBatches: 0,
            processed: 0,
            total: 0,
            status: 'error',
            error: errorMsg,
          })
          return { success: false, error: errorMsg }
        }

        if (!batch) {
          const errorMsg = 'Falha desconhecida na exportação.'
          setProgress({
            currentBatch: 0,
            totalBatches: 0,
            processed: 0,
            total: 0,
            status: 'error',
            error: errorMsg,
          })
          return { success: false, error: errorMsg }
        }

        const totalRecords = batch.totalRecords || 0
        if (totalRecords === 0) {
          const errorMsg = 'Nenhum lead encontrado com os filtros selecionados.'
          setProgress({
            currentBatch: 0,
            totalBatches: 0,
            processed: 0,
            total: 0,
            status: 'error',
            error: errorMsg,
          })
          return { success: false, error: errorMsg }
        }

        const csvContent =
          'name,phone,whatsapp_group_name,city,state,source,status,created\n' +
          (batch.csvChunk || '')
        const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
        const record = await createExportRecord(csvContent, filename, totalRecords)

        setProgress({
          currentBatch: 1,
          totalBatches: 1,
          processed: totalRecords,
          total: totalRecords,
          status: 'done',
        })

        return {
          success: true,
          total_records: totalRecords,
          exportRecord: record,
        }
      } catch (err: any) {
        console.error('[Customer Export] Unexpected export error:', err)
        const errorMsg = err?.message || 'Erro inesperado na exportação.'
        setProgress({
          currentBatch: 0,
          totalBatches: 0,
          processed: 0,
          total: 0,
          status: 'error',
          error: errorMsg,
        })
        return { success: false, error: errorMsg }
      } finally {
        isExportingRef.current = false
        setIsExporting(false)
        endBackgroundOperation()
      }
    },
    [isSessionExpiredError],
  )

  const retryExport = useCallback(async (): Promise<ExportResult> => {
    return exportLeads(lastFiltersRef.current || {})
  }, [exportLeads])

  const cancelExport = useCallback(() => {
    cancelRef.current = true
  }, [])

  const resetProgress = useCallback(() => {
    setProgress({
      currentBatch: 0,
      totalBatches: 0,
      processed: 0,
      total: 0,
      status: 'idle',
    })
    lastFiltersRef.current = null
  }, [])

  const clearAllExportState = useCallback(() => {
    cancelRef.current = true
    lastFiltersRef.current = null
    isExportingRef.current = false
    setIsExporting(false)
    setProgress({
      currentBatch: 0,
      totalBatches: 0,
      processed: 0,
      total: 0,
      status: 'idle',
    })
  }, [])

  return {
    progress,
    exportLeads,
    retryExport,
    cancelExport,
    isExporting,
    resetProgress,
    clearAllExportState,
  }
}
