export type CategoryFilter =
  | 'all'
  | 'orders'
  | 'leads'
  | 'customers'
  | 'commissions'
  | 'cargas'
  | 'projects'
export type ReadFilter = 'all' | 'unread' | 'read'
export type SortOrder = 'newest' | 'oldest'

export function deriveCategory(title: string, message: string): string {
  const text = (title + ' ' + message).toLowerCase()
  if (text.includes('pedido')) return 'orders'
  if (text.includes('lead')) return 'leads'
  if (text.includes('cliente') || text.includes('customer')) return 'customers'
  if (text.includes('comiss')) return 'commissions'
  if (text.includes('carga')) return 'cargas'
  if (text.includes('produto') || text.includes('project')) return 'projects'
  return 'other'
}

export const CATEGORY_LABELS: Record<string, string> = {
  orders: 'Pedidos',
  leads: 'Leads',
  customers: 'Clientes',
  commissions: 'Comissões',
  cargas: 'Cargas',
  projects: 'Produtos',
  other: 'Outros',
}
