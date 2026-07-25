import { useState, useRef, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { ClientResponseError } from 'pocketbase'
import { exportCustomersBatch, createExportRecord } from '@/services/exports'
import { startBackgroundOperation, endBackgroundOperation } from '@/lib/background-operations'
import { ensureValidToken, refreshAuthToken } from '@/lib/token-refresh'

export interface ExportFilters {
  search: string
  status: string
  shippingMethod: string
  categoryId: string
  inactivityDays: string
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
  sessionExpired?: boolean
  cancelled?: boolean
}

const BATCH_SIZE = 500

interface RetryState {
  lastBatch: number
  csvParts: string[]
  totalRecords: number
  totalBatches: number
  filters: ExportFilters
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
  const retryStateRef = useRef<RetryState | null>(null)

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

  const savePartialResults = useCallback(
    async (csvParts: string[], totalRecords: number, batchLabel: string): Promise<boolean> => {
      if (csvParts.length === 0 || totalRecords === 0) return false
      try {
        const csvContent = 'phone,whatsapp_group_name,city,state\n' + csvParts.join('')
        const filename = `leads_export_${new Date().toISOString().split('T')[0]}_${batchLabel}.csv`
        await createExportRecord(csvContent, filename, totalRecords)
        return true
      } catch {
        return false
      }
    },
    [],
  )

  const runExport = useCallback(
    async (
      filters: ExportFilters,
      startBatch: number,
      existingCsvParts: string[],
      knownTotalRecords: number,
      knownTotalBatches: number,
    ): Promise<ExportResult> => {
      let currentPage = startBatch
      let totalRecords = knownTotalRecords
      let totalBatches = knownTotalBatches
      const csvParts = [...existingCsvParts]

      try {
        while (true) {
          if (cancelRef.current) {
            await savePartialResults(csvParts, totalRecords, 'cancelado')
            setProgress({
              currentBatch: 0,
              totalBatches: 0,
              processed: 0,
              total: 0,
              status: 'idle',
            })
            return { success: false, error: 'Exportação cancelada.', cancelled: true }
          }

          const batchTokenValid = await ensureValidToken()
          if (!batchTokenValid) {
            retryStateRef.current = {
              lastBatch: currentPage,
              csvParts,
              totalRecords,
              totalBatches,
              filters,
            }
            await savePartialResults(csvParts, totalRecords, 'parcial')
            const processed = (currentPage - 1) * BATCH_SIZE
            const batchTotal = totalBatches || '?'
            const errorMsg = `Sua sessão expirou ao exportar o lote ${currentPage} de ${batchTotal}. Faça logout e login novamente, depois retome a exportação.`
            setProgress({
              currentBatch: currentPage,
              totalBatches,
              processed,
              total: totalRecords,
              status: 'error',
              error: errorMsg,
              failedBatch: currentPage,
            })
            return { success: false, error: errorMsg }
          }

          setProgress((prev) => ({
            ...prev,
            currentBatch: currentPage,
            totalBatches: totalBatches || prev.totalBatches,
            status: 'processing',
            error: undefined,
          }))

          let batch
          let lastBatchError: unknown = null
          const MAX_BATCH_RETRIES = 3

          for (let batchAttempt = 0; batchAttempt <= MAX_BATCH_RETRIES; batchAttempt++) {
            if (cancelRef.current) break
            try {
              batch = await exportCustomersBatch({
                page: currentPage,
                perPage: BATCH_SIZE,
                search: filters.search,
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
              console.error('[Customer Export] Batch request failed:', {
                page: currentPage,
                attempt: batchAttempt + 1,
                status: errStatus,
                message: err instanceof Error ? err.message : String(err),
                errorType: isAuthError ? 'auth' : isTransient ? 'transient' : 'fatal',
                responseBody: (err as any)?.response ?? null,
                error: err,
              })
              if (batchAttempt < MAX_BATCH_RETRIES && (isAuthError || isTransient)) {
                if (isAuthError) {
                  setProgress((prev) => ({
                    ...prev,
                    currentBatch: currentPage,
                    totalBatches: totalBatches || prev.totalBatches,
                    status: 'processing',
                    error: `Renovando sessão e retentando lote ${currentPage} (tentativa ${batchAttempt + 2} de ${MAX_BATCH_RETRIES + 1})...`,
                  }))
                  const refreshed = await refreshAuthToken()
                  if (!refreshed) {
                    console.error('[Customer Export] Token refresh failed during retry', {
                      batch: currentPage,
                      attempt: batchAttempt + 1,
                    })
                    break
                  }
                } else {
                  const backoffDelay = 1000 * Math.pow(2, batchAttempt)
                  setProgress((prev) => ({
                    ...prev,
                    currentBatch: currentPage,
                    totalBatches: totalBatches || prev.totalBatches,
                    status: 'processing',
                    error: `Retentando lote ${currentPage} (tentativa ${batchAttempt + 2} de ${MAX_BATCH_RETRIES + 1})...`,
                  }))
                  await new Promise((resolve) => setTimeout(resolve, backoffDelay))
                }
              } else {
                break
              }
            }
          }

          if (lastBatchError) {
            const err = lastBatchError
            if (isSessionExpiredError(err)) {
              console.error('[Customer Export] Authentication failure after all retries:', {
                batch: currentPage,
                error: err,
                errorStatus: (err as any)?.status ?? 0,
                responseBody: (err as any)?.response ?? null,
              })
              retryStateRef.current = {
                lastBatch: currentPage,
                csvParts,
                totalRecords,
                totalBatches,
                filters,
              }
              await savePartialResults(csvParts, totalRecords, 'parcial')
              const processed = (currentPage - 1) * BATCH_SIZE
              const batchTotal = totalBatches || '?'
              const errorMsg = `Falha ao exportar lote ${currentPage} de ${batchTotal} após ${MAX_BATCH_RETRIES + 1} tentativas. Falha de autenticação: sua sessão expirou e não foi possível renová-la automaticamente. Faça logout e login novamente, depois retome a exportação.`
              setProgress({
                currentBatch: currentPage,
                totalBatches,
                processed,
                total: totalRecords,
                status: 'error',
                error: errorMsg,
                failedBatch: currentPage,
              })
              return {
                success: false,
                error: errorMsg,
              }
            }

            console.error('[Customer Export] All retries exhausted for batch:', {
              batch: currentPage,
              totalBatches: totalBatches || 'unknown',
              totalRecords,
              error: err,
              errorStatus: (err as any)?.status ?? 0,
              errorMessage: err instanceof Error ? err.message : String(err),
              responseBody: (err as any)?.response ?? null,
            })
            retryStateRef.current = {
              lastBatch: currentPage,
              csvParts,
              totalRecords,
              totalBatches,
              filters,
            }

            const errStatus = (err as any)?.status ?? 0
            const isTransient = errStatus === 0 || errStatus === 500
            const errDetail = err instanceof Error ? err.message : String(err)
            const reason = isTransient
              ? `Não foi possível completar a exportação após várias tentativas. Erro: ${errDetail} (status: ${errStatus}). Verifique sua conexão e tente novamente.`
              : err instanceof Error
                ? err.message
                : 'Não foi possível completar a exportação após várias tentativas. Tente novamente.'
            const processed = (currentPage - 1) * BATCH_SIZE
            const batchTotal = totalBatches || '?'
            setProgress({
              currentBatch: currentPage,
              totalBatches,
              processed,
              total: totalRecords,
              status: 'error',
              error: `Falha ao exportar lote ${currentPage} de ${batchTotal} após ${MAX_BATCH_RETRIES + 1} tentativas. ${reason}`,
              failedBatch: currentPage,
            })
            return {
              success: false,
              error: `Falha ao exportar lote ${currentPage} de ${batchTotal} após ${MAX_BATCH_RETRIES + 1} tentativas. ${reason}`,
            }
          }

          if (!batch) break

          totalRecords = batch.totalRecords
          totalBatches = batch.totalPages

          if (totalRecords === 0) {
            setProgress({
              currentBatch: 0,
              totalBatches: 0,
              processed: 0,
              total: 0,
              status: 'error',
              error: 'Nenhum lead encontrado para exportação.',
            })
            return { success: false, error: 'Nenhum lead encontrado para exportação.' }
          }

          if (batch.csvChunk) {
            csvParts.push(batch.csvChunk)
          }

          const processed = Math.min(currentPage * BATCH_SIZE, totalRecords)
          setProgress({
            currentBatch: currentPage,
            totalBatches,
            processed,
            total: totalRecords,
            status: 'processing',
          })

          if (!batch.hasMore) break
          currentPage++
        }

        const csvContent = 'phone,whatsapp_group_name,city,state\n' + csvParts.join('')
        const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
        await createExportRecord(csvContent, filename, totalRecords)

        setProgress({
          currentBatch: totalBatches,
          totalBatches,
          processed: totalRecords,
          total: totalRecords,
          status: 'done',
        })
        retryStateRef.current = null
        return { success: true }
      } finally {
        isExportingRef.current = false
        setIsExporting(false)
        endBackgroundOperation()
      }
    },
    [isSessionExpiredError, savePartialResults],
  )

  const exportLeads = useCallback(
    async (filters: ExportFilters): Promise<ExportResult> => {
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
      setIsExporting(true)
      startBackgroundOperation()
      retryStateRef.current = null
      setProgress({
        currentBatch: 1,
        totalBatches: 0,
        processed: 0,
        total: 0,
        status: 'processing',
      })

      const tokenValid = await ensureValidToken()
      if (!tokenValid) {
        retryStateRef.current = {
          lastBatch: 1,
          csvParts: [],
          totalRecords: 0,
          totalBatches: 0,
          filters,
        }
        setProgress({
          currentBatch: 0,
          totalBatches: 0,
          processed: 0,
          total: 0,
          status: 'error',
          error: 'Não foi possível validar sua sessão. Tente novamente em alguns instantes.',
          failedBatch: 1,
        })
        isExportingRef.current = false
        setIsExporting(false)
        endBackgroundOperation()
        return {
          success: false,
          error: 'Não foi possível validar sua sessão. Tente novamente em alguns instantes.',
        }
      }

      return runExport(filters, 1, [], 0, 0)
    },
    [runExport],
  )

  const retryExport = useCallback(async (): Promise<ExportResult> => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
    if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/admin/login') {
      return {
        success: false,
        error: 'Não é possível retomar a exportação na página de login.',
      }
    }
    if (isExportingRef.current) return { success: false }
    const state = retryStateRef.current
    if (!state) return { success: false, error: 'Nenhuma exportação para retomar.' }
    isExportingRef.current = true
    cancelRef.current = false
    setIsExporting(true)
    startBackgroundOperation()
    setProgress((prev) => ({ ...prev, status: 'processing', error: undefined }))

    const tokenValid = await ensureValidToken()
    if (!tokenValid) {
      setProgress((prev) => ({
        ...prev,
        status: 'error',
        error: 'Não foi possível renovar sua sessão. Tente novamente em alguns instantes.',
        failedBatch: prev.currentBatch || 1,
      }))
      isExportingRef.current = false
      setIsExporting(false)
      endBackgroundOperation()
      return {
        success: false,
        error: 'Não foi possível renovar sua sessão. Tente novamente em alguns instantes.',
      }
    }

    return runExport(
      state.filters,
      state.lastBatch,
      state.csvParts,
      state.totalRecords,
      state.totalBatches,
    )
  }, [runExport])

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
    retryStateRef.current = null
  }, [])

  const clearAllExportState = useCallback(() => {
    cancelRef.current = true
    retryStateRef.current = null
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
