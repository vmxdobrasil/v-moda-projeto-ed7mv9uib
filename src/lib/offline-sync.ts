export interface OfflineAction {
  id: string
  method: 'POST' | 'PATCH' | 'DELETE'
  collection: string
  recordId?: string
  data?: any
}

export async function getQueue(): Promise<OfflineAction[]> {
  try {
    const queue = localStorage.getItem('offline_queue')
    return queue ? JSON.parse(queue) : []
  } catch {
    return []
  }
}

export async function removeFromQueue(id: string): Promise<void> {
  try {
    const queue = await getQueue()
    const newQueue = queue.filter((item) => item.id !== id)
    localStorage.setItem('offline_queue', JSON.stringify(newQueue))
  } catch (err) {
    console.error('Failed to remove from offline queue', err)
  }
}

export async function addToQueue(action: Omit<OfflineAction, 'id'>): Promise<void> {
  try {
    const queue = await getQueue()
    queue.push({ ...action, id: crypto.randomUUID() })
    localStorage.setItem('offline_queue', JSON.stringify(queue))
  } catch (err) {
    console.error('Failed to add to offline queue', err)
  }
}
