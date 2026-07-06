import pb from '@/lib/pocketbase/client'

export interface CrmMetrics {
  valoresGanhos: { current: number; previous: number; variation: number }
  novosClientes: { current: number; previous: number; variation: number }
  tarefasConcluidas: { current: number; previous: number; variation: number }
}

export interface FunnelStage {
  key: string
  label: string
  count: number
  totalValue: number
  weightedValue: number
}

export interface Interaction {
  id: string
  title: string
  subtitle: string
  message: string
  source: string
  created: string
}

export interface UnifiedLead {
  id: string
  empresa: string
  contato: string
  email: string
  segmento: string
  origem: string
  status: string
  statusLabel: string
  data: string
  collection: string
}

function calcVariation(c: number, p: number): number {
  if (p === 0) return c > 0 ? 100 : 0
  return Math.round(((c - p) / p) * 100)
}

function monthRange(offset: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59)
  return { start: start.toISOString(), end: end.toISOString() }
}

export async function fetchCrmMetrics(): Promise<CrmMetrics> {
  const cur = monthRange(0)
  const prev = monthRange(1)
  const [pNow, pPrev, cNow, cPrev, lNow, lPrev, rNow, rPrev] = await Promise.all([
    pb
      .collection('orders')
      .getFullList({
        filter: `status = 'paid' && created >= "${cur.start}" && created <= "${cur.end}"`,
      })
      .catch(() => []),
    pb
      .collection('orders')
      .getFullList({
        filter: `status = 'paid' && created >= "${prev.start}" && created <= "${prev.end}"`,
      })
      .catch(() => []),
    pb
      .collection('customers')
      .getList(1, 1, { filter: `created >= "${cur.start}"` })
      .catch(() => ({ totalItems: 0 })),
    pb
      .collection('customers')
      .getList(1, 1, { filter: `created >= "${prev.start}" && created <= "${prev.end}"` })
      .catch(() => ({ totalItems: 0 })),
    pb
      .collection('leads_venda')
      .getList(1, 1, {
        filter: `(status = 'converted' || status = 'closed') && created >= "${cur.start}"`,
      })
      .catch(() => ({ totalItems: 0 })),
    pb
      .collection('leads_venda')
      .getList(1, 1, {
        filter: `(status = 'converted' || status = 'closed') && created >= "${prev.start}" && created <= "${prev.end}"`,
      })
      .catch(() => ({ totalItems: 0 })),
    pb
      .collection('leads_retailers')
      .getList(1, 1, { filter: `status = 'approved' && created >= "${cur.start}"` })
      .catch(() => ({ totalItems: 0 })),
    pb
      .collection('leads_retailers')
      .getList(1, 1, {
        filter: `status = 'approved' && created >= "${prev.start}" && created <= "${prev.end}"`,
      })
      .catch(() => ({ totalItems: 0 })),
  ])
  const vN = (pNow as any[]).reduce((s, o) => s + (o.total_amount || 0), 0)
  const vP = (pPrev as any[]).reduce((s, o) => s + (o.total_amount || 0), 0)
  const tN = ((lNow as any).totalItems || 0) + ((rNow as any).totalItems || 0)
  const tP = ((lPrev as any).totalItems || 0) + ((rPrev as any).totalItems || 0)
  return {
    valoresGanhos: { current: vN, previous: vP, variation: calcVariation(vN, vP) },
    novosClientes: {
      current: (cNow as any).totalItems || 0,
      previous: (cPrev as any).totalItems || 0,
      variation: calcVariation((cNow as any).totalItems || 0, (cPrev as any).totalItems || 0),
    },
    tarefasConcluidas: { current: tN, previous: tP, variation: calcVariation(tN, tP) },
  }
}

export async function fetchFunnelData(): Promise<FunnelStage[]> {
  const [qual, prop, negoc] = await Promise.all([
    pb
      .collection('customers')
      .getFullList({ filter: "status = 'lead' || status = 'qualified' || status = 'new'" })
      .catch(() => []),
    pb
      .collection('customers')
      .getFullList({ filter: "status = 'proposal'" })
      .catch(() => []),
    pb
      .collection('customers')
      .getFullList({ filter: "status = 'negotiation' || status = 'negotiating'" })
      .catch(() => []),
  ])
  const qA = qual as any[],
    pA = prop as any[],
    nA = negoc as any[]
  const qV = qA.reduce((s, c) => s + (c.estimated_value || 0), 0)
  const pV = pA.reduce((s, c) => s + (c.estimated_value || 0), 0)
  const nV = nA.reduce((s, c) => s + (c.estimated_value || 0), 0)
  return [
    {
      key: 'qual',
      label: 'Qualificação',
      count: qA.length,
      totalValue: qV,
      weightedValue: qV * 0.2,
    },
    {
      key: 'prop',
      label: 'Proposta de Valor',
      count: pA.length,
      totalValue: pV,
      weightedValue: pV * 0.5,
    },
    {
      key: 'neg',
      label: 'Negociação',
      count: nA.length,
      totalValue: nV,
      weightedValue: nV * 0.8,
    },
  ]
}

export async function fetchInteractions(): Promise<Interaction[]> {
  const [leads, customers] = await Promise.all([
    pb
      .collection('leads_venda')
      .getList(1, 3, { sort: '-created', expand: 'brand,retailer' })
      .catch(() => ({ items: [] })),
    pb
      .collection('customers')
      .getList(1, 3, { sort: '-created' })
      .catch(() => ({ items: [] })),
  ])
  const li = ((leads as any).items || []).map((l: any) => ({
    id: l.id,
    title: l.expand?.brand?.name || 'Lead',
    subtitle: 'leads_venda',
    message: l.message || 'Sem mensagem',
    source: 'leads_venda',
    created: l.created,
  }))
  const ci = ((customers as any).items || []).map((c: any) => ({
    id: c.id,
    title: c.name,
    subtitle: 'customers',
    message: c.notes || c.bio || 'Sem notas',
    source: 'customers',
    created: c.created,
  }))
  return [...li, ...ci]
}

export async function fetchUnifiedLeads(
  perPage = 100,
): Promise<{ items: UnifiedLead[]; totalItems: number }> {
  const SM: Record<string, string> = {
    pending: 'Novo',
    contacted: 'Em Negociação',
    converted: 'Convertido',
    approved: 'Convertido',
    closed: 'Convertido',
    rejected: 'Recusado',
  }
  const [ret, fab, ven] = await Promise.all([
    pb
      .collection('leads_retailers')
      .getList(1, perPage, { sort: '-created' })
      .catch(() => ({ items: [], totalItems: 0 })),
    pb
      .collection('leads_fabricantes')
      .getList(1, perPage, { sort: '-created' })
      .catch(() => ({ items: [], totalItems: 0 })),
    pb
      .collection('leads_venda')
      .getList(1, perPage, { sort: '-created', expand: 'retailer,brand,manufacturer' })
      .catch(() => ({ items: [], totalItems: 0 })),
  ])
  const r = ((ret as any).items || []).map((l: any) => ({
    id: l.id,
    empresa: l.store_name,
    contato: l.contact_name,
    email: l.email || '',
    segmento: l.fashion_hub || '',
    origem: l.utm_source || 'retail',
    status: l.status,
    statusLabel: SM[l.status] || l.status,
    data: l.created,
    collection: 'leads_retailers',
  }))
  const f = ((fab as any).items || []).map((l: any) => ({
    id: l.id,
    empresa: l.name,
    contato: l.whatsapp,
    email: l.email || '',
    segmento: l.category || '',
    origem: l.utm_source || 'fabricante',
    status: l.status,
    statusLabel: SM[l.status] || l.status,
    data: l.created,
    collection: 'leads_fabricantes',
  }))
  const v = ((ven as any).items || []).map((l: any) => ({
    id: l.id,
    empresa: l.expand?.brand?.name || l.expand?.retailer?.name || 'N/A',
    contato: l.expand?.retailer?.phone || '',
    email: l.expand?.retailer?.email || '',
    segmento: 'venda',
    origem: 'leads_venda',
    status: l.status,
    statusLabel: SM[l.status] || l.status,
    data: l.created,
    collection: 'leads_venda',
  }))
  const totalItems =
    ((ret as any).totalItems || 0) + ((fab as any).totalItems || 0) + ((ven as any).totalItems || 0)
  return {
    items: [...r, ...f, ...v].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    ),
    totalItems,
  }
}
