import { create } from 'zustand'

interface WhatsappStore {
  status: 'open' | 'close' | 'connecting' | 'disconnected' | 'offline' | 'auth_error'
  errorMessage: string | null
  setStatus: (
    status: 'open' | 'close' | 'connecting' | 'disconnected' | 'offline' | 'auth_error',
    errorMessage: string | null,
  ) => void
}

export const useWhatsappStore = create<WhatsappStore>((set) => ({
  status: 'disconnected',
  errorMessage: null,
  setStatus: (status, errorMessage) => set({ status, errorMessage }),
}))
