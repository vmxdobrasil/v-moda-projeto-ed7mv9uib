import pb from '@/lib/pocketbase/client'

export interface DuplicateAnalysisResult {
  total: number
  newRecords: number
  duplicates: number
  duplicatePhones: string[]
}

export async function analyzeDuplicates(phones: string[]): Promise<DuplicateAnalysisResult> {
  return pb.send('/backend/v1/customers/analyze-duplicates', {
    method: 'POST',
    body: JSON.stringify({ phones }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export interface ReimportCheckResult {
  isReimport: boolean
  previousImport?: {
    id: string
    filename: string
    status: string
    created: string
  }
}

export async function checkReimport(filename: string): Promise<ReimportCheckResult> {
  return pb.send('/backend/v1/import/check-reimport', {
    method: 'POST',
    body: JSON.stringify({ filename }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function normalizePhoneBR(val: string): string {
  let digits = (val || '').replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits
  }
  if (digits.startsWith('55') && digits.length === 12) {
    const ddd = digits.substring(2, 4)
    const num = digits.substring(4)
    digits = '55' + ddd + '9' + num
  }
  return digits
}
