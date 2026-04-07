import { create } from 'zustand'
import pb from '@/lib/pocketbase/client'

export interface User {
  id: string
  name: string
  email: string
  type?: 'Varejo' | 'Atacado' | 'Lojista Fabricante'
  manufacturerId?: string
  role?: 'manufacturer' | 'retailer' | 'affiliate' | 'admin'
  affiliate_code?: string
  unlocked_benefits?: Record<string, boolean> | null
  avatar?: string
  is_transporter?: boolean
  operating_regions?: string
  operating_cities?: string
  fashion_hubs?: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
  initialize: () => Promise<void>
}

const initialState = {
  user: (pb.authStore.record as unknown as User) || null,
  isAuthenticated: pb.authStore.isValid,
  isInitialized: false,
}

let initPromise: Promise<void> | null = null

const useAuthStore = create<AuthState>((set, get) => {
  // Sync with external auth changes (like login/logout from other tabs or components)
  pb.authStore.onChange((token, record) => {
    set({
      user: (record as unknown as User) || null,
      isAuthenticated: pb.authStore.isValid,
    })
  })

  return {
    ...initialState,
    login: (user) => set({ user, isAuthenticated: true }),
    logout: () => {
      pb.authStore.clear()
      set({ user: null, isAuthenticated: false })
    },
    updateUser: (data) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),
    initialize: async () => {
      if (get().isInitialized) return
      if (initPromise) {
        await initPromise
        return
      }

      initPromise = (async () => {
        const initialToken = pb.authStore.token

        if (pb.authStore.isValid && initialToken) {
          try {
            const collection = pb.authStore.record?.collectionName || 'users'

            // Bypass refresh for superusers as they use a different flow
            if (collection === '_superusers') {
              set({
                user: (pb.authStore.record as unknown as User) || null,
                isAuthenticated: true,
                isInitialized: true,
              })
              return
            }

            const authData = await pb.collection(collection).authRefresh()
            set({
              user: (authData.record as unknown as User) || null,
              isAuthenticated: true,
              isInitialized: true,
            })
          } catch (err: any) {
            if (err?.status >= 400 && err?.status < 500) {
              // Prevent clearing the store if the user logged in concurrently
              if (pb.authStore.token === initialToken) {
                if (err.status === 401) {
                  pb.authStore.clear()
                  set({ user: null, isAuthenticated: false, isInitialized: true })
                } else {
                  // Maintain session persistence for admins or temporary errors (403/404)
                  set({
                    isInitialized: true,
                    isAuthenticated: true,
                    user: (pb.authStore.record as unknown as User) || null,
                  })
                }
              } else {
                // User logged in concurrently with a new token, keep initialized true
                set({ isInitialized: true })
              }
            } else {
              // Keep authenticated state for network errors or server crashes
              set({
                isInitialized: true,
                isAuthenticated: true,
                user: (pb.authStore.record as unknown as User) || null,
              })
            }
          }
        } else {
          // If there is no token or it is invalid locally, ensure consistency
          if (!pb.authStore.isValid || !pb.authStore.token) {
            set({ user: null, isAuthenticated: false, isInitialized: true })
          } else {
            set({ isInitialized: true })
          }
        }
      })()

      await initPromise
      initPromise = null
    },
  }
})

export default useAuthStore
