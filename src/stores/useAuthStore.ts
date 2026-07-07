import { create } from 'zustand'
import pb from '@/lib/pocketbase/client'

export interface User {
  id: string
  name: string
  email: string
  type?: 'Varejo' | 'Atacado' | 'Lojista Fabricante'
  manufacturerId?: string
  role?: 'manufacturer' | 'retailer' | 'affiliate' | 'agent' | 'admin' | 'fashionista'
  manufacturer_role?: 'manager' | 'operator'
  affiliate_code?: string
  unlocked_benefits?: Record<string, boolean> | null
  avatar?: string
  is_transporter?: boolean
  operating_regions?: string
  operating_cities?: string
  fashion_hubs?: string[]
  freight_commission_rate?: number
  collectionName?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  isHydrating: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
  initialize: () => Promise<void>
  syncState: (user: User | null, isAuthenticated: boolean, isHydrating?: boolean) => void
  setHydrating: (hydrating: boolean) => void
}

const getInitialState = () => {
  return {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    isHydrating: true,
  }
}

const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  login: (user) => set({ user, isAuthenticated: true, isInitialized: true, isHydrating: false }),
  logout: () => {
    pb.authStore.clear()
    set({ user: null, isAuthenticated: false, isInitialized: true, isHydrating: false })
  },
  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
  initialize: async () => {
    set({ isInitialized: true })
  },
  syncState: (user, isAuthenticated, isHydrating = false) =>
    set({ user, isAuthenticated, isInitialized: true, isHydrating }),
  setHydrating: (hydrating) => set({ isHydrating: hydrating }),
}))

export default useAuthStore
