import { create } from 'zustand'
import pb from '@/lib/pocketbase/client'

export interface User {
  id: string
  name: string
  email: string
  type?: 'Varejo' | 'Atacado' | 'Lojista Fabricante'
  manufacturerId?: string
  role?: 'manufacturer' | 'retailer' | 'affiliate' | 'agent' | 'admin'
  manufacturer_role?: 'manager' | 'operator'
  affiliate_code?: string
  unlocked_benefits?: Record<string, boolean> | null
  avatar?: string
  is_transporter?: boolean
  operating_regions?: string
  operating_cities?: string
  fashion_hubs?: string[]
  freight_commission_rate?: number
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

const isAdmin =
  pb.authStore.record?.email === 'valterpmendonca@gmail.com' ||
  pb.authStore.record?.collectionName === '_superusers'

const getInitialState = () => {
  const isValid = pb.authStore.isValid
  return {
    user: (pb.authStore.record as unknown as User) || null,
    isAuthenticated: isValid,
    isInitialized: false,
  }
}

let initPromise: Promise<void> | null = null
let hasRefreshed = false

const useAuthStore = create<AuthState>((set, get) => {
  // Sync with external auth changes (like login/logout from other tabs or components)
  pb.authStore.onChange((token, record) => {
    set({
      user: (record as unknown as User) || null,
      isAuthenticated: pb.authStore.isValid,
      isInitialized: true,
    })
  })

  return {
    ...getInitialState(),
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
      if (hasRefreshed) return
      hasRefreshed = true

      if (initPromise) {
        await initPromise
        return
      }

      initPromise = (async () => {
        const initialToken = pb.authStore.token

        if (pb.authStore.isValid && initialToken) {
          try {
            const collection = pb.authStore.record?.collectionName || 'users'

            // Bypass refresh for superusers or specific admin as they use a different flow
            if (
              collection === '_superusers' ||
              pb.authStore.record?.email === 'valterpmendonca@gmail.com'
            ) {
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
            if (err?.status === 401 && pb.authStore.token === initialToken) {
              pb.authStore.clear()
              set({ user: null, isAuthenticated: false, isInitialized: true })
            } else if (
              err?.status >= 400 &&
              err?.status < 500 &&
              pb.authStore.token === initialToken
            ) {
              set({
                isInitialized: true,
                isAuthenticated: true,
                user: (pb.authStore.record as unknown as User) || null,
              })
            } else {
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
