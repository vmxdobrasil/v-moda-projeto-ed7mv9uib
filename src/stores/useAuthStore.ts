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
  login: (user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
  initialize: () => Promise<void>
  syncState: (user: User | null, isAuthenticated: boolean) => void
}

const getInitialState = () => {
  return {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
  }
}

const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  login: (user) => set({ user, isAuthenticated: true, isInitialized: true }),
  logout: () => {
    pb.authStore.clear()
    set({ user: null, isAuthenticated: false, isInitialized: true })
  },
  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
  initialize: async () => {
    set({ isInitialized: true })
  },
  syncState: (user, isAuthenticated) => set({ user, isAuthenticated, isInitialized: true }),
}))

export default useAuthStore
