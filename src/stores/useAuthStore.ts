import { create } from 'zustand'
import pb from '@/lib/pocketbase/client'

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
  login: (user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const initialState = {
  user: (pb.authStore.record as unknown as User) || null,
  isAuthenticated: pb.authStore.isValid,
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
  }
})

export default useAuthStore
