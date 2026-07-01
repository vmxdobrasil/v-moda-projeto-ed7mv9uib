import pb from '@/lib/pocketbase/client'

export interface CampanhaMarketing {
  id: string
  name: string
  source?: string
  medium?: string
  campaign?: string
  url?: string
  clicks: number
  conversions: number
  created: string
  updated: string
}

export const getCampanhas = () =>
  pb.collection('campanhas_marketing').getFullList<CampanhaMarketing>({ sort: '-created' })

export const createCampanha = (data: Partial<CampanhaMarketing>) =>
  pb.collection('campanhas_marketing').create<CampanhaMarketing>(data)

export const updateCampanha = (id: string, data: Partial<CampanhaMarketing>) =>
  pb.collection('campanhas_marketing').update<CampanhaMarketing>(id, data)

export const deleteCampanha = (id: string) => pb.collection('campanhas_marketing').delete(id)

export const trackCampaignClick = async (source: string) => {
  if (!source) return
  try {
    const campanha = await pb
      .collection('campanhas_marketing')
      .getFirstListItem<CampanhaMarketing>(`source = "${source}"`)
    await pb.collection('campanhas_marketing').update(campanha.id, {
      clicks: (campanha.clicks || 0) + 1,
    })
  } catch {
    // Campaign not found — silently skip
  }
}
