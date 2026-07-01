import pb from '@/lib/pocketbase/client'

export const getGlobalTopLimit = async (): Promise<number> => {
  try {
    const record = await pb
      .collection('brand_settings')
      .getFirstListItem('key = "global_top_limit"')
    return parseInt((record as any).value_text || '60', 10)
  } catch {
    return 60
  }
}

export const setGlobalTopLimit = async (limit: number) => {
  try {
    const record = await pb
      .collection('brand_settings')
      .getFirstListItem('key = "global_top_limit"')
    return pb.collection('brand_settings').update(record.id, { value_text: String(limit) })
  } catch {
    return pb.collection('brand_settings').create({
      name: 'Limite Global do TOP',
      key: 'global_top_limit',
      value_text: String(limit),
    })
  }
}

export const promoteToTop = async (brandId: string, category: string, position?: number) => {
  try {
    const cat = await pb.collection('categories').getFirstListItem(`slug = "${category}"`)
    const limit = (cat as any).ranking_limit || 0
    if (limit > 0 && !position) {
      const existing = await pb.collection('customers').getList(1, 1, {
        filter: `ranking_category = "${category}" && ranking_position > 0`,
      })
      if (existing.totalItems >= limit) {
        const brand = await pb.collection('customers').getOne(brandId)
        if ((brand as any).manufacturer) {
          await pb.collection('users').update((brand as any).manufacturer, { is_waitlisted: true })
        }
        return { waitlisted: true }
      }
    }
  } catch {
    /* intentionally ignored */
  }

  const data: Record<string, unknown> = {
    ranking_category: category,
    ranking_position: position || 0,
    is_exclusive: true,
  }
  await pb.collection('customers').update(brandId, data)

  try {
    const brand = await pb.collection('customers').getOne(brandId)
    if ((brand as any).manufacturer) {
      await pb.collection('users').update((brand as any).manufacturer, { is_waitlisted: false })
    }
  } catch {
    /* intentionally ignored */
  }

  return { waitlisted: false }
}

export const removeFromTop = async (brandId: string) => {
  return pb.collection('customers').update(brandId, {
    ranking_position: 0,
    is_exclusive: false,
  })
}
