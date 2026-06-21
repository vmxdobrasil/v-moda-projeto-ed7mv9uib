import { create } from 'zustand'
import pb from '@/lib/pocketbase/client'

export interface PriceAdjustment {
  id: string
  project: string
  customer: string
  is_zone_wide: boolean
  adjusted_price: number
}

interface PricingStore {
  adjustments: Record<string, PriceAdjustment[]>
  loadedMerchantId: string | null
  loadAdjustments: (merchantId: string) => Promise<void>
  getPrice: (
    projectId: string,
    wholesalePrice: number,
    customerId?: string,
    customerZone?: string,
  ) => number
}

export const usePricingStore = create<PricingStore>((set, get) => ({
  adjustments: {},
  loadedMerchantId: null,
  loadAdjustments: async (merchantId) => {
    if (get().loadedMerchantId === merchantId) return
    try {
      const records = await pb.collection('price_adjustments').getFullList<PriceAdjustment>({
        filter: `merchant = "${merchantId}"`,
      })
      const grouped: Record<string, PriceAdjustment[]> = {}
      records.forEach((r) => {
        if (!grouped[r.project]) grouped[r.project] = []
        grouped[r.project].push(r)
      })
      set({ adjustments: grouped, loadedMerchantId: merchantId })
    } catch (err) {
      console.error('Failed to load price adjustments', err)
    }
  },
  getPrice: (projectId, wholesalePrice, customerId, customerZone) => {
    const baseRetail = wholesalePrice ? wholesalePrice * 2.2 : 0
    const adjs = get().adjustments[projectId]

    if (!adjs || adjs.length === 0) return baseRetail

    if (customerId) {
      const custAdj = adjs.find((a) => a.customer === customerId)
      if (custAdj) return custAdj.adjusted_price
    }

    if (customerZone) {
      const zoneAdj = adjs.find((a) => a.is_zone_wide)
      if (zoneAdj) return zoneAdj.adjusted_price
    }

    const allAdj = adjs.find((a) => !a.customer && !a.is_zone_wide)
    if (allAdj) return allAdj.adjusted_price

    return baseRetail
  },
}))
