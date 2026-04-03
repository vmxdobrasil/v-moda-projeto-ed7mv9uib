import { useState } from 'react'
import pb from '@/lib/pocketbase/client'

export type ImportStats = { success: number; skipped: number; error: number }

export function useBulkImport() {
  const [progress, setProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [stats, setStats] = useState<ImportStats | null>(null)

  const startImport = async (rows: any[], mapping: Record<string, string>) => {
    setIsImporting(true)
    setProgress(0)
    setStats(null)

    let totalSuccess = 0
    let totalSkipped = 0
    let totalError = 0

    try {
      const BATCH_SIZE = 2000

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)

        const mappedRecords = batch.map((row) => ({
          name: row[mapping.name],
          phone: row[mapping.phone],
          email: mapping.email ? row[mapping.email] : undefined,
          source: mapping.source && row[mapping.source] ? row[mapping.source] : 'manual',
          exclusivity_zone:
            mapping.exclusivity_zone && row[mapping.exclusivity_zone]
              ? row[mapping.exclusivity_zone]
              : '',
          ranking_category:
            mapping.ranking_category && row[mapping.ranking_category]
              ? row[mapping.ranking_category]
              : '',
        }))

        try {
          const res = await pb.send('/backend/v1/customers/bulk-import', {
            method: 'POST',
            body: JSON.stringify({ records: mappedRecords }),
            headers: { 'Content-Type': 'application/json' },
          })

          totalSuccess += res.success || 0
          totalSkipped += res.skipped || 0
          totalError += res.error || 0
        } catch (err) {
          console.error('Batch error', err)
          totalError += batch.length
        }

        setProgress(Math.min(100, Math.round(((i + BATCH_SIZE) / rows.length) * 100)))
        await new Promise((r) => setTimeout(r, 50)) // yield to UI thread
      }
    } catch (err) {
      console.error('Bulk import error', err)
    } finally {
      setProgress(100)
      setIsImporting(false)
      setStats({ success: totalSuccess, skipped: totalSkipped, error: totalError })
    }
  }

  return { progress, isImporting, stats, startImport }
}
