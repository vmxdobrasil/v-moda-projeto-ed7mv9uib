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

      if (pb.authStore.isValid && pb.authStore.token) {
        try {
          const collection = pb.authStore.record?.collectionName || 'users'
          const authData = await pb.collection(collection).authRefresh()
          set({
            user: (authData.record as unknown as User) || null,
            isAuthenticated: true,
            isInitialized: true,
          })
        } catch (err: any) {
          if (err?.status >= 400 && err?.status < 500) {
            pb.authStore.clear()
            set({ user: null, isAuthenticated: false, isInitialized: true })
            toast({
              title: 'Sessão expirada',
              description:
                'Sua sessão expirou ou os dados são inválidos. Por favor, faça login novamente.',
              variant: 'destructive',
            })
          } else {
            // Keep authenticated state for network errors or server crashes
            set({ isInitialized: true })
          }
        }
      } else {
        pb.authStore.clear()
        set({ user: null, isAuthenticated: false, isInitialized: true })
      }
    },
  }
})

export default useAuthStore
