import { useState, useRef, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { ClientResponseError } from 'pocketbase'
import { exportCustomersBatch, createExportRecord } from '@/services/exports'

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

          setProgress((prev) => ({
            ...prev,
            currentBatch: currentPage,
            totalBatches: totalBatches || prev.totalBatches,
            status: 'processing',
            error: undefined,
          }))

          let batch
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
          } catch (err: unknown) {
            if (isSessionExpiredError(err)) {
              retryStateRef.current = null
              await savePartialResults(csvParts, totalRecords, 'parcial')
              const processed = (currentPage - 1) * BATCH_SIZE
              setProgress({
                currentBatch: currentPage,
                totalBatches,
                processed,
                total: totalRecords,
                status: 'session_expired',
                error: 'Sua sessão expirou. Faça login novamente para continuar a exportação.',
              })
              return {
                success: false,
                error: 'Sua sessão expirou. Faça login novamente para continuar a exportação.',
                sessionExpired: true,
              }
            }

            retryStateRef.current = {
              lastBatch: currentPage,
              csvParts,
              totalRecords,
              totalBatches,
              filters,
            }

            const errStatus = (err as any)?.status ?? 0
            const isTransient = errStatus === 0 || errStatus === 500
            const reason = isTransient
              ? 'Não foi possível completar a exportação. Verifique sua conexão e tente novamente.'
              : err instanceof Error
                ? err.message
                : 'Não foi possível completar a exportação. Tente novamente.'
            const processed = (currentPage - 1) * BATCH_SIZE
            const batchTotal = totalBatches || '?'
            setProgress({
              currentBatch: currentPage,
              totalBatches,
              processed,
              total: totalRecords,
              status: 'error',
              error: `Falha ao exportar lote ${currentPage} de ${batchTotal}. ${reason}`,
              failedBatch: currentPage,
            })
            return {
              success: false,
              error: `Falha ao exportar lote ${currentPage} de ${batchTotal}. ${reason}`,
            }
          }

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
      }
    },
    [isSessionExpiredError, savePartialResults],
  )

  const exportLeads = useCallback(
    async (filters: ExportFilters): Promise<ExportResult> => {
      if (!pb.authStore.isValid || !pb.authStore.record) {
        setProgress({
          currentBatch: 0,
          totalBatches: 0,
          processed: 0,
          total: 0,
          status: 'session_expired',
          error: 'Sua sessão expirou. Faça login novamente para continuar.',
        })
        return {
          success: false,
          error: 'Sua sessão expirou. Faça login novamente para continuar.',
          sessionExpired: true,
        }
      }
      if (isExportingRef.current) return { success: false }
      isExportingRef.current = true
      cancelRef.current = false
      setIsExporting(true)
      retryStateRef.current = null
      setProgress({
        currentBatch: 1,
        totalBatches: 0,
        processed: 0,
        total: 0,
        status: 'processing',
      })
      return runExport(filters, 1, [], 0, 0)
    },
    [runExport],
  )

  const retryExport = useCallback(async (): Promise<ExportResult> => {
    if (!pb.authStore.isValid || !pb.authStore.record) {
      setProgress({
        currentBatch: 0,
        totalBatches: 0,
        processed: 0,
        total: 0,
        status: 'session_expired',
        error: 'Sua sessão expirou. Faça login novamente para continuar.',
      })
      return {
        success: false,
        error: 'Sua sessão expirou. Faça login novamente para continuar.',
        sessionExpired: true,
      }
    }
    if (isExportingRef.current) return { success: false }
    const state = retryStateRef.current
    if (!state) return { success: false, error: 'Nenhuma exportação para retomar.' }
    isExportingRef.current = true
    cancelRef.current = false
    setIsExporting(true)
    setProgress((prev) => ({ ...prev, status: 'processing', error: undefined }))
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

  return { progress, exportLeads, retryExport, cancelExport, isExporting, resetProgress }
}
