import pb from '@/lib/pocketbase/client'

export interface VClubCard {
  id: string
  card_number: string
  expiration_date: string
  status: 'active' | 'blocked' | 'canceled'
  physical_status: string
  credit_limit: number
  available_limit: number
  sequential_id: number
  customer: string
  store: string
  expand?: { customer?: any; store?: any }
  created: string
  updated: string
}

export interface VClubCashback {
  id: string
  balance: number
  customer: string
  store: string
  expand?: { customer?: any; store?: any }
  created: string
  updated: string
}

export const getVClubCards = async () =>
  pb.collection('v_club_cards').getFullList<VClubCard>({
    sort: '-created',
    expand: 'customer,store',
  })

export const getVClubCashback = async () =>
  pb.collection('v_club_cashback').getFullList<VClubCashback>({
    sort: '-created',
    expand: 'customer,store',
  })

export const updateVClubCard = async (id: string, data: Partial<VClubCard>) =>
  pb.collection('v_club_cards').update(id, data)
