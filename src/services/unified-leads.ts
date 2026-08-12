import pb from '@/lib/pocketbase/client'

export type LeadCollection = 'leads_venda' | 'leads_fabricantes' | 'leads_retailers'

export interface UnifiedLead {
  id: string
  collection: LeadCollection
  name: string
  phone: string
  email: string
  source: string
  status: string
  created: string
  notes?: string
  raw: any
}

const FIELD_MAP: Record<LeadCollection, { name: string; phone: string; source: string }> = {
  leads_venda: { name: '', phone: '', source: '' },
  leads_fabricantes: { name: 'name', phone: 'whatsapp', source: 'utm_source' },
  leads_retailers: { name: 'store_name', phone: 'phone', source: 'utm_source' },
}

export function normalizeLead(record: any, collection: LeadCollection): UnifiedLead {
  const f = FIELD_MAP[collection]
  if (collection === 'leads_venda') {
    const exp = record.expand || {}
    return {
      id: record.id,
      collection,
      name: exp.retailer?.name || exp.manufacturer?.brand_name || exp.brand?.name || 'Lead Venda',
      phone: exp.retailer?.phone || '',
      email: exp.retailer?.email || '',
      source: '',
      status: record.status || '',
      created: record.created || '',
      notes: record.notes || '',
      raw: record,
    }
  }
  return {
    id: record.id,
    collection,
    name: record[f.name] || 'Sem Nome',
    phone: record[f.phone] || '',
    email: record.email || '',
    source: record[f.source] || '',
    status: record.status || '',
    created: record.created || '',
    notes: record.notes || '',
    raw: record,
  }
}

export async function fetchLeads(
  collection: LeadCollection | 'all',
  page: number,
  perPage: number,
  filters: { search?: string; status?: string; source?: string },
): Promise<{ items: UnifiedLead[]; totalItems: number; totalPages: number }> {
  if (collection === 'all') {
    const results = await Promise.allSettled([
      fetchSingle('leads_venda', 1, 100, filters),
      fetchSingle('leads_fabricantes', 1, 100, filters),
      fetchSingle('leads_retailers', 1, 100, filters),
    ])
    const all: UnifiedLead[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') {
        all.push(...r.value.items)
      }
    }
    all.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    const start = (page - 1) * perPage
    return {
      items: all.slice(start, start + perPage),
      totalItems: all.length,
      totalPages: Math.ceil(all.length / perPage),
    }
  }
  return fetchSingle(collection, page, perPage, filters)
}

async function fetchSingle(
  collection: LeadCollection,
  page: number,
  perPage: number,
  filters: { search?: string; status?: string; source?: string },
): Promise<{ items: UnifiedLead[]; totalItems: number; totalPages: number }> {
  const parts: string[] = []
  const f = FIELD_MAP[collection]
  if (filters.search) {
    const s = filters.search
    const fields = [f.name, f.phone, 'email'].filter(Boolean)
    if (fields.length > 0) {
      parts.push(`(${fields.map((fld) => `${fld} ~ "${s}"`).join(' || ')})`)
    }
  }
  if (filters.status && filters.status !== 'all') {
    parts.push(`status = "${filters.status}"`)
  }
  if (filters.source && filters.source !== 'all' && f.source) {
    parts.push(`${f.source} = "${filters.source}"`)
  }
  const expand = collection === 'leads_venda' ? 'retailer,manufacturer,brand' : undefined
  const result = await pb.collection(collection).getList(page, perPage, {
    filter: parts.join(' && '),
    sort: '-created',
    ...(expand ? { expand } : {}),
  })
  return {
    items: result.items.map((r) => normalizeLead(r, collection)),
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  }
}

export async function getLead(collection: LeadCollection, id: string) {
  const expand = collection === 'leads_venda' ? 'retailer,manufacturer,brand' : undefined
  const record = await pb.collection(collection).getOne(id, expand ? { expand } : undefined)
  return { record, normalized: normalizeLead(record, collection) }
}

export async function updateLeadStatus(collection: LeadCollection, id: string, status: string) {
  return pb.collection(collection).update(id, { status })
}

export async function updateLeadNotes(collection: LeadCollection, id: string, notes: string) {
  return pb.collection(collection).update(id, { notes })
}
