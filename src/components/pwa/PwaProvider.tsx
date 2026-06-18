import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getQueue, removeFromQueue } from '@/lib/offline-sync'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/components/ui/use-toast'

interface PwaContextType {
  updateAvailable: boolean
  updateApp: () => void
  requestPushPermission: () => Promise<boolean>
}

const PwaContext = createContext<PwaContextType>({
  updateAvailable: false,
  updateApp: () => {},
  requestPushPermission: async () => false,
})

export const usePWA = () => useContext(PwaContext)

export function PwaProvider({ children }: { children: ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                  setWaitingWorker(newWorker)
                }
              })
            }
          })
        })
        .catch((err) => console.error('SW registration failed:', err))

      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }

    const handleOnline = async () => {
      try {
        const queue = await getQueue()
        if (queue.length > 0) {
          toast({ title: 'Conexão restaurada', description: 'Sincronizando ações pendentes...' })
          for (const item of queue) {
            try {
              if (item.method === 'POST') {
                await pb.collection(item.collection).create(item.data)
              } else if (item.method === 'DELETE') {
                await pb.collection(item.collection).delete(item.recordId!)
              } else if (item.method === 'PATCH') {
                await pb.collection(item.collection).update(item.recordId!, item.data)
              }
              await removeFromQueue(item.id)
            } catch (e) {
              console.error('Sync error for item', item, e)
            }
          }
        }
      } catch (err) {
        console.error('Error processing offline queue', err)
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      } catch (e) {
        console.error('Error requesting notification permission', e)
      }
    }
    return false
  }

  return (
    <PwaContext.Provider value={{ updateAvailable, updateApp, requestPushPermission }}>
      {children}
    </PwaContext.Provider>
  )
}
