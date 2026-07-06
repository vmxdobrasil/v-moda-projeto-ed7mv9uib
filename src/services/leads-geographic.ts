import pb from '@/lib/pocketbase/client'
import { extractDDD } from '@/lib/brazil-geo'

export interface GeoStats {
  totalLeads: number
  totalRetailerLeads: number
  byRegion: Array<{ region: string; count: number }>
  byDdd: Array<{ ddd: string; count: number }>
  byState: Array<{ state: string; count: number }>
  topCities: Array<{ city: string; state: string; count: number }>
}

export interface LeadFilters {
  search?: string
  ddd?: string
  state?: string
  city?: string
  status?: string
}

export async function getGeoStats(): Promise<GeoStats> {
  return pb.send('/backend/v1/leads/geo-stats', { method: 'GET' })
}

export async function getLeadsPaginated(page: number, perPage: number, filters: LeadFilters) {
  const parts: string[] = []
  if (filters.search) {
    parts.push(
      `(name ~ "${filters.search}" || phone ~ "${filters.search}" || city ~ "${filters.search}")`,
    )
  }
  if (filters.ddd) parts.push(`ddd = "${filters.ddd}"`)
  if (filters.state) parts.push(`state = "${filters.state}"`)
  if (filters.city) parts.push(`city = "${filters.city}"`)
  if (filters.status && filters.status !== 'all') parts.push(`status = "${filters.status}"`)
  return pb.collection('customers').getList(page, perPage, {
    filter: parts.join(' && '),
    sort: '-created',
  })
}

export async function exportLeads(
  filters: LeadFilters,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const all: any[] = []
  let page = 1
  const perPage = 500
  let total = 0
  do {
    const res = await getLeadsPaginated(page, perPage, filters)
    all.push(...res.items)
    total = res.totalItems
    onProgress?.(all.length, total)
    page++
  } while (all.length < total && page < 200)

  const headers = ['Nome', 'Telefone', 'DDD', 'Cidade', 'Estado', 'Status', 'Email', 'Origem']
  const rows = all.map((r) => [
    r.name || '',
    r.phone || '',
    r.ddd || extractDDD(r.phone || ''),
    r.city || '',
    r.state || '',
    r.status || '',
    r.email || '',
    r.source || '',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function bulkUpdateLeadStatus(ids: string[], status: string): Promise<void> {
  for (const id of ids) {
    await pb.collection('customers').update(id, { status })
  }
}
