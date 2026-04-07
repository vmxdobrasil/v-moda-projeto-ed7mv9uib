import { create } from 'zustand'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'

export interface User {
  id: string
  name: string
  email: string
  type?: 'Varejo' | 'Atacado' | 'Lojista Fabricante'
  manufacturerId?: string
  role?: 'manufacturer' | 'retailer' | 'affiliate'
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

const useAuthStore = create<AuthState>((set) => {
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
      if (pb.authStore.isValid) {
        try {
          const collection = pb.authStore.record?.collectionName || 'users'
          const authData = await pb.collection(collection).authRefresh()
          set({
            user: (authData.record as unknown as User) || null,
            isAuthenticated: true,
            isInitialized: true,
          })
        } catch (err: any) {
          if (err?.status === 401 || err?.status === 403 || err?.status === 404) {
            pb.authStore.clear()
            set({ user: null, isAuthenticated: false, isInitialized: true })
            toast({
              title: 'Sessão expirada',
              description: 'Sua sessão expirou. Por favor, faça login novamente.',
              variant: 'destructive',
            })
          } else {
            // Keep authenticated state if it's a transient network error
            set({ isInitialized: true })
          }
        }
      } else {
        set({ isInitialized: true })
      }
    },
  }
})

export default useAuthStore
