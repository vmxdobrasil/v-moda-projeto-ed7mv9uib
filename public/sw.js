const CACHE_NAME = 'v-moda-pwa-v2'
const API_CACHE = 'v-moda-api-v2'

const urlsToCache = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE)
          .map((name) => caches.delete(name)),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (
    url.pathname.includes('/api/collections/favorites/records') ||
    url.pathname.includes('/api/collections/projects/records') ||
    url.pathname.includes('/api/collections/customers/records') ||
    url.pathname.includes('/api/collections/categories/records')
  ) {
    if (event.request.method === 'GET') {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            const clone = response.clone()
            caches.open(API_CACHE).then((cache) => cache.put(event.request, clone))
            return response
          })
          .catch(() => caches.match(event.request)),
      )
      return
    }
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
        return new Response('Offline', { status: 503 })
      })
    }),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Push Notifications Setup
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = { title: 'V MODA BRASIL', body: event.data ? event.data.text() : 'Nova notificação' }
  }

  const options = {
    body: data.body || 'Você tem uma nova notificação.',
    icon: data.icon || 'https://img.usecurling.com/i?q=v+moda+logo&color=orange',
    badge: data.badge || 'https://img.usecurling.com/i?q=v+moda+logo&color=orange',
    data: data.url || '/',
  }

  event.waitUntil(self.registration.showNotification(data.title || 'V MODA BRASIL', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow(event.notification.data))
})
