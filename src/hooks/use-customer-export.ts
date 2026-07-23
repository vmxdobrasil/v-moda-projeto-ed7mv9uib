import { useState, useRef, useCallback } from 'react'
import { exportCustomersBatch, createExportRecord } from '@/services/exports'

export interface ExportFilters {
  search: string
  status: string
  shippingMethod: string
  categoryId: string
  inactivityDays: string
}

export interface ExportProgress {
  processed: number
  total: number
  status: 'idle' | 'processing' | 'done' | 'error'
  error?: string
}

export interface ExportResult {
  success: boolean
  error?: string
}

const BATCH_SIZE = 500

export function useCustomerExport() {
  const [progress, setProgress] = useState<ExportProgress>({
    processed: 0,
    total: 0,
    status: 'idle',
  })
  const isExportingRef = useRef(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportLeads = useCallback(async (filters: ExportFilters): Promise<ExportResult> => {
    if (isExportingRef.current) return { success: false }
    isExportingRef.current = true
    setIsExporting(true)
    setProgress({ processed: 0, total: 0, status: 'processing' })

    let currentPage = 1
    let totalRecords = 0
    let totalPages = 0

    try {
      const csvParts: string[] = []

      while (true) {
        const batch = await exportCustomersBatch({
          page: currentPage,
          perPage: BATCH_SIZE,
          search: filters.search,
          status: filters.status,
          shippingMethod: filters.shippingMethod,
          categoryId: filters.categoryId,
          inactivityDays: filters.inactivityDays,
        })

        totalRecords = batch.totalRecords
        totalPages = batch.totalPages

        if (totalRecords === 0) {
          setProgress({
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
        setProgress({ processed, total: totalRecords, status: 'processing' })

        if (!batch.hasMore) break
        currentPage++
      }

      const csvContent = 'phone,whatsapp_group_name,city,state\n' + csvParts.join('')
      const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
      await createExportRecord(csvContent, filename, totalRecords)

      setProgress({
        processed: totalRecords,
        total: totalRecords,
        status: 'done',
      })
      return { success: true }
    } catch (err: any) {
      const batchNum = currentPage
      const totalBatches = totalPages || 0
      const processedBefore = (currentPage - 1) * BATCH_SIZE
      const errorMsg = err?.message || 'tempo limite excedido'
      const fullError = `Erro ao exportar lote ${batchNum} de ${totalBatches}: ${errorMsg}. Tente novamente.`
      setProgress({
        processed: processedBefore,
        total: totalRecords,
        status: 'error',
        error: fullError,
      })
      return { success: false, error: fullError }
    } finally {
      isExportingRef.current = false
      setIsExporting(false)
    }
  }, [])

  const resetProgress = useCallback(() => {
    setProgress({ processed: 0, total: 0, status: 'idle' })
  }, [])

  return { progress, exportLeads, isExporting, resetProgress }
}
