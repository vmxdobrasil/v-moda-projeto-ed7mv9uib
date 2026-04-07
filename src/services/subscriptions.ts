import pb from '@/lib/pocketbase/client'

export interface Subscription {
  id: string
  user: string
  plan_tier: 'free' | 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'past_due' | 'canceled'
  next_billing_date: string
  import_limit?: number
  created: string
  updated: string
}

export const getMySubscription = async () => {
  try {
    const records = await pb.collection('subscriptions').getFullList<Subscription>({
      filter: `user = "${pb.authStore.record?.id}"`,
      limit: 1,
    })
    return records[0] || null
  } catch {
    return null
  }
}

export const updateMySubscription = async (id: string, plan_tier: Subscription['plan_tier']) => {
  return pb.collection('subscriptions').update<Subscription>(id, { plan_tier, status: 'active' })
}

export const createMySubscription = async (plan_tier: Subscription['plan_tier']) => {
  return pb.collection('subscriptions').create<Subscription>({
    user: pb.authStore.record?.id,
    plan_tier,
    status: 'active',
  })
}
