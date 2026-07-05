import { create } from 'zustand'

interface CrmState {
  selectedClient: any | null
  setSelectedClient: (client: any) => void
  clearSelectedClient: () => void
}

const useCrmStore = create<CrmState>((set) => ({
  selectedClient: null,
  setSelectedClient: (client) => set({ selectedClient: client }),
  clearSelectedClient: () => set({ selectedClient: null }),
}))

export default useCrmStore
