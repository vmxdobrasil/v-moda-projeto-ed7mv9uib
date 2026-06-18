const DB_NAME = 'v-moda-offline-sync'
const STORE_NAME = 'sync-queue'

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { autoIncrement: true, keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function queueRequest(
  collection: string,
  method: string,
  data: any,
  recordId?: string,
): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).add({
    collection,
    method,
    data,
    recordId,
    timestamp: Date.now(),
  })
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getQueue(): Promise<any[]> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const req = tx.objectStore(STORE_NAME).getAll()
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function removeFromQueue(id: number): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).delete(id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
