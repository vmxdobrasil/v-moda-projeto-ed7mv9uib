import pb from '@/lib/pocketbase/client'

export type TrackingActionType =
  | 'view_product'
  | 'add_to_favorites'
  | 'search_term'
  | 'abandoned_cart'
  | 'calculator_use'
  | 'checkout_start'

/**
 * Centralized utility to track user behavior asynchronously without blocking the UI.
 * Integrates with PocketBase 'user_behavior_logs' collection.
 *
 * @param action_type The type of action performed by the user.
 * @param metadata Additional contextual data regarding the action.
 * @param isUnloading Flag to use fetch with keepalive when the page is unloading.
 */
export const trackEvent = (
  action_type: TrackingActionType,
  metadata: Record<string, any> = {},
  isUnloading: boolean = false,
) => {
  // Execute asynchronously to preserve main thread performance (Lighthouse)
  setTimeout(() => {
    try {
      const device_info = {
        userAgent: navigator.userAgent,
        screenWidth: window.screen?.width,
        screenHeight: window.screen?.height,
        language: navigator.language,
      }

      const path = window.location.pathname + window.location.search

      const data: Record<string, any> = {
        action_type,
        metadata,
        path,
        device_info,
      }

      // Automatically attach user if authenticated
      if (pb.authStore.isValid && pb.authStore.record?.id) {
        data.user = pb.authStore.record.id
      }

      if (isUnloading) {
        // Use raw fetch with keepalive to ensure request fires during page teardown
        fetch(`${import.meta.env.VITE_POCKETBASE_URL}/api/collections/user_behavior_logs/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(pb.authStore.token ? { Authorization: pb.authStore.token } : {}),
          },
          body: JSON.stringify(data),
          keepalive: true,
        }).catch(() => {})
      } else {
        // Standard non-blocking SDK call
        pb.collection('user_behavior_logs')
          .create(data)
          .catch(() => {})
      }
    } catch (e) {
      console.error('Failed to track event:', e)
    }
  }, 0)
}
