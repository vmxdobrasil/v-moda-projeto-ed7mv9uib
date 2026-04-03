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
    let success = 0,
      skipped = 0,
      errorCount = 0

    try {
      const manufacturerId = pb.authStore.record?.id
      const existing = await pb.collection('customers').getFullList({
        fields: 'phone,email',
        filter: `manufacturer = '${manufacturerId}'`,
      })

      const normalizePhone = (p: string) => (p ? p.replace(/\D/g, '') : '')
      const phones = new Set(existing.map((c) => normalizePhone(c.phone)).filter(Boolean))
      const emails = new Set(existing.map((c) => c.email).filter(Boolean))

      const BATCH_SIZE = 50
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)
        await Promise.all(
          batch.map(async (row) => {
            const name = row[mapping.name]
            const rawPhone = row[mapping.phone]
            const phone = normalizePhone(rawPhone)
            const email = mapping.email ? row[mapping.email] : undefined

            if (!name || !phone) {
              errorCount++
              return
            }
            if (phones.has(phone) || (email && emails.has(email))) {
              skipped++
              return
            }

            try {
              await pb.collection('customers').create(
                {
                  name,
                  phone: rawPhone,
                  email,
                  source: mapping.source && row[mapping.source] ? row[mapping.source] : 'manual',
                  exclusivity_zone: mapping.exclusivity_zone ? row[mapping.exclusivity_zone] : '',
                  ranking_category: mapping.ranking_category ? row[mapping.ranking_category] : '',
                  status: 'new',
                  manufacturer: manufacturerId,
                },
                { requestKey: null },
              )
              phones.add(phone)
              if (email) emails.add(email)
              success++
            } catch (err) {
              errorCount++
            }
          }),
        )
        setProgress(Math.min(100, Math.round(((i + BATCH_SIZE) / rows.length) * 100)))
        await new Promise((r) => setTimeout(r, 10)) // yield to UI thread
      }
    } catch (err) {
      console.error('Bulk import error', err)
    } finally {
      setProgress(100)
      setIsImporting(false)
      setStats({ success, skipped, error: errorCount })
    }
  }

  return { progress, isImporting, stats, startImport }
}
