import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MagazineIssue {
  id: string
  productId: string
  format: 'web' | 'app'
  createdAt: string
}

interface MagazineStore {
  publishedIssues: MagazineIssue[]
  externalUrl: string
  setExternalUrl: (url: string) => void
  publishIssue: (issue: MagazineIssue) => void
  unpublishIssue: (id: string) => void
}

export const useMagazineStore = create<MagazineStore>()(
  persist(
    (set) => ({
      publishedIssues: [],
      externalUrl: 'https://www.revistamodaatual.com.br',
      setExternalUrl: (url) => set({ externalUrl: url }),
      publishIssue: (issue) =>
        set((state) => ({ publishedIssues: [issue, ...state.publishedIssues] })),
      unpublishIssue: (id) =>
        set((state) => ({ publishedIssues: state.publishedIssues.filter((i) => i.id !== id) })),
    }),
    { name: 'magazine-store' },
  ),
)
