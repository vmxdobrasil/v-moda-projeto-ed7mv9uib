import pb from '@/lib/pocketbase/client'

export interface CepInfo {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

export interface ExclusivePartner {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  exclusivity_zone: string
  is_exclusive: boolean
}

export async function lookupCep(cep: string): Promise<CepInfo | null> {
  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    const data = await res.json()
    if (data.erro) return null
    return data as CepInfo
  } catch {
    return null
  }
}

export async function findExclusivePartners(
  city?: string,
  state?: string,
): Promise<ExclusivePartner[]> {
  const filters: string[] = ['is_exclusive = true']
  if (city) filters.push(`city ~ "${city}"`)
  if (state) filters.push(`state ~ "${state}"`)

  try {
    const records = await pb.collection('customers').getFullList({
      filter: filters.join(' && '),
    })
    return records as unknown as ExclusivePartner[]
  } catch {
    return []
  }
}

export async function checkExclusivity(
  cep: string,
): Promise<{ partner: ExclusivePartner | null; cepInfo: CepInfo | null }> {
  const cepInfo = await lookupCep(cep)
  if (!cepInfo) return { partner: null, cepInfo: null }

  const partners = await findExclusivePartners(cepInfo.localidade, cepInfo.uf)
  return { partner: partners[0] || null, cepInfo }
}
