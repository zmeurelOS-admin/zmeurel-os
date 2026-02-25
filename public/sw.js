const CACHE_VERSION = 'zmeurel-v1'
const SHELL_CACHE = `${CACHE_VERSION}-shell`
const ASSET_CACHE = `${CACHE_VERSION}-assets`

const SHELL_URLS = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-icon.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.includes('/_next/webpack-hmr') ||
    url.hostname.includes('supabase.co')
  ) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          return caches.match('/')
        })
    )
    return
  }

  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/_next/image') || /\.(?:js|css|woff2|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const copy = response.clone()
          caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
      })
    )
  }
})
