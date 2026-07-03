import pb from '@/lib/pocketbase/client'

export interface ExclusivePartner {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  exclusivity_zone: string
  manufacturer: string
}

export interface CepInfo {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

export async function lookupCep(cep: string): Promise<CepInfo> {
  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length !== 8) throw new Error('CEP inválido')
  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
  if (!response.ok) throw new Error('CEP não encontrado')
  const data = await response.json()
  if (data.erro) throw new Error('CEP não encontrado')
  return data as CepInfo
}

export async function findExclusivePartners(
  cepInfo: CepInfo,
  manufacturerIds: string[],
): Promise<ExclusivePartner[]> {
  if (manufacturerIds.length === 0) return []
  const mfrFilter = manufacturerIds.map((id) => `manufacturer = "${id}"`).join(' || ')
  try {
    const records = await pb.collection('customers').getFullList({
      filter: `is_exclusive = true && (${mfrFilter})`,
    })
    const city = (cepInfo.localidade || '').toLowerCase()
    const state = (cepInfo.uf || '').toLowerCase()
    return records.filter((r) => {
      const zone = (r.exclusivity_zone || '').toLowerCase()
      return zone.includes(city) || zone.includes(state) || city.includes(zone)
    }) as unknown as ExclusivePartner[]
  } catch {
    return []
  }
}

export function getGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
