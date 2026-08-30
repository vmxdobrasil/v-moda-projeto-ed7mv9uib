import { useState, useRef, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { ClientResponseError } from 'pocketbase'
import {
  exportCustomersBatch,
  createExportRecord,
  triggerDirectCsvDownload,
  type ExportRecord,
} from '@/services/exports'
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
        // Tenta re-hidratar do localStorage se o authStore estiver vazio
        if (!pb.authStore.token) {
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

        // Assegura que o token e store estejam válidos antes de iniciar
        const tokenValid = await ensureValidToken()
        if (!tokenValid && !pb.authStore.isValid && !pb.authStore.token) {
          // Tenta um refresh explícito antes de desistir
          await refreshAuthToken()
        }

        let batch = null
        let lastBatchError: unknown = null
        const MAX_RETRIES = 3

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          if (cancelRef.current) break
          try {
            if (!pb.authStore.token) {
              await ensureValidToken()
            }
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
            const isTransient =
              errStatus === 0 ||
              errStatus === 500 ||
              errStatus === 502 ||
              errStatus === 503 ||
              errStatus === 504

            console.error('[Customer Export] Single-shot export request failed:', {
              attempt: attempt + 1,
              status: errStatus,
              message: err instanceof Error ? err.message : String(err),
            })

            if (attempt < MAX_RETRIES && (isAuthError || isTransient)) {
              if (isAuthError) {
                const refreshed = await refreshAuthToken()
                if (!refreshed) {
                  await new Promise((resolve) => setTimeout(resolve, 600))
                  await refreshAuthToken()
                }
              } else {
                await new Promise((resolve) => setTimeout(resolve, 800 * Math.pow(2, attempt)))
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

        // 1. Aciona o download imediato no navegador do usuário
        triggerDirectCsvDownload(csvContent, filename)

        // 2. Salva o registro na coleção exports em background (se falhar, o download já foi feito)
        let record: ExportRecord | undefined = undefined
        try {
          record = await createExportRecord(csvContent, filename, totalRecords)
        } catch (saveErr) {
          console.warn(
            '[Customer Export] Saved file locally, but history record creation failed:',
            saveErr,
          )
        }

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
