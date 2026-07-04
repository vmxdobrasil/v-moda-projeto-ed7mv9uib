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

const getInitialState = () => {
  const isValid = pb.authStore.isValid
  return {
    user: (pb.authStore.record as unknown as User) || null,
    isAuthenticated: isValid,
    isInitialized: true,
  }
}

const useAuthStore = create<AuthState>((set) => ({
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
    set({
      user: (pb.authStore.record as unknown as User) || null,
      isAuthenticated: pb.authStore.isValid,
      isInitialized: true,
    })
  },
}))

export default useAuthStore
