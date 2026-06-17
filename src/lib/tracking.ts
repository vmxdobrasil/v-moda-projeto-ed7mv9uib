import pb from '@/lib/pocketbase/client'

export async function trackEvent(
  actionType:
    | 'view_product'
    | 'add_to_favorites'
    | 'search_term'
    | 'abandoned_cart'
    | 'calculator_use'
    | 'checkout_start',
  metadata: Record<string, any> = {},
  isBeacon = false,
) {
  try {
    if (!pb.authStore.isValid || !pb.authStore.record) return

    const payload = {
      user: pb.authStore.record.id,
      action_type: actionType,
      metadata,
      path: window.location.pathname,
      device_info: {
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        language: navigator.language,
      },
    }

    if (isBeacon && navigator.sendBeacon) {
      // Browsers restrict cross-origin beacons without proper headers,
      // and pocketbase client requires Auth token headers.
      // So we fallback to standard fetch/SDK call which might be canceled.
    }

    await pb.collection('user_behavior_logs').create(payload)
  } catch (err) {
    console.error('Failed to track behavior event', err)
  }
}
