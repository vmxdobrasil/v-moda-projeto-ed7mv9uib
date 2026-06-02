const CACHE_NAME = 'v-moda-pwa-v1'
const API_CACHE = 'v-moda-api-v1'

const urlsToCache = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (
    url.pathname.includes('/api/collections/favorites/records') ||
    url.pathname.includes('/api/collections/projects/records')
  ) {
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

  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request)),
  )
})
