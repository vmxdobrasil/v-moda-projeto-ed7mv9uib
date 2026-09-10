import pb from '@/lib/pocketbase/client'

export interface ColumnistContacts {
  whatsapp?: string
  email?: string
  website?: string
  instagram_columnist?: string
  instagram_magazine?: string
  [key: string]: string | undefined
}

export type LayoutPreset = 'balanced' | 'photo_focused' | 'text_focused'

export interface MagazineColumnRecord {
  id: string
  collectionId: string
  collectionName: string
  slug: string
  title: string
  columnist_name: string
  columnist_photo?: string
  columnist_contacts?: ColumnistContacts
  headline: string
  body_text: string
  featured_photo?: string
  featured_caption?: string
  featured_subcaption?: string
  featured_badge?: string
  photos?: string[]
  captions?: string[]
  accent_color?: string
  layout_preset?: LayoutPreset
  published: boolean
  published_at?: string
  sort_order?: number
  created: string
  updated: string
}

export interface MagazineColumnInput {
  slug: string
  title: string
  columnist_name: string
  columnist_contacts?: ColumnistContacts
  headline: string
  body_text: string
  featured_caption?: string
  featured_subcaption?: string
  featured_badge?: string
  captions?: string[]
  accent_color?: string
  layout_preset?: LayoutPreset
  published?: boolean
  published_at?: string
  sort_order?: number
}

export const magazineColumnsService = {
  async getPublishedBySlug(slug: string): Promise<MagazineColumnRecord | null> {
    try {
      const records = await pb.collection('magazine_columns').getList<MagazineColumnRecord>(1, 1, {
        filter: `slug = "${slug}" && published = true`,
        sort: '-published_at,-created',
      })
      return records.items[0] || null
    } catch (err) {
      console.error('Erro ao buscar coluna por slug:', err)
      return null
    }
  },

  async getPublishedList(limit = 20): Promise<MagazineColumnRecord[]> {
    try {
      const records = await pb
        .collection('magazine_columns')
        .getList<MagazineColumnRecord>(1, limit, {
          filter: 'published = true',
          sort: '-sort_order,-published_at,-created',
        })
      return records.items
    } catch (err) {
      console.error('Erro ao listar colunas publicadas:', err)
      return []
    }
  },

  async getAllForAdmin(): Promise<MagazineColumnRecord[]> {
    return pb.collection('magazine_columns').getFullList<MagazineColumnRecord>({
      sort: '-sort_order,-created',
    })
  },

  async getById(id: string): Promise<MagazineColumnRecord> {
    return pb.collection('magazine_columns').getOne<MagazineColumnRecord>(id)
  },

  async create(formData: FormData): Promise<MagazineColumnRecord> {
    return pb.collection('magazine_columns').create<MagazineColumnRecord>(formData)
  },

  async update(id: string, formData: FormData): Promise<MagazineColumnRecord> {
    return pb.collection('magazine_columns').update<MagazineColumnRecord>(id, formData)
  },

  async delete(id: string): Promise<boolean> {
    return pb.collection('magazine_columns').delete(id)
  },

  getFileUrl(
    record: { id: string; collectionId?: string; collectionName?: string },
    filename?: string,
  ): string {
    if (!filename) return ''
    return pb.files.getURL(record as any, filename)
  },
}
